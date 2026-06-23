<?php

namespace App\Services;

use App\Models\WarrantyProduct;
use App\Models\TblHistoryProd;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WarrantySearchService
{
    const API_URL = 'https://warranty-sn.pumpkin.tools/api/getdatadup';
    const GETDATA_URL = 'https://warranty-sn.pumpkin.tools/api/getdata';

    /**
     * Call getdata API with a specific skumain PID to get full product content
     * (assets, dm_list, sp, listbehavior, power_accessories, etc.).
     * Warranty dates are NOT serial-specific when called this way — inject them separately.
     *
     * @throws \Exception
     */
    public static function fetchBySkumain(string $skumain): array
    {
        $response = Http::timeout(15)->get(self::GETDATA_URL, ['search' => $skumain]);

        if (!$response->successful()) {
            throw new \Exception('API (getdata) ตอบกลับไม่สำเร็จ (HTTP ' . $response->status() . ')');
        }

        $data = $response->json();

        if (($data['status'] ?? '') !== 'SUCCESS') {
            throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้าในระบบ');
        }

        return $data;
    }

    /**
     * Two-phase lookup: use getdatadup for serial context (sn_hd, warranty dates),
     * then getdata with the selected skumain PID for full product content.
     * Returns merged result ready for fetchDataFromApi processing.
     *
     * @throws \Exception
     */
    public static function fetchMerged(string $serial, string $selectedSkumain): array
    {
        // Phase 1: getdatadup → serial-specific context
        $snHd         = [];
        $serialContext = ['warrantyexpire' => false, 'insurance_expire' => null, 'buy_date' => null];

        try {
            $rawData = self::fetchRaw($serial);
            if (isset($rawData[$selectedSkumain])) {
                $entry        = $rawData[$selectedSkumain];
                $snHd         = $entry['sn_hd'] ?? [];
                $serialContext = [
                    'warrantyexpire'   => $entry['warrantyexpire']   ?? false,
                    'insurance_expire' => $entry['insurance_expire'] ?? null,
                    'buy_date'         => $entry['buy_date']         ?? null,
                ];
            }
        } catch (\Exception $e) {
            Log::warning("WarrantySearchService::fetchMerged getdatadup failed [{$serial}]: " . $e->getMessage());
        }

        // Phase 2: getdata with skumain PID → full product content
        $data = self::fetchBySkumain($selectedSkumain);

        // Inject serial-specific context so downstream code works unchanged
        $data['sn_hd']            = $snHd;
        $data['warrantyexpire']   = $serialContext['warrantyexpire'];
        $data['insurance_expire'] = $serialContext['insurance_expire'];
        $data['buy_date']         = $serialContext['buy_date'];
        // Mark as serial search so DM-filtering logic triggers correctly
        if (!empty($snHd)) {
            $data['search_type'] = 'serial';
        }

        return $data;
    }

    /**
     * Call getdatadup API and return raw response (keyed by skumain).
     *
     * @throws \Exception
     */
    public static function fetchRaw(string $serial_id): array
    {
        $response = Http::timeout(15)->get(self::API_URL, ['search' => $serial_id]);

        Log::info("WarrantySearchService raw response for [{$serial_id}]: " . $response->body());

        if (!$response->successful()) {
            throw new \Exception('API ตอบกลับไม่สำเร็จ (HTTP ' . $response->status() . ')');
        }

        $data = $response->json();

        if (empty($data)) {
            throw new \Exception('ไม่พบหมายเลขซีเรียลในระบบ');
        }

        // Handle plain error envelope (e.g. {"status":"error","message":"..."})
        if (isset($data['status']) && $data['status'] !== 'SUCCESS') {
            throw new \Exception($data['message'] ?? 'ไม่พบหมายเลขซีเรียลในระบบ');
        }

        // Keep only entries that are skumain result objects, discarding any meta keys
        // (e.g. "status", "message") the API might mix into the same response.
        $skumainData = array_filter($data, fn($v) => is_array($v) && isset($v['skumain']));

        if (empty($skumainData)) {
            throw new \Exception($data['message'] ?? 'ไม่พบหมายเลขซีเรียลในระบบ');
        }

        return $skumainData;
    }

    public static function hasMultipleSkumain(array $data): bool
    {
        return count($data) > 1;
    }

    /**
     * Extract minimal product info from each skumain entry for the selection UI.
     */
    public static function extractOptions(array $data): array
    {
        $options = [];
        foreach ($data as $skumain => $result) {
            $main = $result['main_assets'] ?? [];
            $options[] = [
                'skumain'        => $skumain,
                'pid'            => $main['pid'] ?? $skumain,
                'pname'          => $main['pname'] ?? '',
                'facmodel'       => $main['facmodel'] ?? '',
                'brand'          => $main['brand'] ?? '',
                'imagesku'       => $main['imagesku'][0] ?? null,
                'serial'         => $main['serial'] ?? '',
                'warrantyperiod' => $main['warrantyperiod'] ?? '',
            ];
        }
        return $options;
    }

    /**
     * Process a single skumain result entry into the normalised product payload
     * the frontend expects.
     *
     * @param string|null $selectedSkumain  When provided, also fetches getdata with this PID
     *                                       for authoritative product details (old API).
     */
    public static function processResult(array $result, string $serial_id, ?string $selectedSkumain = null): array
    {
        $main = $result['main_assets'] ?? [];

        if (!empty($main)) {
            $pid              = $main['pid'] ?? ($result['skumain'] ?? '');
            $pname            = $main['pname'] ?? '';
            $facmodel         = $main['facmodel'] ?? $pid;
            $display_serial   = $main['serial'] ?? $serial_id;
            $imagesku         = $main['imagesku'][0] ?? null;
            $warrantyperiod   = $main['warrantyperiod'] ?? '';
            $warrantycondition = $main['warrantycondition'] ?? '';
            $warrantynote     = $main['warrantynote'] ?? '';
        } else {
            $assets           = $result['assets'] ?? [];
            $pid              = $result['skumain'] ?? array_key_first($assets);
            $asset            = $assets[$pid] ?? [];
            $pname            = $asset['pname'] ?? '';
            $facmodel         = $asset['facmodel'] ?? $pid;
            $display_serial   = $serial_id;
            $imagesku         = $asset['imagesku'][0] ?? null;
            $warrantyperiod   = $asset['warrantyperiod'] ?? '';
            $warrantycondition = $asset['warrantycondition'] ?? '';
            $warrantynote     = $asset['warrantynote'] ?? '';
        }

        // Enrich with getdata (old API) when a specific skumain is selected.
        // getdata is called with the skumain PID so it returns only that product's data.
        $lookupPid = $selectedSkumain ?? $pid;
        if ($lookupPid) {
            try {
                $productData = self::fetchBySkumain($lookupPid);
                $mainAsset   = ($productData['assets'][$lookupPid]
                    ?? $productData['assets'][array_key_first($productData['assets'] ?? [])]
                    ?? []);
                if (!empty($mainAsset)) {
                    $pid               = $productData['skumain'] ?? $mainAsset['pid'] ?? $pid;
                    $pname             = $mainAsset['pname']             ?? $pname;
                    $facmodel          = $mainAsset['facmodel']          ?? $facmodel;
                    $imagesku          = $mainAsset['imagesku'][0]       ?? $imagesku;
                    $warrantyperiod    = $mainAsset['warrantyperiod']    ?? $warrantyperiod;
                    $warrantycondition = $mainAsset['warrantycondition'] ?? $warrantycondition;
                    $warrantynote      = $mainAsset['warrantynote']      ?? $warrantynote;
                }
            } catch (\Exception $e) {
                Log::warning("WarrantySearchService::processResult getdata failed [{$lookupPid}]: " . $e->getMessage());
            }
        }

        [$insurance_expire, $buy_date] = self::resolveRegisteredWarrantyDates(
            $display_serial,
            $pid
        );

        [$warranty_status, $warranty_color, $warranty_text] = self::resolveWarrantyStatus(
            null,
            $insurance_expire,
            $buy_date
        );

        $sn_hd             = $result['sn_hd'] ?? null;
        $power_accessories = PowerAccessoriesService::filterForDisplay($result['power_accessories'] ?? null);

        foreach ($power_accessories as $category => &$accessories_list) {
            foreach ($accessories_list as &$acc) {
                $acc['qty'] = 1;
                if ($category === 'battery' && isset($sn_hd['batteryQty'])) {
                    $acc['qty'] = $sn_hd['batteryQty'];
                } elseif ($category === 'charger' && isset($sn_hd['chargerQty'])) {
                    $acc['qty'] = $sn_hd['chargerQty'];
                }
                $acc['image_url'] = null;
                $acc_sku = $acc['accessory_sku'] ?? null;
                if ($acc_sku) {
                    try {
                        $accResp = Http::timeout(5)->get(self::API_URL, ['search' => $acc_sku]);
                        if ($accResp->successful()) {
                            $accData     = $accResp->json();
                            $firstResult = reset($accData);
                            if ($firstResult && !empty($firstResult['main_assets']['imagesku'])) {
                                $acc['image_url'] = $firstResult['main_assets']['imagesku'][0];
                            }
                        }
                    } catch (\Exception $e) {
                        // silent — missing image is non-fatal
                    }
                }
            }
            unset($acc);
        }
        unset($accessories_list);

        $is_combo    = $result['is_combo'] ?? false;
        $combo_items = [];
        if ($is_combo && !empty($result['skuset'])) {
            foreach ($result['skuset'] as $sku_item) {
                if (isset($result['assets'][$sku_item])) {
                    $c = $result['assets'][$sku_item];
                    $combo_items[] = [
                        'pid'              => $sku_item,
                        'pname'            => $c['pname'] ?? '',
                        'facmodel'         => $c['facmodel'] ?? $sku_item,
                        'imagesku'         => $c['imagesku'][0] ?? null,
                        'warrantyperiod'   => $c['warrantyperiod'] ?? '',
                        'warrantycondition' => $c['warrantycondition'] ?? '',
                        'warrantynote'     => $c['warrantynote'] ?? '',
                    ];
                }
            }
        }

        return [
            'real_product' => [
                'pid'              => $pid,
                'pname'            => $pname,
                'facmodel'         => $facmodel,
                'serial_id'        => $display_serial,
                'imagesku'         => $imagesku,
                'warrantyperiod'   => $warrantyperiod,
                'warrantycondition' => $warrantycondition,
                'warrantynote'     => $warrantynote,
                'insurance_expire' => $insurance_expire,
                'buy_date'         => $buy_date,
                'warranty_status'  => $warranty_status,
                'power_accessories' => $power_accessories,
                'is_combo'         => $is_combo,
                'combo_items'      => $combo_items,
                'sn_hd'            => $sn_hd,
            ],
            'warranty_status'  => $warranty_status,
            'warranty_color'   => $warranty_color,
            'warranty_text'    => $warranty_text,
            'insurance_expire' => $insurance_expire,
            'buy_date'         => $buy_date,
        ];
    }

    private static function resolveWarrantyStatus($warrantyexpire, $insurance_expire, $buy_date): array
    {
        if ($warrantyexpire === true) {
            return [true, 'green', 'อยู่ในประกัน'];
        }

        if (!empty($insurance_expire)) {
            try {
                $expireDate = Carbon::parse($insurance_expire);
                return $expireDate->isFuture()
                    ? [true, 'green', 'อยู่ในประกัน']
                    : [false, 'red', 'หมดอายุการรับประกัน'];
            } catch (\Exception $e) {
                return [false, 'red', 'ไม่สามารถระบุวันหมดประกันได้'];
            }
        }

        if (!empty($buy_date)) {
            return [true, 'green', 'อยู่ในประกัน'];
        }

        return [false, 'orange', 'ยังไม่ได้ลงทะเบียนรับประกัน'];
    }

    private static function resolveRegisteredWarrantyDates(string $serial, string $pid): array
    {
        $history = TblHistoryProd::where('serial_number', $serial)
            ->where('model_code', $pid)
            ->where('status', 'enabled')
            ->orderByDesc('create_at')
            ->first();

        if ($history) {
            return [$history->insurance_expire, $history->buy_date];
        }

        $local = WarrantyProduct::where('serial_id', $serial)
            ->where('pid', $pid)
            ->first();

        if ($local) {
            return [$local->expire_date, $local->date_warranty];
        }

        return [null, null];
    }
}
