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

    //         // 1. ตัวแปรพื้นฐาน
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

    //         // 2. ดึงข้อมูลสินค้าหลัก
    //         if ($api_label === 'S') {
    //             // เคสค้นหาด้วย Serial
    //             $sku_arr = $response_json['skuset'] ?? [];
    //             $assets_new_format = array_map(function ($skuKey) use ($response_json) {
    //                 return $response_json['assets'][$skuKey] ?? [];
    //             }, $sku_arr);

    //             $combo_set = count($assets_new_format) > 1;
    //         } else {
    //             // เคส 9999 หรือ Product PID (จาก History)
    //             $assets_new_format = [$response_json['assets'][0] ?? []];
    //             $combo_set = false;
    //         }

    //         // 3. โหลด Diagram ให้ครบทุก pid (ทั้ง Serial / Product)
    //         foreach ($assets_new_format as $i => $asset) {
    //             $pid = $asset['pid'] ?? ($response_json['skumain'] ?? null);
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
    //                             // ตรวจว่ามี typedm เดียวหรือหลายอัน
    //                             $typedmList = collect($diagramData)->pluck('typedm')->filter()->unique()->values();
    //                             $hasSingleType = $typedmList->count() <= 1;

    //                             foreach ($diagramData as $dm) {
    //                                 $type  = $dm['typedm'] ?? 'DM01';
    //                                 $model = $dm['modelfg'] ?? ($asset['facmodel'] ?? null);

    //                                 // โหลดรูป diagram
    //                                 foreach (($dm['image'] ?? []) as $index => $img) {
    //                                     $layerChar = $img['layout'] ?? (
    //                                         str_contains(strtolower($img['namefile_dm'] ?? ''), 'inside')
    //                                         ? 'inside' : ($index === 0 ? 'outside' : 'inside')
    //                                     );

    //                                     $diagramLayers[] = [
    //                                         'modelfg'    => $model,
    //                                         'layer'      => $hasSingleType
    //                                             ? 'รูปที่ ' . ($index + 1)
    //                                             : "DM {$type} - รูปที่ " . ($index + 1),
    //                                         'path_file'  => $img['path_file'] ?? null,
    //                                         'layer_char' => strtolower($layerChar),
    //                                         'typedm'     => $type,
    //                                     ];
    //                                 }

    //                                 // Map SP → layout / typedm
    //                                 foreach (($dm['list'] ?? []) as $item) {
    //                                     $sp = $item['skusp'] ?? null;
    //                                     if (!$sp) continue;

    //                                     $layout = $item['layout'] ?? 'outside';
    //                                     if (!$layout && isset($item['namefile_dm'])) {
    //                                         $layout = str_contains(strtolower($item['namefile_dm']), 'inside')
    //                                             ? 'inside' : 'outside';
    //                                     }

    //                                     $diagramMap[$sp] = [
    //                                         'modelfg'  => $model,
    //                                         'tracking' => $item['tracking_number'] ?? null,
    //                                         'layout'   => $layout,
    //                                         'typedm'   => $type,
    //                                     ];

    //                                     if (!empty($model)) $modelOptions[] = $model;
    //                                 }
    //                             }
    //                         }
    //                     } else {
    //                         Log::warning('⚠️ Diagram API failed', [
    //                             'status' => $diagramRes->status(),
    //                             'pid' => $pid
    //                         ]);
    //                     }
    //                 } catch (\Exception $e) {
    //                     Log::error("❌ Diagram load fail for PID {$pid}: {$e->getMessage()}");
    //                 }
    //             }

    //             // 4. Map SP + ใส่ diagram เข้า asset
    //             $spList = $asset['sp'] ?? [];
    //             foreach ($spList as $k => $spItem) {
    //                 $spcode = $spItem['spcode'] ?? null;
    //                 if ($spcode && isset($diagramMap[$spcode])) {
    //                     $spList[$k]['modelfg']         = $diagramMap[$spcode]['modelfg'];
    //                     $spList[$k]['tracking_number'] = $diagramMap[$spcode]['tracking'];
    //                     $spList[$k]['layout']          = $diagramMap[$spcode]['layout'];
    //                     $spList[$k]['typedm']          = $diagramMap[$spcode]['typedm'];
    //                 } else {
    //                     $spList[$k]['modelfg']         = $asset['facmodel'] ?? null;
    //                     $spList[$k]['tracking_number'] = null;
    //                     $spList[$k]['layout']          = 'outside';
    //                     $spList[$k]['typedm']          = 'DM01';
    //                 }
    //             }

    //             $asset['sp']             = $spList;
    //             $asset['serial_id']      = $formData['sn'] ?? '9999';
    //             $asset['diagram_layers'] = $diagramLayers;
    //             $asset['model_options']  = array_values(array_unique(array_filter($modelOptions)));
    //             $asset['active_layout']  = 'outside';

    //             $assets_new_format[$i] = $asset;

    //             Log::info('🧩 [Diagram Loaded]', [
    //                 'pid' => $pid,
    //                 'diagram_count' => count($diagramLayers),
    //                 'model_options' => $asset['model_options'],
    //             ]);
    //         }

    //         $sku_list_array = $assets_new_format;

    //         // 5. ส่งข้อมูลกลับ
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

    // แก้ไขข้อมูล fetchDataFromApi ใหม่ เพิ่ม Log เวลา (วิว)
    private function fetchDataFromApi($URL, $formData, $api_label): array
    {
        $startTime = microtime(true);

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post($URL, $formData);

            $elapsed = microtime(true) - $startTime;
            $elapsedFormatted = number_format($elapsed, 2);

            Log::info('⏱️ [Main API Timing]', [
                'url' => $URL,
                'api_label' => $api_label,
                'formData' => $formData,
                'status_code' => $response->status(),
                'elapsed_seconds' => $elapsedFormatted,
            ]);

            $responseJson = $response->json();

            if (!($response->successful() && $response->status() == 200)) {
                throw new \Exception('API ตอบกลับไม่สำเร็จ');
            }

            if (($responseJson['status'] ?? '') === 'Fail') {
                throw new \Exception($responseJson['message'] ?? 'ไม่พบข้อมูลสินค้า');
            }

            if (($responseJson['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception('ไม่พบข้อมูลสินค้า');
            }

            $response_json = $responseJson;
            $warranty_expire  = $response_json['warrantyexpire']   ?? false;
            $insurance_expire = $response_json['insurance_expire'] ?? null;
            $buy_date         = $response_json['buy_date']         ?? null;

            if (isset($formData['sn']) && !$warranty_expire) {
                $warranty_expire = $this->findWarranty($formData['sn'], $warranty_expire);
            }

            $combo_set      = false;
            $sku_list_array = [];
            $DiagramApi     = env('VITE_API_DIAGRAM_NEW_TWO');

            // ตรวจว่าเป็นการค้นหาด้วย Serial หรือ PID
            if ($api_label === 'S') {
                $sku_arr = $response_json['skuset'] ?? [];
                $assets_new_format = array_map(function ($skuKey) use ($response_json) {
                    return $response_json['assets'][$skuKey] ?? [];
                }, $sku_arr);
                $combo_set = count($assets_new_format) > 1;
            } else {
                $assets_new_format = [$response_json['assets'][0] ?? []];
                $combo_set = false;
            }

            foreach ($assets_new_format as $i => $asset) {
                $pid = $asset['pid'] ?? ($response_json['skumain'] ?? null);
                $diagramLayers = [];
                $diagramMap = [];
                $modelOptions = [];

                if ($pid) {
                    try {
                        $diagramStart = microtime(true);
                        $diagramRes = Http::post($DiagramApi, [
                            'pid' => $pid,
                            'views' => 'single'
                        ]);
                        $diagramElapsed = microtime(true) - $diagramStart;

                        Log::info('🧩 [Diagram API Timing]', [
                            'pid' => $pid,
                            'elapsed_seconds' => number_format($diagramElapsed, 2),
                            'status_code' => $diagramRes->status(),
                        ]);

                        if ($diagramRes->successful()) {
                            $diagramData = $diagramRes->json();

                            if (is_array($diagramData) && count($diagramData) > 0) {
                                $typedmList = collect($diagramData)->pluck('typedm')->filter()->unique()->values();
                                $hasSingleType = $typedmList->count() <= 1;

                                foreach ($diagramData as $dm) {
                                    $type  = $dm['typedm'] ?? 'DM01';
                                    $model = $dm['modelfg'] ?? ($asset['facmodel'] ?? null);

                                    foreach (($dm['image'] ?? []) as $index => $img) {
                                        $layerChar = $img['layout'] ?? (
                                            str_contains(strtolower($img['namefile_dm'] ?? ''), 'inside')
                                            ? 'inside' : ($index === 0 ? 'outside' : 'inside')
                                        );

                                        $diagramLayers[] = [
                                            'modelfg'    => $model,
                                            'layer'      => $hasSingleType
                                                ? 'รูปที่ ' . ($index + 1)
                                                : "DM {$type} - รูปที่ " . ($index + 1),
                                            'path_file'  => $img['path_file'] ?? null,
                                            'layer_char' => strtolower($layerChar),
                                            'typedm'     => $type,
                                        ];
                                    }

                                    foreach (($dm['list'] ?? []) as $item) {
                                        $sp = $item['skusp'] ?? null;
                                        if (!$sp) continue;

                                        $layout = $item['layout'] ?? 'outside';
                                        if (!$layout && isset($item['namefile_dm'])) {
                                            $layout = str_contains(strtolower($item['namefile_dm']), 'inside')
                                                ? 'inside' : 'outside';
                                        }

                                        $diagramMap[$sp] = [
                                            'modelfg'  => $model,
                                            'tracking' => $item['tracking_number'] ?? null,
                                            'layout'   => $layout,
                                            'typedm'   => $type,
                                        ];

                                        if (!empty($model)) $modelOptions[] = $model;
                                    }
                                }
                            }
                        } else {
                            Log::warning('⚠️ Diagram API Failed', [
                                'pid' => $pid,
                                'status' => $diagramRes->status()
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error("❌ Diagram Load Fail: {$e->getMessage()}");
                    }
                }

                // Map SP + Diagram
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

                usort($spList, function ($a, $b) {
                    $aNum = is_numeric($a['tracking_number'] ?? null) ? intval($a['tracking_number']) : 99999;
                    $bNum = is_numeric($b['tracking_number'] ?? null) ? intval($b['tracking_number']) : 99999;
                    return $aNum <=> $bNum;
                });
                
                $asset['sp']             = $spList;
                $asset['serial_id']      = $formData['sn'] ?? '9999';
                $asset['diagram_layers'] = $diagramLayers;
                $asset['model_options']  = array_values(array_unique(array_filter($modelOptions)));
                if (empty($asset['model_options']) && !empty($asset['facmodel'])) {
                    $asset['model_options'] = [$asset['facmodel']];
                }
                $asset['active_layout']  = 'outside';

                $assets_new_format[$i] = $asset;
            }

            return [
                'status'          => true,
                'data_from_api'   => $responseJson,
                'combo_set'       => $combo_set,
                'sku_list'        => $assets_new_format,
                'warranty_expire' => $warranty_expire,
                'expire_date'     => $insurance_expire,
                'buy_date'        => $buy_date,
                'elapsed'         => $elapsedFormatted,
            ];
        } catch (\Exception $e) {
            $elapsed = microtime(true) - $startTime;
            Log::warning('❌ [API Error Timing]', [
                'url' => $URL,
                'api_label' => $api_label,
                'elapsed_seconds' => number_format($elapsed, 2),
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
                'sku_list' => [],
            ];
        }
    }

    //อันเดิม
    // private function searchFromHistory($job_id)
    // {
    //     try {
    //         $findDetail = JobList::query()
    //             ->where('job_id', $job_id)
    //             ->orderBy('id', 'desc')
    //             ->first();

    //         if (!$findDetail) {
    //             throw new \Exception('ไม่พบข้อมูลงานซ่อมในระบบ');
    //         }

    //         $pid = $findDetail['pid'] ?? null;
    //         $serial = $findDetail['serial_id'] ?? null;

    //         if (!$pid) {
    //             throw new \Exception('ไม่พบรหัสสินค้า (pid) ของงานซ่อมนี้');
    //         }

    //         // ดึงข้อมูลสินค้าแบบเดียวกับ search()
    //         $URL = env('VITE_API_ORDER');
    //         $formData = ['pid' => $pid, 'views' => 'single'];
    //         $api_label = 'P'; // P = Product Mode

    //         Log::info('📦 [History] เรียก fetchDataFromApi จาก History', [
    //             'job_id' => $job_id,
    //             'pid' => $pid,
    //             'serial' => $serial
    //         ]);

    //         $response = $this->fetchDataFromApi($URL, $formData, $api_label);

    //         if (!$response['status']) {
    //             throw new \Exception($response['message'] ?? 'ไม่สามารถดึงข้อมูลสินค้าได้');
    //         }

    //         // ดึง SP และ Diagram จาก API
    //         $sku = $response['sku_list'][0] ?? [];
    //         $sp = $sku['sp'] ?? [];
    //         $diagram_layers = $sku['diagram_layers'] ?? [];
    //         $model_options = $sku['model_options'] ?? [];
    //         $active_layout = $sku['active_layout'] ?? 'outside';

    //         // ผสานข้อมูลที่เคยบันทึกใน job (เช่น remark, สถานะ)
    //         $sku['job_id'] = $findDetail['job_id'];
    //         $sku['job_status'] = $findDetail['status'] ?? null;
    //         $sku['remark'] = $findDetail['remark'] ?? null;
    //         $sku['serial_id'] = $serial ?? '9999';
    //         $sku['expire_date'] = $findDetail['insurance_expire'] ?? null;
    //         $sku['diagram_layers'] = $diagram_layers;
    //         $sku['model_options'] = $model_options;
    //         $sku['active_layout'] = $active_layout;

    //         // ถ้ามีข้อมูลอะไหล่ที่เคยเลือกในงานซ่อม (เช่นจาก job_sp_list)
    //         if ($findDetail->relationLoaded('spareParts') || method_exists($findDetail, 'spareParts')) {
    //             $sku['selected_spare'] = $findDetail->spareParts ?? [];
    //         }

    //         Log::info('✅ [History] โหลดสำเร็จ', [
    //             'job_id' => $job_id,
    //             'diagram_layers' => count($diagram_layers),
    //             'model_options' => $model_options,
    //         ]);

    //         return $sku;
    //     } catch (\Exception $e) {
    //         Log::error("❌ searchFromHistory Error: {$e->getMessage()}");
    //         return [
    //             'status' => false,
    //             'message' => $e->getMessage(),
    //             'sp' => [],
    //             'diagram_layers' => [],
    //             'model_options' => [],
    //         ];
    //     }
    // }

    //อัพเดทใหม่ สถานะ (วิว)
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

            // ดึงข้อมูลสินค้าแบบเดียวกับ search()
            $URL = env('VITE_API_ORDER');
            $formData = ['pid' => $pid, 'views' => 'single'];
            $api_label = 'P';

            $response = $this->fetchDataFromApi($URL, $formData, $api_label);

            if (!$response['status']) {
                throw new \Exception($response['message'] ?? 'ไม่สามารถดึงข้อมูลสินค้าได้');
            }

            // ดึง SP และ Diagram จาก API
            $sku = $response['sku_list'][0] ?? [];
            $sp = $sku['sp'] ?? [];
            $diagram_layers = $sku['diagram_layers'] ?? [];
            $model_options = $sku['model_options'] ?? [];
            $active_layout = $sku['active_layout'] ?? 'outside';

            $insurance_expire = $findDetail['insurance_expire'] ?? ($response['expire_date'] ?? null);
            $buy_date = $response['buy_date'] ?? null;

            $insurance_expire = trim($insurance_expire ?? '');
            if ($insurance_expire === '' || $insurance_expire === 'ไม่มีข้อมูล' || $insurance_expire === '-') {
                $insurance_expire = null;
            }

            $buy_date = trim($buy_date ?? '');
            if ($buy_date === '' || $buy_date === 'ไม่มีข้อมูล' || $buy_date === '-') {
                $buy_date = null;
            }

            $warranty_status = false;
            $warranty_text = 'ไม่อยู่ในประกัน';
            $warranty_color = 'red';

            if (!empty($insurance_expire) && strtotime($insurance_expire)) {
                try {
                    $expireDate = Carbon::parse($insurance_expire);
                    if ($expireDate->isFuture()) {
                        $warranty_status = true;
                        $warranty_text = 'อยู่ในประกัน';
                        $warranty_color = 'green';
                    } else {
                        $warranty_text = 'หมดอายุการรับประกัน';
                        $warranty_color = 'red';
                    }
                } catch (\Exception $e) {
                    Log::warning("⚠️ Invalid insurance_expire value", ['value' => $insurance_expire]);
                }
            } elseif (empty($buy_date)) {
                $warranty_text = 'ยังไม่ได้ลงทะเบียนรับประกัน';
                $warranty_color = 'orange';
            } else {
                $warranty_text = 'ไม่อยู่ในประกัน';
                $warranty_color = 'red';
            }

            // ผสานข้อมูลใน job
            $sku['job_id'] = $findDetail['job_id'];
            $sku['job_status'] = $findDetail['status'] ?? null;
            $sku['remark'] = $findDetail['remark'] ?? null;
            $sku['serial_id'] = $serial ?? '9999';
            $sku['diagram_layers'] = $diagram_layers;
            $sku['model_options'] = $model_options;
            $sku['active_layout'] = $active_layout;

            // เพิ่มสถานะรับประกัน
            $sku['expire_date'] = $insurance_expire;
            $sku['buy_date'] = $buy_date;
            $sku['warranty_status'] = $warranty_status;
            $sku['warranty_text'] = $warranty_text;
            $sku['warranty_color'] = $warranty_color;

            // ถ้ามีข้อมูลอะไหล่ที่เคยเลือกในงานซ่อม
            if ($findDetail->relationLoaded('spareParts') || method_exists($findDetail, 'spareParts')) {
                $sku['selected_spare'] = $findDetail->spareParts ?? [];
            }
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
