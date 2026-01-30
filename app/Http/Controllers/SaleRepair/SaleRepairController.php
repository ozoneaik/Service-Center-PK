<?php

namespace App\Http\Controllers\SaleRepair;

use App\Http\Controllers\Controller;
use App\Models\AccessoriesNote;
use App\Models\JobSaleList;         
use App\Models\CustomerInJobSale;   
use App\Models\FileUpload;
use App\Models\Remark;
use App\Models\StoreInformation;
use App\Models\WarrantyProduct;
use App\Models\Symptom;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SaleRepairController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        if ($user->role !== 'sale' && $user->role !== 'admin') {
            // กรณีที่ 1: แสดงหน้า Error 403 Forbidden
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะพนักงานขาย (Sale) เท่านั้น');

            // หรือ กรณีที่ 2: ดีดกลับไปหน้า Dashboard พร้อมข้อความแจ้งเตือน (เลือกใช้อย่างใดอย่างหนึ่ง)
            /*
            return to_route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
            */
        }

        if (isset($request->job_id)) {
            $data = $this->searchFromHistory($request->job_id);
            return Inertia::render('NewRepair/RepairSales/RepairSale', ['DATA' => $data]);
        }
        $user = Auth::user();
        $jobs = JobSaleList::query()
            ->select(
                'job_sale_lists.id',
                'job_sale_lists.job_id',
                'job_sale_lists.status_mj',
                'job_sale_lists.created_at',
                'job_sale_lists.updated_at',
                'customer_in_job_sales.shop_under_sale',
                'customer_in_job_sales.name as customer_name',
                'customer_in_job_sales.is_code_cust_id',
                'customer_in_job_sales.delivery_type',
                'store_information.shop_name as service_center_name'
            )
            ->leftJoin('customer_in_job_sales', 'job_sale_lists.job_id', '=', 'customer_in_job_sales.job_id')
            ->leftJoin('store_information', 'customer_in_job_sales.is_code_cust_id', '=', 'store_information.is_code_cust_id')
            ->where('job_sale_lists.job_id', 'LIKE', 'MJ%')
            ->where('job_sale_lists.user_key', $user->user_code)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('job_sale_lists.job_id', 'like', "%{$search}%")
                        ->orWhere('customer_in_job_sales.shop_under_sale', 'like', "%{$search}%")
                        ->orWhere('customer_in_job_sales.name', 'like', "%{$search}%")
                        ->orWhere('store_information.shop_name', 'like', "%{$search}%");
                });
            })
            ->when(
                $request->status && $request->status !== 'all',
                function ($query) use ($request) {
                    $query->where('job_sale_lists.status_mj', $request->status);
                }
            )
            ->orderBy('job_sale_lists.id', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'status' => $item->status_mj,
                    'date_job' => Carbon::parse($item->created_at)->format('d/m/Y'),
                    'mj_number' => $item->job_id,
                    'store' => $item->shop_under_sale ?? $item->customer_name ?? '-',
                    'service_center' => $item->service_center_name ?? $item->is_code_cust_id ?? '-',
                    'date_time_update' => Carbon::parse($item->updated_at)->format('d/m/Y H:i:s'),
                ];
            });

        return Inertia::render('NewRepair/RepairSales/RepairSale', [
            'jobs' => $jobs,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        if (!($user && ($user->role === 'sale' || $user->role === 'admin'))) {
            return Inertia::location(route('repair.sale.index', [
                'error' => 'คุณไม่มีสิทธิ์สร้างงานซ่อมสำหรับเซลล์',
            ]));
        }
        // return Inertia::render('NewRepair/RepairSales/CreateRepair');
        return Inertia::render('NewRepair/RepairSales/CreateRepair', [
            'user_login_name' => $user->name
        ]);
    }

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

    private function searchFromHistory($job_id)
    {
        try {
            // [แก้ไข] ใช้ JobSaleList
            $findDetail = JobSaleList::query()
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

            if (!empty($serial) && !in_array($serial, ['-', 'ไม่มีข้อมูล', 'N/A'], true)) {
                $response = $this->fetchDataFromApi(['sn' => $serial, 'views' => 'single']);
                if (!$response['status']) {
                    $response = $this->fetchDataFromApi(['pid' => $pid, 'views' => 'single']);
                }
            } else {
                $response = $this->fetchDataFromApi(['pid' => $pid, 'views' => 'single']);
            }

            if (!$response['status']) {
                throw new \Exception($response['message'] ?? 'ไม่สามารถดึงข้อมูลสินค้าได้');
            }

            $sku = $response['sku_list'][0] ?? [];
            $diagram_layers = $sku['diagram_layers'] ?? [];
            $model_options = $sku['model_options'] ?? [];
            $listbehavior = $sku['listbehavior'] ?? [];
            $active_layout = $sku['active_layout'] ?? 'outside';

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
            }

            $insurance_expire = trim($insurance_expire ?? '');
            $buy_date = trim($buy_date ?? '');
            if (in_array($insurance_expire, ['', '-', 'ไม่มีข้อมูล'], true)) $insurance_expire = null;
            if (in_array($buy_date, ['', '-', 'ไม่มีข้อมูล'], true)) $buy_date = null;

            $warranty_status = false;
            $warranty_text = 'ไม่อยู่ในประกัน';
            $warranty_color = 'red';

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
            }

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

            $sku['status'] = $findDetail['status_mj'] ?? 'pending';

            $custInJob = CustomerInJobSale::where('job_id', $job_id)->first();

            $sku['shop_under_sale_id'] = $findDetail['shop_under_sale_id'] ?? $custInJob->shop_under_sale_id ?? null;
            $sku['shop_under_sale_name'] = $findDetail['shop_under_sale_name'] ?? $custInJob->shop_under_sale ?? null;
            $sku['shop_under_sale_phone'] = $findDetail['shop_under_sale_phone'] ?? null;

            $sku['is_code_cust_id'] = $findDetail['is_code_key'] ?? $custInJob->is_code_cust_id ?? null;
            if ($sku['is_code_cust_id']) {
                $store = StoreInformation::where('is_code_cust_id', $sku['is_code_cust_id'])->first();
                $sku['service_center_name'] = $store ? $store->shop_name : null;
            }

            $sku['cust_name'] = $custInJob->name ?? null;
            $sku['cust_phone'] = $custInJob->phone ?? null;
            $sku['cust_address'] = $custInJob->address ?? null;
            $sku['delivery_type'] = $custInJob->delivery_type ?? null;
            $sku['remark'] = $custInJob->remark ?? null;

            $sku['symptom'] = Symptom::where('job_id', $job_id)->value('symptom');
            $sku['accessory_note'] = AccessoriesNote::where('job_id', $job_id)->value('note');
            $sku['internal_remark'] = Remark::where('job_id', $job_id)->value('remark');
            // $sku['file_count'] = FileUpload::where('job_id', $job_id)->where('menu_id', 1)->count();

            $filesDb = FileUpload::where('job_id', $job_id)
                ->where('menu_id', 1) // menu_id = 1 คือรูปก่อนซ่อม
                ->get(['id', 'file_path']);

            $sku['files_before'] = $filesDb->map(function ($file) {
                // ตรวจสอบว่าเป็นไฟล์วิดีโอหรือไม่ (ดูจากนามสกุลไฟล์)
                $extension = strtolower(pathinfo($file->file_path, PATHINFO_EXTENSION));
                $isVideo = in_array($extension, ['mp4', 'mov', 'avi', 'webm']);

                return [
                    'id' => $file->id,
                    // สร้าง Full URL สำหรับเข้าถึงไฟล์ใน storage link
                    'url' => asset('storage/' . $file->file_path),
                    'is_video' => $isVideo,
                    'file_path' => $file->file_path // เก็บ path เดิมไว้เผื่อใช้
                ];
            });

            return $sku;
        } catch (\Exception $e) {
            Log::error("❌ searchFromHistory Error: {$e->getMessage()}");
            return [
                'status' => false,
                'message' => $e->getMessage(),
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

            // --- เตรียมตัวแปรหลัก ---
            $assets = $data['assets'] ?? [];
            $dmList = $data['dm_list'] ?? [];
            $spAll  = $data['sp'] ?? [];
            $skuSet = $data['skuset'] ?? [];
            $skumain = $data['skumain']  ?? null;
            $isCombo  = (bool)($data['is_combo'] ?? false);

            // --- จัดการ Logic สินค้าเดี่ยว / Combo Set ---
            if ($isCombo && !empty($skuSet)) {
                $pidList = $skuSet;
            } elseif (!empty($skumain)) {
                $pidList = [$skumain];
            } elseif (!empty($sku)) {
                $pidList = [$sku];
            } else {
                $pidList = array_keys($assets);
            }

            $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
            $imageSpBase = rtrim(env('VITE_IMAGE_SP_NEW', ''), '/');

            // --- ข้อมูลประกันภาพรวม ---
            $warranty_expire  = $data['warrantyexpire']   ?? false;
            $insurance_expire = $data['insurance_expire'] ?? null;
            $buy_date         = $data['buy_date']         ?? null;

            // ตรวจสอบประกันเพิ่มเติมจาก Local DB หาก API บอกว่าหมด หรือไม่มีข้อมูล
            if (isset($formData['sn']) && !$warranty_expire) {
                $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
            }

            $skuItems            = [];
            $modelOptionsGlobal  = [];

            // --- Loop สร้างข้อมูลสินค้าแต่ละตัว (กรณี Combo มีหลายตัว) ---
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

                // --- จัดการ Diagram (DM) และ อะไหล่ (SP) ---
                if (!empty($dmList[$pidItem]) && is_array($dmList[$pidItem])) {
                    foreach ($dmList[$pidItem] as $dmKey => $dmData) {

                        // Model FG
                        $modelfg = trim($dmData['modelfg'] ?? '');
                        if ($modelfg === '') {
                            $modelfg = $facmodel ?: $pidItem;
                        }

                        $modelOptions[]       = $modelfg;
                        $modelOptionsGlobal[] = $modelfg;

                        // รูป Diagram 1-5
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

                        // อะไหล่ (SP) ของ Diagram นี้
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
                                    'price_per_unit'    => number_format((float)($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0), 2, '.', ''),
                                    'path_file'         => "{$imageSpBase}/{$spcode}.jpg",
                                ];

                                $spListAll[]        = $item;
                                $spByDm[$dmKey][]   = $item;
                            }
                        }
                    }
                }

                // ข้อมูลประกันเฉพาะตัวสินค้า
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

            // --- ผูก List Behavior เข้ากับ SKU Item ---
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

    // public function searchServiceCenters(Request $request): JsonResponse
    // {
    //     try {
    //         $search = trim($request->input('search', ''));
    //         $user = Auth::user();
    //         $userCode = $user->user_code;

    //         $stores = StoreInformation::query()
    //             ->where('sale_id', $userCode)
    //             ->when($search, function ($q) use ($search) {
    //                 $q->where(function ($sub) use ($search) {
    //                     $sub->where('shop_name', 'like', "%{$search}%")
    //                         ->orWhere('is_code_cust_id', 'like', "%{$search}%");
    //                 });
    //             })
    //             ->limit(20)
    //             ->get([
    //                 'id',
    //                 'shop_name',
    //                 'is_code_cust_id',
    //                 'phone',
    //                 'address',
    //                 'province',
    //                 'district',
    //                 'sub_district'
    //             ]);

    //         return response()->json([
    //             'status' => 'success',
    //             'data' => $stores
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Search Service Center Error: ' . $e->getMessage());
    //         return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    //     }
    // }

    public function searchServiceCenters(Request $request): JsonResponse
    {
        try {
            $search = trim($request->input('search', ''));
            $user = Auth::user();
            $userCode = $user->user_code;

            // [เพิ่ม] เช็คว่าเป็น Admin หรือไม่
            $isAdmin = $user->role === 'admin';

            // รหัสร้านค้าพิเศษ
            $specialStoreId = 'IS-CODE-001415445';

            $stores = StoreInformation::query()
                ->where(function ($query) use ($userCode, $specialStoreId, $isAdmin) {
                    // 1. ดึงร้านของ Sale คนนี้เสมอ
                    $query->where('sale_id', $userCode);

                    // 2. [เงื่อนไขเพิ่ม] ถ้าเป็น Admin ให้ดึงร้านพิเศษมาด้วย
                    if ($isAdmin) {
                        $query->orWhere('is_code_cust_id', $specialStoreId);
                    }
                })
                // เงื่อนไขการค้นหา (Search)
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($sub) use ($search) {
                        $sub->where('shop_name', 'like', "%{$search}%")
                            ->orWhere('is_code_cust_id', 'like', "%{$search}%");
                    });
                })
                // การเรียงลำดับ: ถ้าเป็น Admin ให้เอาร้านพิเศษขึ้นก่อน
                ->when($isAdmin, function ($q) use ($specialStoreId) {
                    return $q->orderByRaw("CASE WHEN is_code_cust_id = ? THEN 0 ELSE 1 END", [$specialStoreId]);
                })
                ->orderBy('shop_name', 'asc')
                ->limit(20)
                ->get([
                    'id',
                    'shop_name',
                    'is_code_cust_id',
                    'phone',
                    'address',
                    'province',
                    'district',
                    'sub_district'
                ]);

            return response()->json([
                'status' => 'success',
                'data' => $stores
            ]);
        } catch (\Exception $e) {
            Log::error('Search Service Center Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
