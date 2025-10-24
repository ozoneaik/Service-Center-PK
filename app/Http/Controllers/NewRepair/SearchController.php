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

    //    function ใข้สำหรับการค้นหา ข้อมูลสินค้า
    public function search(Request $request): JsonResponse
    {
        $request->validate(['SN' => 'required'], ['SN' => 'กรุณากรอกรหัสซีเรียล']);
        $URL = env('API_DETAIL');
        $api_label = 'P'; // P = Product, S = Serial
        $formData = [];
        try {
            $req = $request->toArray();
            if ($req['SN'] === '9999') {
                if (isset($req['PID'])) {
                    $URL = env('VITE_API_ORDER');
                    $formData['pid'] = $req['PID'];
                    $formData['views'] = 'single';
                } else {
                    $status = 400;
                    $m = '<span>กรุณากรอกรหัสสินค้า<br>เนื่องจากคุณได้กรอกหมายเลขซีเรียลเป็น 9999</span>';
                    throw new \Exception($m);
                }
            } else {
                $api_label = 'S';
                $formData['sn'] = $req['SN'];
                $formData['views'] = 'single';
            }
            // ค้นหาหมายเลขซีเรียล
            $response = $this->fetchDataFromApi($URL, $formData, $api_label);
            if ($response['status']) {
                return response()->json([
                    'message' => 'ดึงข้อมูลสำเร็จ',
                    'data' => $response,
                ]);
            } else {
                $status = 400;
                throw new \Exception($response['message']);
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getFile() . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'data' => [],
            ], $status ?? 500);
        }
    }

    //อันเดิม
    // private function fetchDataFromApi($URL, $formData, $api_label): array
    // {
    //     try {
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //         ])->post($URL, $formData);
    //         $responseJson = $response->json();
    //         Log::info('API Response:', ['response' => $responseJson]);
    //         if ($response->successful() && $response->status() == 200 && $responseJson['status'] === 'SUCCESS') {
    //             $response_json = $response->json();

    //             // หาว่าในระบบได้มีการลงทะเบียนรับประกันหรือไม่
    //             $warranty_expire = $response_json['warrantyexpire'] ?? false;
    //             $insurance_expire = $response_json['insurance_expire'] ?? null;
    //             $buy_date = $response_json['buy_date'] ?? null;

    //             if (isset($formData['sn']) && !$warranty_expire) {
    //                 $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
    //             }

    //             if ($api_label === 'P') {
    //                 $sku_list = $response_json['assets'][0];
    //                 $sku_list['serial_id'] = '9999';
    //                 // $checkWarranty = WarrantyProduct::query()->select('expire_date', 'warranty_period')->where('serial_id', $formData['sn'])->first();
    //                 return [
    //                     'status' => true,
    //                     'data_from_api' => $responseJson,
    //                     'combo_set' => false,
    //                     'sku_list' => [$sku_list],
    //                     'warranty_expire' => $warranty_expire,
    //                     'expire_date' => '',
    //                     'buy_date' => $buy_date
    //                 ];
    //                 Log::info('Return Data (Product):', $result);
    //                 return $result;
    //             } else {
    //                 $sku_arr = $response_json['skuset'];
    //                 $assets_new_format = array_map(function ($sku) use ($response_json) {
    //                     return $response_json['assets'][$sku];
    //                 }, $sku_arr);
    //                 $combo_set = false;
    //                 if (count($assets_new_format) > 1) $combo_set = true;

    //                 $checkWarranty = WarrantyProduct::query()->select('expire_date', 'warranty_period')->where('serial_id', $formData['sn'])->first();

    //                 return [
    //                     'status' => true,
    //                     'data_from_api' => $responseJson,
    //                     'combo_set' => $combo_set,
    //                     'sku_list' => $assets_new_format,
    //                     'warranty_expire' => $warranty_expire,
    //                     'expire_date' => $insurance_expire,
    //                     'buy_date' => $buy_date
    //                 ];
    //                 Log::info('Return Data (Serial):', $result);
    //                 return $result;
    //             }
    //             // เช็คก่อนว่า เป็น combo set หรือไม่
    //         } else if ($response->successful() && $responseJson['status'] === 'Fail') {
    //             $m = $responseJson['message'] ?? 'ไม่พบข้อมูลสินค้า';
    //             if ($m === 'There is more than 1 row of data.') {
    //                 throw new \Exception('มีข้อมูลมากกว่า 1 แถว <br/> ติดต่อ pumpkin ได้ที่เบอร์ 02-8995928 ต่อ 266');
    //             } else {
    //                 throw new \Exception($m);
    //             }
    //         } else {
    //             $m = "<span>เกิดข้อผิดพลาด server กรุณาติดต่อผู้ดูแลระบบ <br/> เบอร์ 02-8995928 ต่อ 266</span>";
    //             throw new \Exception($m);
    //         }
    //     } catch (\Exception $e) {
    //         return [
    //             'status' => false,
    //             'message' => $e->getMessage() . $e->getLine(),
    //             'combo_set' => null,
    //             'sku_list' => null,
    //         ];
    //     }
    // }

    //ใหม่กว่า 
    // private function fetchDataFromApi($URL, $formData, $api_label): array
    // {
    //     try {

    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //         ])->post($URL, $formData);
    //         $responseJson = $response->json();
    //         Log::info('🔹 API Response (Product/Serial):', ['response' => $responseJson]);

    //         if (!($response->successful() && $response->status() == 200)) {
    //             throw new \Exception('API ตอบกลับไม่สำเร็จ');
    //         }
    //         if (($responseJson['status'] ?? '') === 'Fail') {
    //             $m = $responseJson['message'] ?? 'ไม่พบข้อมูลสินค้า';
    //             if ($m === 'There is more than 1 row of data.') {
    //                 throw new \Exception('มีข้อมูลมากกว่า 1 แถว <br/> ติดต่อ pumpkin ได้ที่เบอร์ 02-8995928 ต่อ 266');
    //             }
    //             throw new \Exception($m);
    //         }
    //         if (($responseJson['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception('ไม่พบข้อมูลสินค้า');
    //         }

    //         $response_json    = $responseJson;
    //         $warranty_expire  = $response_json['warrantyexpire']   ?? false;
    //         $insurance_expire = $response_json['insurance_expire'] ?? null;
    //         $buy_date         = $response_json['buy_date']         ?? null;

    //         if (isset($formData['sn']) && !$warranty_expire) {
    //             $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
    //         }

    //         $combo_set      = false;
    //         $sku_list_array = [];    
    //         $DiagramApi     = env('VITE_API_DIAGRAM_NEW');

    //         if ($api_label === 'P') {
    //             $asset = $response_json['assets'][0] ?? [];
    //             $pid   = $asset['pid'] ?? ($response_json['skumain'] ?? null);
    //             $diagramLayers = [];
    //             $diagramMap    = [];
    //             $activeLayout  = 'outside';

    //             if ($pid) {
    //                 try {
    //                     $diagramRes = Http::post($DiagramApi, ['pid' => $pid, 'view' => 'single']);
    //                     if ($diagramRes->successful()) {
    //                         $diagramData = $diagramRes->json();
    //                         if (is_array($diagramData)) {
    //                             foreach ($diagramData as $dm) {
    //                                 // รูป
    //                                 if (isset($dm['image']) && is_array($dm['image'])) {
    //                                     foreach ($dm['image'] as $index => $img) {
    //                                         $diagramLayers[] = [
    //                                             'layer'      => 'รูปที่ ' . ($index + 1),
    //                                             'path_file'  => $img['path_file'] ?? null,
    //                                             'layer_char' => $index === 0 ? 'outside' : 'inside',
    //                                         ];
    //                                     }
    //                                 }
    //                                 // map sp -> layout/tracking
    //                                 if (isset($dm['list']) && is_array($dm['list'])) {
    //                                     foreach ($dm['list'] as $item) {
    //                                         $sp = $item['skusp'] ?? null;
    //                                         if (!$sp) continue;
    //                                         $diagramMap[$sp] = [
    //                                             'tracking_number' => $item['tracking_number'] ?? null,
    //                                             'layout'          => isset($item['layout'])
    //                                                 ? strtolower(trim($item['layout']))
    //                                                 : 'outside',
    //                                         ];
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     } else {
    //                         Log::warning('⚠️ Diagram API failed', ['status' => $diagramRes->status(), 'pid' => $pid]);
    //                     }
    //                 } catch (\Exception $e) {
    //                     Log::error('❌ Diagram API error: ' . $e->getMessage());
    //                 }

    //                 $spList = $asset['sp'] ?? [];
    //                 foreach ($spList as $k => $spItem) {
    //                     $spcode = $spItem['spcode'] ?? null;
    //                     if ($spcode && isset($diagramMap[$spcode])) {
    //                         $spList[$k]['tracking_number'] = $diagramMap[$spcode]['tracking_number'];
    //                         $spList[$k]['layout']          = $diagramMap[$spcode]['layout'];
    //                     } else {
    //                         $spList[$k]['tracking_number'] = null;
    //                         $spList[$k]['layout']          = 'outside';
    //                     }
    //                 }
    //                 $asset['sp']        = $spList;
    //                 $asset['serial_id'] = $formData['sn'] ?? '9999';

    //                 if (!empty($diagramLayers)) {
    //                     $first = strtolower(trim($diagramLayers[0]['layer_char'] ?? 'outside'));
    //                     $activeLayout = in_array($first, ['inside', 'outside']) ? $first : 'outside';
    //                 }

    //                 $asset['diagram_layers'] = $diagramLayers;
    //                 $asset['active_layout']  = $activeLayout;

    //                 $sku_list_array = [$asset];
    //             } else {
    //                 $asset['serial_id'] = $formData['sn'] ?? '9999';
    //                 $sku_list_array     = [$asset];
    //             }
    //         } else {
    //             $sku_arr           = $response_json['skuset'] ?? [];
    //             $assets_new_format = array_map(function ($skuKey) use ($response_json) {
    //                 return $response_json['assets'][$skuKey] ?? [];
    //             }, $sku_arr);

    //             $combo_set = count($assets_new_format) > 1;

    //             foreach ($assets_new_format as $i => $asset) {
    //                 $assets_new_format[$i]['serial_id'] = $formData['sn'] ?? '9999';
    //                 // default layout ให้ทุก sp = 'outside'
    //                 $spList = $assets_new_format[$i]['sp'] ?? [];
    //                 foreach ($spList as $k => $spItem) {
    //                     $spList[$k]['tracking_number'] = null;
    //                     $spList[$k]['layout']          = 'outside';
    //                 }
    //                 $assets_new_format[$i]['sp'] = $spList;
    //             }

    //             $sku_list_array = $assets_new_format;
    //         }

    //         return [
    //             'status'          => true,
    //             'data_from_api'   => $responseJson,
    //             'combo_set'       => $combo_set,
    //             'sku_list'        => $sku_list_array,
    //             'warranty_expire' => $warranty_expire,
    //             'expire_date'     => $insurance_expire,
    //             'buy_date'        => $buy_date,
    //             // ของใหม่ (ถ้า caller อยากใช้):
    //             // หมายเหตุ: เฉพาะเคส P เราใส่ไว้ใน $asset แต่ที่ root ก็ส่งคืนได้ด้วยถ้าต้องการ
    //             // 'tracking_map'   => $diagramMap,
    //             // 'diagram_layers' => $diagramLayers,
    //             // 'active_layout'  => $activeLayout,
    //         ];
    //     } catch (\Exception $e) {
    //         Log::error('❌ fetchDataFromApi Error: ' . $e->getMessage());
    //         return [
    //             'status'         => false,
    //             'message'        => $e->getMessage(),
    //             'combo_set'      => null,
    //             'sku_list'       => null,
    //         ];
    //     }
    // }

    // ล่าสุด
    // private function fetchDataFromApi($URL, $formData, $api_label): array
    // {
    //     try {
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //         ])->post($URL, $formData);
    //         $responseJson = $response->json();
    //         Log::info('🔹 API Response (Product/Serial):', ['response' => $responseJson]);

    //         if (!($response->successful() && $response->status() == 200)) {
    //             throw new \Exception('API ตอบกลับไม่สำเร็จ');
    //         }
    //         if (($responseJson['status'] ?? '') === 'Fail') {
    //             throw new \Exception($responseJson['message'] ?? 'ไม่พบข้อมูลสินค้า');
    //         }
    //         if (($responseJson['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception('ไม่พบข้อมูลสินค้า');
    //         }

    //         $response_json    = $responseJson;
    //         $warranty_expire  = $response_json['warrantyexpire']   ?? false;
    //         $insurance_expire = $response_json['insurance_expire'] ?? null;
    //         $buy_date         = $response_json['buy_date']         ?? null;

    //         if (isset($formData['sn']) && !$warranty_expire) {
    //             $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
    //         }

    //         $combo_set      = false;
    //         $sku_list_array = [];
    //         $DiagramApi     = env('VITE_API_DIAGRAM_NEW_TWO');

    //         // ✅ เริ่มเฉพาะกรณี Product (9999)
    //         if ($api_label === 'P') {
    //             $asset = $response_json['assets'][0] ?? [];
    //             $pid   = $asset['pid'] ?? ($response_json['skumain'] ?? null);

    //             $diagramLayers = [];
    //             $diagramMap = [];
    //             $modelOptions = [];

    //             if ($pid) {
    //                 try {
    //                     $diagramRes = Http::post($DiagramApi, [
    //                         'pid' => $pid,
    //                         'views' => 'single'
    //                     ]);

    //                     if ($diagramRes->successful()) {
    //                         $diagramData = $diagramRes->json();

    //                         if (is_array($diagramData) && count($diagramData) > 0) {
    //                             // ✅ ตรวจว่ามี typedm เดียวหรือหลายอัน
    //                             $typedmList = collect($diagramData)->pluck('typedm')->filter()->unique()->values();
    //                             $hasSingleType = $typedmList->count() <= 1;

    //                             foreach ($diagramData as $dm) {
    //                                 $type = $dm['typedm'] ?? 'DM01';
    //                                 $model = $dm['modelfg'] ?? ($asset['facmodel'] ?? null);

    //                                 // ✅ เคส typedm เดียว (ใช้ inside/outside)
    //                                 if ($hasSingleType) {
    //                                     if (isset($dm['image']) && is_array($dm['image'])) {
    //                                         foreach ($dm['image'] as $index => $img) {
    //                                             $layerChar = $img['layout'] ?? (
    //                                                 str_contains(strtolower($img['namefile_dm'] ?? ''), 'inside')
    //                                                 ? 'inside' : ($index === 0 ? 'outside' : 'inside')
    //                                             );

    //                                             $diagramLayers[] = [
    //                                                 'modelfg'    => $model,
    //                                                 'layer'      => 'รูปที่ ' . ($index + 1),
    //                                                 'path_file'  => $img['path_file'] ?? null,
    //                                                 'layer_char' => strtolower($layerChar),
    //                                                 'typedm'     => 'DM01',
    //                                             ];
    //                                         }
    //                                     }

    //                                     if (isset($dm['list']) && is_array($dm['list'])) {
    //                                         foreach ($dm['list'] as $item) {
    //                                             $sp = $item['skusp'] ?? null;
    //                                             if (!$sp) continue;
    //                                             $layout = $item['layout'] ?? 'outside';
    //                                             if (!$layout && isset($item['namefile_dm'])) {
    //                                                 $layout = str_contains(strtolower($item['namefile_dm']), 'inside')
    //                                                     ? 'inside' : 'outside';
    //                                             }

    //                                             $diagramMap[$sp] = [
    //                                                 'modelfg' => $model,
    //                                                 'tracking' => $item['tracking_number'] ?? null,
    //                                                 'layout' => $layout,
    //                                                 'typedm' => 'DM01',
    //                                             ];

    //                                             if (!empty($model)) $modelOptions[] = $model;
    //                                         }
    //                                     }
    //                                 }
    //                                 // ✅ เคสมีหลาย typedm (DM01, DM02, …)
    //                                 else {
    //                                     if (isset($dm['image']) && is_array($dm['image'])) {
    //                                         foreach ($dm['image'] as $index => $img) {
    //                                             $diagramLayers[] = [
    //                                                 'modelfg'    => $model,
    //                                                 'layer'      => "DM {$type} - รูปที่ " . ($index + 1),
    //                                                 'path_file'  => $img['path_file'] ?? null,
    //                                                 'layer_char' => $index === 0 ? 'outside' : 'inside',
    //                                                 'typedm'     => $type,
    //                                             ];
    //                                         }
    //                                     }

    //                                     if (isset($dm['list']) && is_array($dm['list'])) {
    //                                         foreach ($dm['list'] as $item) {
    //                                             $sp = $item['skusp'] ?? null;
    //                                             if (!$sp) continue;
    //                                             $diagramMap[$sp] = [
    //                                                 'modelfg'  => $model,
    //                                                 'tracking' => $item['tracking_number'] ?? null,
    //                                                 'layout'   => $item['layout'] ?? 'outside',
    //                                                 'typedm'   => $type,
    //                                             ];

    //                                             if (!empty($model)) $modelOptions[] = $model;
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 } catch (\Exception $e) {
    //                     Log::error('❌ Diagram API Error: ' . $e->getMessage());
    //                 }
    //             }

    //             // ✅ ใส่ข้อมูล modelfg / layout เข้า sp
    //             $spList = $asset['sp'] ?? [];
    //             foreach ($spList as $k => $spItem) {
    //                 $spcode = $spItem['spcode'] ?? null;
    //                 if ($spcode && isset($diagramMap[$spcode])) {
    //                     $spList[$k]['modelfg']         = $diagramMap[$spcode]['modelfg'];
    //                     $spList[$k]['tracking_number'] = $diagramMap[$spcode]['tracking'];
    //                     $spList[$k]['layout']          = $diagramMap[$spcode]['layout'];
    //                 } else {
    //                     $spList[$k]['modelfg']         = $asset['facmodel'] ?? null;
    //                     $spList[$k]['tracking_number'] = null;
    //                     $spList[$k]['layout']          = 'outside';
    //                 }
    //             }

    //             $asset['sp'] = $spList;
    //             $asset['serial_id'] = $formData['sn'] ?? '9999';
    //             $asset['diagram_layers'] = $diagramLayers;
    //             $asset['model_options']  = array_values(array_unique(array_filter($modelOptions)));
    //             $asset['active_layout']  = 'outside';
    //             $sku_list_array = [$asset];
    //         }
    //         // 🔹 Serial Mode
    //         else {
    //             $sku_arr = $response_json['skuset'] ?? [];
    //             $assets_new_format = array_map(function ($skuKey) use ($response_json) {
    //                 return $response_json['assets'][$skuKey] ?? [];
    //             }, $sku_arr);

    //             $combo_set = count($assets_new_format) > 1;
    //             foreach ($assets_new_format as $i => $asset) {
    //                 $asset['serial_id'] = $formData['sn'] ?? '9999';
    //                 foreach ($asset['sp'] ?? [] as $k => $spItem) {
    //                     $asset['sp'][$k]['layout'] = 'outside';
    //                 }
    //                 $assets_new_format[$i] = $asset;
    //             }
    //             $sku_list_array = $assets_new_format;
    //         }

    //         return [
    //             'status'          => true,
    //             'data_from_api'   => $responseJson,
    //             'combo_set'       => $combo_set,
    //             'sku_list'        => $sku_list_array,
    //             'warranty_expire' => $warranty_expire,
    //             'expire_date'     => $insurance_expire,
    //             'buy_date'        => $buy_date,
    //         ];
    //     } catch (\Exception $e) {
    //         Log::error('❌ fetchDataFromApi Error: ' . $e->getMessage());
    //         return [
    //             'status'   => false,
    //             'message'  => $e->getMessage(),
    //             'sku_list' => [],
    //         ];
    //     }
    // }

    private function fetchDataFromApi($URL, $formData, $api_label): array
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($URL, $formData);

            $responseJson = $response->json();
            Log::info('🔹 API Response (Product/Serial):', ['response' => $responseJson]);

            if (!($response->successful() && $response->status() == 200)) {
                throw new \Exception('API ตอบกลับไม่สำเร็จ');
            }
            if (($responseJson['status'] ?? '') === 'Fail') {
                throw new \Exception($responseJson['message'] ?? 'ไม่พบข้อมูลสินค้า');
            }
            if (($responseJson['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception('ไม่พบข้อมูลสินค้า');
            }

            // ✅ ตัวแปรพื้นฐาน
            $response_json    = $responseJson;
            $warranty_expire  = $response_json['warrantyexpire']   ?? false;
            $insurance_expire = $response_json['insurance_expire'] ?? null;
            $buy_date         = $response_json['buy_date']         ?? null;

            if (isset($formData['sn']) && !$warranty_expire) {
                $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
            }

            $combo_set      = false;
            $sku_list_array = [];
            $DiagramApi     = env('VITE_API_DIAGRAM_NEW_TWO');

            // ---------------------------------------------------------
            // ✅ 1. ดึงข้อมูลสินค้าหลัก (จาก assets)
            // ---------------------------------------------------------
            if ($api_label === 'S') {
                // กรณีค้นหาด้วยซีเรียล
                $sku_arr = $response_json['skuset'] ?? [];
                $assets_new_format = array_map(function ($skuKey) use ($response_json) {
                    return $response_json['assets'][$skuKey] ?? [];
                }, $sku_arr);

                $combo_set = count($assets_new_format) > 1;
            } else {
                // กรณีค้นหาด้วย pid
                $assets_new_format = [$response_json['assets'][0] ?? []];
            }

            // ---------------------------------------------------------
            // ✅ 2. Loop สินค้าทั้งหมด และโหลด Diagram ให้ครบ
            // ---------------------------------------------------------
            foreach ($assets_new_format as $i => $asset) {
                $pid = $asset['pid'] ?? ($response_json['skumain'] ?? null);
                $diagramLayers = [];
                $diagramMap = [];
                $modelOptions = [];

                if ($pid) {
                    try {
                        $diagramRes = Http::post($DiagramApi, [
                            'pid' => $pid,
                            'views' => 'single'
                        ]);

                        if ($diagramRes->successful()) {
                            $diagramData = $diagramRes->json();

                            if (is_array($diagramData) && count($diagramData) > 0) {
                                // ตรวจว่ามี typedm เดียวหรือหลายอัน
                                $typedmList = collect($diagramData)->pluck('typedm')->filter()->unique()->values();
                                $hasSingleType = $typedmList->count() <= 1;

                                foreach ($diagramData as $dm) {
                                    $type = $dm['typedm'] ?? 'DM01';
                                    $model = $dm['modelfg'] ?? ($asset['facmodel'] ?? null);

                                    // ✅ เคส typedm เดียว (ใช้ inside/outside)
                                    if ($hasSingleType) {
                                        if (isset($dm['image']) && is_array($dm['image'])) {
                                            foreach ($dm['image'] as $index => $img) {
                                                $layerChar = $img['layout'] ?? (
                                                    str_contains(strtolower($img['namefile_dm'] ?? ''), 'inside')
                                                    ? 'inside' : ($index === 0 ? 'outside' : 'inside')
                                                );

                                                $diagramLayers[] = [
                                                    'modelfg'    => $model,
                                                    'layer'      => 'รูปที่ ' . ($index + 1),
                                                    'path_file'  => $img['path_file'] ?? null,
                                                    'layer_char' => strtolower($layerChar),
                                                    'typedm'     => 'DM01',
                                                ];
                                            }
                                        }

                                        if (isset($dm['list']) && is_array($dm['list'])) {
                                            foreach ($dm['list'] as $item) {
                                                $sp = $item['skusp'] ?? null;
                                                if (!$sp) continue;

                                                $layout = $item['layout'] ?? 'outside';
                                                if (!$layout && isset($item['namefile_dm'])) {
                                                    $layout = str_contains(strtolower($item['namefile_dm']), 'inside')
                                                        ? 'inside' : 'outside';
                                                }

                                                $diagramMap[$sp] = [
                                                    'modelfg' => $model,
                                                    'tracking' => $item['tracking_number'] ?? null,
                                                    'layout' => $layout,
                                                    'typedm' => 'DM01',
                                                ];

                                                if (!empty($model)) $modelOptions[] = $model;
                                            }
                                        }
                                    }
                                    // ✅ เคสมีหลาย typedm (DM01, DM02, …)
                                    else {
                                        if (isset($dm['image']) && is_array($dm['image'])) {
                                            foreach ($dm['image'] as $index => $img) {
                                                $diagramLayers[] = [
                                                    'modelfg'    => $model,
                                                    'layer'      => "DM {$type} - รูปที่ " . ($index + 1),
                                                    'path_file'  => $img['path_file'] ?? null,
                                                    'layer_char' => $index === 0 ? 'outside' : 'inside',
                                                    'typedm'     => $type,
                                                ];
                                            }
                                        }

                                        if (isset($dm['list']) && is_array($dm['list'])) {
                                            foreach ($dm['list'] as $item) {
                                                $sp = $item['skusp'] ?? null;
                                                if (!$sp) continue;
                                                $diagramMap[$sp] = [
                                                    'modelfg'  => $model,
                                                    'tracking' => $item['tracking_number'] ?? null,
                                                    'layout'   => $item['layout'] ?? 'outside',
                                                    'typedm'   => $type,
                                                ];

                                                if (!empty($model)) $modelOptions[] = $model;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (\Exception $e) {
                        Log::error('❌ Diagram API Error: ' . $e->getMessage());
                    }
                }

                // ✅ ใส่ข้อมูล modelfg / layout เข้า sp
                $spList = $asset['sp'] ?? [];
                foreach ($spList as $k => $spItem) {
                    $spcode = $spItem['spcode'] ?? null;
                    if ($spcode && isset($diagramMap[$spcode])) {
                        $spList[$k]['modelfg']         = $diagramMap[$spcode]['modelfg'];
                        $spList[$k]['tracking_number'] = $diagramMap[$spcode]['tracking'];
                        $spList[$k]['layout']          = $diagramMap[$spcode]['layout'];
                        $spList[$k]['typedm']          = $diagramMap[$spcode]['typedm'];
                    } else {
                        $spList[$k]['modelfg']         = $asset['facmodel'] ?? null;
                        $spList[$k]['tracking_number'] = null;
                        $spList[$k]['layout']          = 'outside';
                        $spList[$k]['typedm']          = 'DM01';
                    }
                }

                $asset['sp'] = $spList;
                $asset['serial_id'] = $formData['sn'] ?? '9999';
                $asset['diagram_layers'] = $diagramLayers;
                $asset['model_options']  = array_values(array_unique(array_filter($modelOptions)));
                $asset['active_layout']  = 'outside';

                $assets_new_format[$i] = $asset;

                Log::info('🧩 [Diagram Loaded]', [
                    'pid' => $pid,
                    'diagram_count' => count($diagramLayers),
                    'model_options' => $asset['model_options'],
                ]);
            }

            $sku_list_array = $assets_new_format;

            return [
                'status'          => true,
                'data_from_api'   => $responseJson,
                'combo_set'       => $combo_set,
                'sku_list'        => $sku_list_array,
                'warranty_expire' => $warranty_expire,
                'expire_date'     => $insurance_expire,
                'buy_date'        => $buy_date,
            ];
        } catch (\Exception $e) {
            Log::error('❌ fetchDataFromApi Error: ' . $e->getMessage());
            return [
                'status'   => false,
                'message'  => $e->getMessage(),
                'sku_list' => [],
            ];
        }
    }

    //อันเดิม
    // private function searchFromHistory($job_id)
    // {
    //     $findDetail = JobList::query()
    //         ->where('job_id', $job_id)
    //         ->orderBy('id', 'desc')
    //         ->first();

    //     $sp = [];
    //     $listbehavior = [];

    //     try {
    //         $search_product_from_api = Http::post(env('VITE_API_ORDER'), [
    //             'pid' => $findDetail['pid'],
    //             'views' => 'single'
    //         ]);
    //         if ($search_product_from_api->successful()) {
    //             $search_product_from_api = $search_product_from_api->json();
    //             if ($search_product_from_api['status'] == 'SUCCESS') {
    //                 $sp = $search_product_from_api['assets'][0]['sp'];
    //                 $listbehavior = $search_product_from_api['assets'][0]['listbehavior'];
    //             } else {
    //                 throw new \Exception('error');
    //             }
    //         }
    //     } catch (\Exception $e) {
    //         $sp = [];
    //         $listbehavior = [];
    //     }

    //     $findDetail['sp'] = $sp;
    //     $findDetail['listbehavior'] = $listbehavior;

    //     if ($findDetail) {
    //         $findDetail['expire_date'] = $findDetail['insurance_expire'] ?? null;
    //         $get_sku_and_behavior = [];
    //         $pid = $findDetail['pid'];
    //         return $findDetail;
    //     } else {
    //         return [];
    //     }
    // }

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

            // ✅ ดึงข้อมูลสินค้าแบบเดียวกับ search()
            $URL = env('VITE_API_ORDER');
            $formData = ['pid' => $pid, 'views' => 'single'];
            $api_label = 'P'; // P = Product Mode

            Log::info('📦 [History] เรียก fetchDataFromApi จาก History', [
                'job_id' => $job_id,
                'pid' => $pid,
                'serial' => $serial
            ]);

            $response = $this->fetchDataFromApi($URL, $formData, $api_label);

            if (!$response['status']) {
                throw new \Exception($response['message'] ?? 'ไม่สามารถดึงข้อมูลสินค้าได้');
            }

            // ✅ ดึง SP และ Diagram จาก API
            $sku = $response['sku_list'][0] ?? [];
            $sp = $sku['sp'] ?? [];
            $diagram_layers = $sku['diagram_layers'] ?? [];
            $model_options = $sku['model_options'] ?? [];
            $active_layout = $sku['active_layout'] ?? 'outside';

            // ✅ ผสานข้อมูลที่เคยบันทึกใน job (เช่น remark, สถานะ)
            $sku['job_id'] = $findDetail['job_id'];
            $sku['job_status'] = $findDetail['status'] ?? null;
            $sku['remark'] = $findDetail['remark'] ?? null;
            $sku['serial_id'] = $serial ?? '9999';
            $sku['expire_date'] = $findDetail['insurance_expire'] ?? null;
            $sku['diagram_layers'] = $diagram_layers;
            $sku['model_options'] = $model_options;
            $sku['active_layout'] = $active_layout;

            // ✅ ถ้ามีข้อมูลอะไหล่ที่เคยเลือกในงานซ่อม (เช่นจาก job_sp_list)
            if ($findDetail->relationLoaded('spareParts') || method_exists($findDetail, 'spareParts')) {
                $sku['selected_spare'] = $findDetail->spareParts ?? [];
            }

            Log::info('✅ [History] โหลดสำเร็จ', [
                'job_id' => $job_id,
                'diagram_layers' => count($diagram_layers),
                'model_options' => $model_options,
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
