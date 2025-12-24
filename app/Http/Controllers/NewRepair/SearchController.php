<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\WarrantyProduct;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        if (isset($request->job_id)) {
            $data = $this->searchFromHistory($request->job_id);
            return Inertia::render('NewRepair/Repair', ['DATA' => $data]);
        }
        return Inertia::render('NewRepair/Repair');
    }

    // function ใข้สำหรับการค้นหา ข้อมูลสินค้า
    // public function search(Request $request): JsonResponse
    // {
    //     $request->validate(['SN' => 'required'], ['SN' => 'กรุณากรอกรหัสซีเรียล']);
    //     $URL = env('API_DETAIL');
    //     $api_label = 'P'; // P = Product, S = Serial
    //     $formData = [];
    //     try {
    //         $req = $request->toArray();
    //         if ($req['SN'] === '9999') {
    //             if (isset($req['PID'])) {
    //                 $URL = env('VITE_API_ORDER');
    //                 $formData['pid'] = $req['PID'];
    //                 $formData['views'] = 'single';
    //             } else {
    //                 $status = 400;
    //                 $m = '<span>กรุณากรอกรหัสสินค้า<br>เนื่องจากคุณได้กรอกหมายเลขซีเรียลเป็น 9999</span>';
    //                 throw new \Exception($m);
    //             }
    //         } else {
    //             $api_label = 'S';
    //             $formData['sn'] = $req['SN'];
    //             $formData['views'] = 'single';
    //         }
    //         // ค้นหาหมายเลขซีเรียล
    //         $response = $this->fetchDataFromApi($URL, $formData, $api_label);
    //         if ($response['status']) {
    //             return response()->json([
    //                 'message' => 'ดึงข้อมูลสำเร็จ',
    //                 'data' => $response,
    //                 'is_combo' => $response['data_from_api']['is_combo'] ?? false,
    //                 'has_multi_dm' => $response['has_multi_dm'] ?? false,
    //             ]);
    //         } else {
    //             $status = 400;
    //             throw new \Exception($response['message']);
    //         }
    //     } catch (\Exception $e) {
    //         Log::error($e->getMessage() . $e->getFile() . $e->getLine());
    //         return response()->json([
    //             'message' => $e->getMessage(),
    //             'data' => [],
    //         ], $status ?? 500);
    //     }
    // }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['SN' => 'required'], ['SN.required' => 'กรุณากรอกรหัสซีเรียล']);

        try {
            $SN = trim($request->input('SN'));
            $PID = trim($request->input('PID', ''));

            if ($SN === '9999' && empty($PID)) {
                throw new \Exception('<span>กรุณากรอกรหัสสินค้า<br>เนื่องจากคุณได้กรอกหมายเลขซีเรียลเป็น 9999</span>');
            }

            $formData = $SN === '9999'
                ? ['pid' => $PID]
                : ['sn' => $SN];

            $response = $this->fetchDataFromApi($formData);

            if (!$response['status']) {
                throw new \Exception($response['message'] ?? 'ไม่สามารถดึงข้อมูลสินค้าได้');
            }

            if (($request->input('SN') ?? '') === '9999') {
                $response['warranty_expire'] = null;
                $response['expire_date']     = null;
                $response['buy_date']        = null;

                if (isset($response['data_from_api'])) {
                    $response['data_from_api']['warrantyexpire']   = null;
                    $response['data_from_api']['insurance_expire'] = null;
                    $response['data_from_api']['buy_date']         = null;
                }
            }

            return response()->json([
                'message' => 'ดึงข้อมูลสำเร็จ',
                'data' => $response,
                'is_combo' => $response['is_combo'] ?? false,
                'has_multi_dm' => $response['has_multi_dm'] ?? false,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Search Error: ' . $e->getMessage());
            return response()->json([
                'message' => $e->getMessage(),
                'data' => [],
            ], 400);
        }
    }

    // private function fetchDataFromApi(array $formData): array
    // {
    //     $start = microtime(true);

    //     try {
    //         $URL = env('VITE_WARRANTY_SN_API_GETDATA');

    //         $sku = $formData['pid'] ?? $formData['sn'] ?? null;
    //         if (!$sku) {
    //             throw new \Exception('ไม่พบรหัสสินค้า');
    //         }

    //         // ยิง API 
    //         $response = Http::timeout(15)->get($URL, ['search' => $sku]);
    //         $elapsed  = number_format(microtime(true) - $start, 2);

    //         Log::info('⏱️ [Warranty API]', [
    //             'sku' => $sku,
    //             'elapsed_sec' => $elapsed,
    //             'status_code' => $response->status(),
    //         ]);

    //         if (!$response->successful()) {
    //             throw new \Exception('API ตอบกลับไม่สำเร็จ');
    //         }

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้าในระบบ');
    //         }

    //         // ข้อมูลพื้นฐาน 
    //         $assets = $data['assets'] ?? [];
    //         $dmList = $data['dm_list'] ?? [];
    //         $spAll  = $data['sp'] ?? [];
    //         $skuSet = $data['skuset'] ?? [$sku];

    //         $skumain = $data['skumain'] ?? ($skuSet[0] ?? null);
    //         $mainPid = $skumain;

    //         // asset ของ pid จริง
    //         $asset = $assets[$mainPid] ?? [];
    //         if (empty($asset)) {
    //             if (isset($assets[$sku])) {
    //                 $asset = $assets[$sku];
    //             } elseif (!empty($assets)) {
    //                 $asset = reset($assets);
    //             }
    //         }

    //         $facmodel = $asset['facmodel'] ?? $mainPid;

    //         $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
    //         $imageSpBase = rtrim(env('VITE_IMAGE_SP', ''), '/');

    //         // คืนค่ารับประกัน 
    //         $warranty_expire  = $data['warrantyexpire']   ?? false;
    //         $insurance_expire = $data['insurance_expire'] ?? null;
    //         $buy_date         = $data['buy_date']         ?? null;

    //         if (isset($formData['sn']) && !$warranty_expire) {
    //             $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
    //         }

    //         // เตรียมตัวแปร
    //         $diagramLayers = [];
    //         $spListAll     = [];
    //         $spByDm        = [];  // Group spare part by DM
    //         $modelOptions  = [];

    //         // โหลด Diagram + SP แยก DM
    //         if (!empty($dmList[$mainPid]) && is_array($dmList[$mainPid])) {
    //             foreach ($dmList[$mainPid] as $dmKey => $dmData) {
    //                 // $dmType = strtoupper($dmKey); // DM01 / DM02

    //                 // $modelfg = $dmData['modelfg'] ?? $facmodel;
    //                 $modelfg = trim($dmData['modelfg'] ?? '');
    //                 if ($modelfg === '') {
    //                     // ถ้า modelfg ว่าง → fallback เป็น DM01, DM02
    //                     $modelfg = "DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT);
    //                 }
    //                 $modelOptions[] = $modelfg;

    //                 // รูป Diagram 
    //                 for ($i = 1; $i <= 5; $i++) {
    //                     $imgKey = "img_{$i}";
    //                     $imgUrl = $dmData[$imgKey] ?? null;
    //                     if (!$imgUrl) continue;
    //                     if (!str_contains($imgUrl, 'http')) {
    //                         $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
    //                     }

    //                     $diagramLayers[] = [
    //                         'pid'       => $mainPid,
    //                         'modelfg'   => $modelfg,
    //                         'layer'     => "รูปที่ {$i}",
    //                         'path_file' => $imgUrl,
    //                         'layout'    => $i,
    //                         'typedm'    => $dmKey,
    //                     ];
    //                 }

    //                 // อะไหล่ของ DM
    //                 $spByDm[$dmKey] = [];
    //                 if (!empty($spAll[$mainPid][$dmKey]) && is_array($spAll[$mainPid][$dmKey])) {
    //                     foreach ($spAll[$mainPid][$dmKey] as $sp) {
    //                         $spcode = $sp['spcode'] ?? null;
    //                         if (!$spcode) continue;

    //                         $layoutNum = (int)($sp['layout'] ?? 1);
    //                         $layoutStr = $layoutNum === 2 ? "inside" : "outside";

    //                         $item = [
    //                             'spcode'            => $spcode,
    //                             'spname'            => $sp['spname'] ?? '',
    //                             'spunit'            => $sp['spunit'] ?? 'ชิ้น',
    //                             'layout'            => $layoutStr,
    //                             'tracking_number'   => $sp['tracking_number'] ?? '',
    //                             'modelfg'           => $modelfg,
    //                             'pid'               => $mainPid,
    //                             'pname'             => $asset['pname'] ?? '',
    //                             'imagesku'          => $asset['imagesku'][0] ?? null,
    //                             'typedm'            => $dmKey,

    //                             'warranty'          => strtolower($sp['warranty'] ?? 'no'),
    //                             'sp_warranty'       => strtolower($sp['warranty'] ?? 'no') === 'yes',

    //                             'stdprice_per_unit' => number_format((float)($sp['stdprice'] ?? 0), 2, '.', ''),
    //                             'price_per_unit'    => number_format(
    //                                 (float)($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
    //                                 2,
    //                                 '.',
    //                                 ''
    //                             ),
    //                             'path_file'         => "{$imageSpBase}/{$spcode}.jpg",
    //                         ];
    //                         $spListAll[] = $item;
    //                         $spByDm[$dmKey][] = $item;
    //                     }
    //                 }
    //             }
    //         }

    //         // listbehavior
    //         $listBehavior = [];
    //         if (isset($data['listbehavior']) && is_array($data['listbehavior'])) {
    //             foreach ($data['listbehavior'] as $pidKey => $catData) {
    //                 foreach ($catData as $catName => $subCatData) {
    //                     foreach ($subCatData as $subCatName => $behaviors) {
    //                         if (is_array($behaviors)) {
    //                             foreach ($behaviors as $b) {
    //                                 $listBehavior[] = [
    //                                     'pid'          => $pidKey,
    //                                     'catalog'      => $catName,
    //                                     'subcatalog'   => $subCatName,
    //                                     'behaviorname' => $b['behaviorname'] ?? '',
    //                                     'causecode'    => $b['causecode'] ?? '',
    //                                     'causename'    => $b['causename'] ?? '',
    //                                 ];
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         // Warranty Info
    //         $warrantyperiod    = $asset['warrantyperiod']    ?? '';
    //         $warrantycondition = $asset['warrantycondition'] ?? '';
    //         $warrantynote      = $asset['warrantynote']      ?? '';
    //         $pbaseunit         = $asset['pbaseunit']         ?? 'ชิ้น';
    //         $pcatid            = $asset['pcatid']            ?? '';
    //         $pCatName          = $asset['pCatName']          ?? '';
    //         $pSubCatName       = $asset['pSubCatName']       ?? '';

    //         // model_options (DM Only) 
    //         $modelOptions = array_values(array_unique(array_filter($modelOptions)));

    //         // สรุปผล 
    //         $skuItem = [
    //             'pid'                => $mainPid,
    //             'pname'              => $asset['pname'] ?? '',
    //             'facmodel'           => $facmodel,
    //             'pbaseunit'          => $pbaseunit,
    //             'pcatid'             => $pcatid,
    //             'pCatName'           => $pCatName,
    //             'pSubCatName'        => $pSubCatName,
    //             'imagesku'           => $asset['imagesku'][0] ?? null,

    //             // NEW DM+LAYOUT + SP
    //             'diagram_layers'     => $diagramLayers,
    //             'sp'                 => $spListAll,
    //             'sp_by_dm'           => $spByDm,

    //             'model_options'      => $modelOptions,
    //             'allow_model_select' => true,
    //             'serial_id'          => $formData['sn'] ?? '9999',
    //             'active_layout'      => 'outside',

    //             // warranty
    //             'warrantyperiod'     => $warrantyperiod,
    //             'warrantycondition'  => $warrantycondition,
    //             'warrantynote'       => $warrantynote,
    //             'listbehavior'       => $listBehavior,
    //         ];

    //         return [
    //             'status'        => true,
    //             'sku_list'      => [$skuItem],
    //             'is_combo'      => ($data['is_combo'] ?? false),
    //             'has_multi_dm'  => count($modelOptions) > 1,
    //             'data_from_api' => $data,
    //             'elapsed'       => $elapsed,
    //             'listbehavior'  => $listBehavior,
    //             'warranty_expire' => $warranty_expire,
    //             'expire_date'     => $insurance_expire,
    //             'buy_date'        => $buy_date,
    //         ];
    //     } catch (\Exception $e) {
    //         Log::error('❌ fetchDataFromApi Error: ' . $e->getMessage());
    //         return [
    //             'status' => false,
    //             'message' => $e->getMessage(),
    //         ];
    //     }
    // }

    private function fetchDataFromApi(array $formData): array
    {
        $start = microtime(true);

        try {
            $URL = env('VITE_WARRANTY_SN_API_GETDATA');
            $listBehavior = [];

            $sku = $formData['pid'] ?? $formData['sn'] ?? null;
            if (!$sku) {
                throw new \Exception('ไม่พบรหัสสินค้า');
            }

            // ยิง API 
            $response = Http::timeout(15)->get($URL, ['search' => $sku]);
            $elapsed  = number_format(microtime(true) - $start, 2);

            Log::info('⏱️ [Warranty API]', [
                'sku' => $sku,
                'elapsed_sec' => $elapsed,
                'status_code' => $response->status(),
            ]);

            if (!$response->successful()) {
                throw new \Exception('API ตอบกลับไม่สำเร็จ');
            }

            $data = $response->json();
            if (($data['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้าในระบบ');
            }

            // -------------------- ดึงข้อมูลหลักจาก API --------------------
            $assets = $data['assets'] ?? [];
            $dmList = $data['dm_list'] ?? [];
            $spAll  = $data['sp'] ?? [];
            $skuSet = $data['skuset'] ?? [];
            $skumain = $data['skumain']  ?? null;
            $isCombo  = (bool)($data['is_combo'] ?? false);

            // เลือก pid ที่จะใช้สร้าง sku_list
            if ($isCombo && !empty($skuSet)) {
                // เคส Combo → ใช้ pid ทั้งหมดใน skuset
                $pidList = $skuSet;
            } elseif (!empty($skumain)) {
                $pidList = [$skumain];
            } elseif (!empty($sku)) {
                $pidList = [$sku];
            } else {
                // fallback ขั้นสุดท้าย
                $pidList = array_keys($assets);
            }

            $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
            $imageSpBase = rtrim(env('VITE_IMAGE_SP_NEW', ''), '/');

            // -------------------- ข้อมูลประกัน (ภาพรวม) --------------------
            $warranty_expire  = $data['warrantyexpire']   ?? false;
            $insurance_expire = $data['insurance_expire'] ?? null;
            $buy_date         = $data['buy_date']         ?? null;

            // ถ้าเป็นการค้นหาด้วย Serial และ API ยังไม่บอกว่าอยู่ในประกัน ลองเช็คจากตาราง WarrantyProduct เพิ่ม
            if (isset($formData['sn']) && !$warranty_expire) {
                $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
            }

            $skuItems            = [];
            $modelOptionsGlobal  = [];

            // -------------------- สร้าง sku_list แยกตาม pid --------------------
            foreach ($pidList as $pidItem) {
                $assetItem = $assets[$pidItem] ?? null;

                if (!$assetItem) {
                    Log::warning('⚠️ PID not found in assets', [
                        'pid'    => $pidItem,
                        'search' => $sku,
                    ]);
                    continue;
                }

                $facmodel = $assetItem['facmodel'] ?? $pidItem;

                $diagramLayers = [];
                $spListAll     = [];
                $spByDm        = [];
                $modelOptions  = [];

                // ---------- DM + Diagram + SP ต่อ pid ----------
                if (!empty($dmList[$pidItem]) && is_array($dmList[$pidItem])) {
                    foreach ($dmList[$pidItem] as $dmKey => $dmData) {

                        // modelfg: ถ้าว่างให้ fallback เป็น facmodel หรือ pid
                        $modelfg = trim($dmData['modelfg'] ?? '');
                        if ($modelfg === '') {
                            $modelfg = $facmodel ?: $pidItem;
                        }

                        $modelOptions[]       = $modelfg;
                        $modelOptionsGlobal[] = $modelfg;

                        // รูป diagram (img_1 - img_5)
                        for ($i = 1; $i <= 5; $i++) {
                            $imgKey = "img_{$i}";
                            $imgUrl = $dmData[$imgKey] ?? null;
                            if (!$imgUrl) continue;

                            if (!str_contains($imgUrl, 'http')) {
                                $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
                            }

                            $diagramLayers[] = [
                                'pid'       => $pidItem,
                                'modelfg'   => $modelfg,
                                'layer'     => "รูปที่ {$i}",
                                'path_file' => $imgUrl,
                                'layout'    => $i,
                                'typedm'    => $dmKey,
                                'pdf_path'  => $dmData['pdf_path'] ?? null,
                                'manual_pdf_path' => $dmData['manual_pdf_path'] ?? null,
                            ];
                        }

                        // SP ของ dmKey นี้
                        $spByDm[$dmKey] = [];
                        if (!empty($spAll[$pidItem][$dmKey]) && is_array($spAll[$pidItem][$dmKey])) {
                            foreach ($spAll[$pidItem][$dmKey] as $sp) {
                                $spcode = $sp['spcode'] ?? null;
                                if (!$spcode) continue;

                                $layoutNum = (int)($sp['layout'] ?? 1);
                                $layoutStr = $layoutNum === 2 ? "inside" : "outside";

                                $warrantyFlag = strtolower($sp['warranty'] ?? 'no');

                                $item = [
                                    'spcode'            => $spcode,
                                    'spname'            => $sp['spname'] ?? '',
                                    'spunit'            => $sp['spunit'] ?? 'ชิ้น',
                                    'layout'            => $layoutStr,
                                    'tracking_number'   => $sp['tracking_number'] ?? '',
                                    'modelfg'           => $modelfg,
                                    'pid'               => $pidItem,
                                    'pname'             => $assetItem['pname'] ?? '',
                                    'imagesku'          => $assetItem['imagesku'][0] ?? null,
                                    'typedm'            => $dmKey,

                                    'warranty'          => $warrantyFlag,
                                    'sp_warranty'       => $warrantyFlag === 'yes',

                                    'stdprice_per_unit' => number_format((float)($sp['stdprice'] ?? 0), 2, '.', ''),
                                    'price_per_unit'    => number_format(
                                        (float)($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
                                        2,
                                        '.',
                                        ''
                                    ),
                                    'path_file'         => "{$imageSpBase}/{$spcode}.jpg",
                                ];

                                $spListAll[]        = $item;
                                $spByDm[$dmKey][]   = $item;
                            }
                        }
                    }
                }

                // ---------- ข้อมูลประกันเฉพาะตัวสินค้า ----------
                $warrantyperiod    = $assetItem['warrantyperiod']    ?? '';
                $warrantycondition = $assetItem['warrantycondition'] ?? '';
                $warrantynote      = $assetItem['warrantynote']      ?? '';
                $pbaseunit         = $assetItem['pbaseunit']         ?? 'ชิ้น';
                $pcatid            = $assetItem['pcatid']            ?? '';
                $pCatName          = $assetItem['pCatName']          ?? '';
                $pSubCatName       = $assetItem['pSubCatName']       ?? '';

                $modelOptions = array_values(array_unique(array_filter($modelOptions)));

                $skuItems[] = [
                    'pid'                => $pidItem,
                    'pname'              => $assetItem['pname'] ?? '',
                    'facmodel'           => $facmodel,
                    'pbaseunit'          => $pbaseunit,
                    'pcatid'             => $pcatid,
                    'pCatName'           => $pCatName,
                    'pSubCatName'        => $pSubCatName,
                    'imagesku'           => $assetItem['imagesku'][0] ?? null,

                    'diagram_layers'     => $diagramLayers,
                    'sp'                 => $spListAll,
                    'sp_by_dm'           => $spByDm,

                    'model_options'      => $modelOptions,
                    'allow_model_select' => true,
                    'serial_id'          => $formData['sn'] ?? '9999',
                    'active_layout'      => 'outside',

                    'warrantyperiod'     => $warrantyperiod,
                    'warrantycondition'  => $warrantycondition,
                    'warrantynote'       => $warrantynote,
                ];
            }

            // -------------------- listbehavior รวมทุก pid --------------------
            // $listBehavior = [];
            // if (isset($data['listbehavior']) && is_array($data['listbehavior'])) {
            //     foreach ($data['listbehavior'] as $pidKey => $catData) {
            //         foreach ($catData as $catName => $subCatData) {
            //             foreach ($subCatData as $subCatName => $behaviors) {
            //                 if (is_array($behaviors)) {
            //                     foreach ($behaviors as $b) {
            //                         $listBehavior[] = [
            //                             'pid'          => $pidKey,
            //                             'catalog'      => $catName,
            //                             'subcatalog'   => $subCatName,
            //                             'behaviorname' => $b['behaviorname'] ?? '',
            //                             'causecode'    => $b['causecode'] ?? '',
            //                             'causename'    => $b['causename'] ?? '',
            //                         ];
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

            // ผูก listbehavior เข้าไปในแต่ละ sku ด้วย (กันไว้เผื่อใช้ฝั่งหน้าแจ้งซ่อม)
            // foreach ($skuItems as &$skuItem) {
            //     $skuItem['listbehavior'] = $listBehavior;
            // }
            // unset($skuItem);

            // -------------------- listbehavior ผูกตาม pid --------------------
            foreach ($skuItems as &$skuItem) {
                $pidItem = $skuItem['pid'];
                $behaviorForPid = [];

                if (isset($data['listbehavior'][$pidItem]) && is_array($data['listbehavior'][$pidItem])) {
                    foreach ($data['listbehavior'][$pidItem] as $catalog => $subCatData) {
                        foreach ($subCatData as $subCat => $items) {
                            foreach ($items as $item) {
                                $behaviorForPid[] = [
                                    'pid'          => $pidItem,
                                    'catalog'      => $catalog,
                                    'subcatalog'   => $subCat,
                                    'behaviorname' => $item['behaviorname'] ?? '',
                                    'causecode'    => $item['causecode'] ?? '',
                                    'causename'    => $item['causename'] ?? '',
                                ];
                            }
                        }
                    }
                }

                // ผูก behavior เฉพาะ pid นี้เข้าไป
                $skuItem['listbehavior'] = $behaviorForPid;
            }
            unset($skuItem);

            $hasMultiDm = count(array_unique(array_filter($modelOptionsGlobal))) > 1;
            return [
                'status'          => true,
                'sku_list'        => $skuItems,
                'is_combo'        => $isCombo && count($skuItems) > 1,
                'combo_set'       => $isCombo && count($skuItems) > 1,
                'has_multi_dm'    => $hasMultiDm,
                'data_from_api'   => $data,
                'elapsed'         => $elapsed,
                'listbehavior'    => $listBehavior,
                'warranty_expire' => $warranty_expire,
                'expire_date'     => $insurance_expire,
                'buy_date'        => $buy_date,
            ];
        } catch (\Exception $e) {
            Log::error('❌ fetchDataFromApi Error: ' . $e->getMessage());
            return [
                'status'  => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function searchFromHistory($job_id)
    {
        try {
            $findDetail = JobList::query()
                ->where('job_id', $job_id)
                ->orderBy('id', 'desc')
                ->first();

            if (!$findDetail) {
                throw new \Exception('ไม่พบข้อมูลงานซ่อมในระบบ');
            }

            $pid = $findDetail['pid'] ?? null;
            $serial = $findDetail['serial_id'] ?? null;

            if (!$pid) {
                throw new \Exception('ไม่พบรหัสสินค้า (pid) ของงานซ่อมนี้');
            }

            // ค้นหาด้วย serial ก่อน ถ้าไม่เจอ fallback ด้วย pid
            if (!empty($serial) && !in_array($serial, ['-', 'ไม่มีข้อมูล', 'N/A'], true)) {
                $response = $this->fetchDataFromApi([
                    'sn' => $serial,
                    'views' => 'single',
                ]);
                if (!$response['status']) {
                    Log::warning('🔁 serial search failed, retrying with pid', [
                        'serial' => $serial,
                        'pid' => $pid,
                    ]);
                    $response = $this->fetchDataFromApi([
                        'pid' => $pid,
                        'views' => 'single',
                    ]);
                }
            } else {
                $response = $this->fetchDataFromApi([
                    'pid' => $pid,
                    'views' => 'single',
                ]);
            }

            if (!$response['status']) {
                throw new \Exception($response['message'] ?? 'ไม่สามารถดึงข้อมูลสินค้าได้');
            }

            // Extract ข้อมูลสินค้า
            $sku = $response['sku_list'][0] ?? [];
            $sp = $sku['sp'] ?? [];
            $diagram_layers = $sku['diagram_layers'] ?? [];
            $model_options = $sku['model_options'] ?? [];
            $active_layout = $sku['active_layout'] ?? 'outside';

            // $listbehavior = $response['listbehavior'] ?? [];

            //ผูก behavior เฉพาะ pid นี้เข้าไป
            $listbehavior = $sku['listbehavior'] ?? [];

            // ดึงค่ารับประกัน
            $warranty_expire  = $response['warranty_expire'] ?? null;
            $insurance_expire = $response['expire_date'] ?? $findDetail['insurance_expire'] ?? null;
            $buy_date         = $response['buy_date'] ?? $findDetail['buy_date'] ?? null;
            $warrantyexpire   = $response['data_from_api']['warrantyexpire'] ?? null;

            if (!empty($serial) && str_starts_with($serial, '9999')) {

                $warranty_expire = null;
                $insurance_expire = null;
                $buy_date = null;
                $warrantyexpire = false;

                if (isset($response['data_from_api'])) {
                    $response['data_from_api']['warrantyexpire']   = null;
                    $response['data_from_api']['insurance_expire'] = null;
                    $response['data_from_api']['buy_date']         = null;
                }

                Log::info('🔧 Apply 9999 warranty reset in history mode', [
                    'serial' => $serial,
                ]);
            }

            // Normalize
            $insurance_expire = trim($insurance_expire ?? '');
            $buy_date = trim($buy_date ?? '');
            if (in_array($insurance_expire, ['', '-', 'ไม่มีข้อมูล'], true)) $insurance_expire = null;
            if (in_array($buy_date, ['', '-', 'ไม่มีข้อมูล'], true)) $buy_date = null;

            // ตรวจสถานะประกัน
            $warranty_status = false;
            $warranty_text = 'ไม่อยู่ในประกัน';
            $warranty_color = 'red';

            // ถ้าไม่มีวันหมดประกัน + ไม่มีวันซื้อ = ยังไม่ได้ลงทะเบียน
            if (empty($insurance_expire) && empty($buy_date)) {
                $warranty_status = false;
                $warranty_text = 'ยังไม่ได้ลงทะเบียนรับประกัน';
                $warranty_color = 'orange';
            } elseif ($warrantyexpire === true) {
                $warranty_status = true;
                $warranty_text = 'อยู่ในประกัน';
                $warranty_color = 'green';
            } elseif (!empty($insurance_expire) && strtotime($insurance_expire)) {
                try {
                    $expireDate = Carbon::parse($insurance_expire);
                    if ($expireDate->isFuture()) {
                        $warranty_status = true;
                        $warranty_text = 'อยู่ในประกัน';
                        $warranty_color = 'green';
                    } else {
                        $warranty_status = false;
                        $warranty_text = 'หมดอายุการรับประกัน';
                        $warranty_color = 'red';
                    }
                } catch (\Exception $e) {
                }
            } else {
                $warranty_status = false;
                $warranty_text = 'ไม่อยู่ในประกัน';
                $warranty_color = 'red';
            }

            // รวมข้อมูลทั้งหมด
            $sku['job_id'] = $findDetail['job_id'];
            $sku['job_status'] = $findDetail['status'] ?? null;
            $sku['remark'] = $findDetail['remark'] ?? null;
            $sku['serial_id'] = (string) ($serial ?? '9999');
            $sku['diagram_layers'] = $diagram_layers;
            $sku['model_options'] = $model_options;
            $sku['listbehavior'] = $listbehavior;
            $sku['active_layout'] = $active_layout;
            $sku['warranty_status'] = $warranty_status;
            $sku['warranty_text'] = $warranty_text;
            $sku['warranty_color'] = $warranty_color;
            $sku['expire_date'] = $insurance_expire;
            $sku['buy_date'] = $buy_date;

            Log::info('✅ searchFromHistory done', [
                'job_id' => $job_id,
                'serial' => $serial,
                'pid' => $pid,
                'warrantyexpire' => $warrantyexpire,
                'expire' => $insurance_expire,
                'buy_date' => $buy_date,
                'text' => $warranty_text,
            ]);

            return $sku;
        } catch (\Exception $e) {
            Log::error("❌ searchFromHistory Error: {$e->getMessage()}");
            return [
                'status' => false,
                'message' => $e->getMessage(),
                'sp' => [],
                'diagram_layers' => [],
                'model_options' => [],
            ];
        }
    }


    private function findWarranty($serial_id, $warranty_expire = false)
    {
        $findWarranty = WarrantyProduct::query()->where('serial_id', $serial_id)->first();
        if ($findWarranty) {
            $dateWarranty = Carbon::parse($findWarranty->date_warranty);
            $expireDate = Carbon::parse($findWarranty->expire_date);
            $now = Carbon::now();
            if ($now->greaterThanOrEqualTo($dateWarranty) && $now->lessThanOrEqualTo($expireDate)) {
                return true;
            } else return false;
        } else $warranty_expire;
    }
}
