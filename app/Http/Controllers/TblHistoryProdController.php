<?php

namespace App\Http\Controllers;

use App\Models\logStamp;
use App\Models\TblHistoryProd;
use App\Services\PowerAccessoriesService;
use App\Services\WarrantySearchService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TblHistoryProdController extends Controller
{
    // public function store(Request $request): JsonResponse
    // {
    //     $request->validate([
    //         'date_warranty'  => 'required|date',
    //         'serial_id'      => 'required|string',
    //         'pid'            => 'required|string',
    //         'pname'          => 'required|string',
    //         'facmodel'       => 'nullable|string',
    //         'warrantyperiod' => 'required|integer',
    //         'evidence_file'  => 'required|file|mimes:jpeg,jpg,png,gif|max:5120', 
    //     ], [
    //         'date_warranty.required' => 'กรุณาเลือกวันที่ซื้อสินค้า',
    //         'date_warranty.date'     => 'รูปแบบวันที่ไม่ถูกต้อง',
    //         'evidence_file.required' => 'กรุณาเลือกไฟล์หลักฐานการซื้อสินค้า',
    //         'evidence_file.file'     => 'ไฟล์ที่อัปโหลดไม่ถูกต้อง',
    //         'evidence_file.mimes'    => 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, JPG, PNG, GIF)',
    //         'evidence_file.max'      => 'ขนาดไฟล์ต้องไม่เกิน 5MB',
    //     ]);

    //     $dateWarranty   = Carbon::parse($request->input('date_warranty'));
    //     $now            = Carbon::now();
    //     $dateLimit      = $now->copy()->subDays(14);

    //     if ($dateWarranty->gt($now)) {
    //         return response()->json([
    //             'message' => "วันที่ซื้อ ({$dateWarranty->format('Y-m-d')}) ไม่สามารถมากกว่าวันปัจจุบัน ({$now->format('Y-m-d')}) ได้"
    //         ], 422);
    //     }

    //     $serial_id      = $request->input('serial_id');
    //     $warrantyPeriod = (int) $request->input('warrantyperiod');
    //     $expireDate     = $dateWarranty->copy()->addMonths($warrantyPeriod);

    //     logStamp::query()->create([
    //         'description' => Auth::user()->user_code . " พยายามลงทะเบียนรับประกัน $serial_id"
    //     ]);

    //     $existing = TblHistoryProd::where('serial_number', $serial_id)->first();
    //     if ($existing) {
    //         return response()->json([
    //             'message' => "Serial Number {$serial_id} ถูกลงทะเบียนแล้ว"
    //         ], 422);
    //     }

    //     $slipPath = null;
    //     $slipUrl  = null;
    //     try {
    //         if ($request->hasFile('evidence_file')) {
    //             $file     = $request->file('evidence_file');
    //             $fileName = 'slip_' . $serial_id . '_' . time() . '.' . $file->getClientOriginalExtension();
    //             $slipPath = $file->storeAs('warranty_slip', $fileName, 'public');
    //             $slipUrl = Storage::disk('public')->url($slipPath);
    //         }
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' . $e->getMessage()
    //         ], 500);
    //     }

    //     try {
    //         DB::beginTransaction();

    //         $item = TblHistoryProd::create([
    //             'serial_number'    => $serial_id,
    //             'model_code'       => $request->input('pid'),
    //             'product_name'     => $request->input('pname'),
    //             'model_name'       => $request->input('facmodel'),
    //             'buy_date'         => $dateWarranty->toDateString(),
    //             'insurance_expire' => $expireDate->toDateString(),
    //             'cust_tel'         => $request->input('cust_tel', ''),
    //             'buy_from'         => $request->input('buy_from', 'N/A'),
    //             'slip'             => $slipUrl, 
    //             'insurance'        => 'standard',
    //             'approval'         => 'Y',
    //             'status'           => 'enabled',
    //             'reward'           => 'N',
    //             'warranty_from'    => 'Service Center',
    //             'create_at'        => Carbon::now(),
    //             'updated_at'       => Carbon::now(),
    //             'updated_by'       => Auth::user()->user_code ?? null,
    //         ]);

    //         DB::commit();
    //         logStamp::query()->create([
    //             'description' => Auth::user()->user_code . " ลงทะเบียนรับประกัน $serial_id สำเร็จ"
    //         ]);

    //         return response()->json([
    //             'message'     => 'บันทึกข้อมูลเสร็จสิ้น สิ้นสุดประกันถึง ' . $expireDate->format('d/m/Y H:i:s'),
    //             'expire_date' => $expireDate->toDateString(),
    //             'data'        => $item,
    //         ], 201);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         if ($slipPath && Storage::disk('public')->exists($slipPath)) {
    //             Storage::disk('public')->delete($slipPath);
    //         }
    //         return response()->json([
    //             'message' => 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date_warranty'  => 'required|date',
            'serial_id'      => 'required|string',
            'pid'            => 'required|string',
            'pname'          => 'required|string',
            'facmodel'       => 'nullable|string',
            'warrantyperiod' => 'required|integer',
            'evidence_file'  => 'required|file|mimes:jpeg,jpg,png,gif|max:5120', 
        ], [
            'date_warranty.required' => 'กรุณาเลือกวันที่ซื้อสินค้า',
            'date_warranty.date'     => 'รูปแบบวันที่ไม่ถูกต้อง',
            'evidence_file.required' => 'กรุณาเลือกไฟล์หลักฐานการซื้อสินค้า',
            'evidence_file.file'     => 'ไฟล์ที่อัปโหลดไม่ถูกต้อง',
            'evidence_file.mimes'    => 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, JPG, PNG, GIF)',
            'evidence_file.max'      => 'ขนาดไฟล์ต้องไม่เกิน 5MB',
        ]);

        $dateWarranty   = Carbon::parse($request->input('date_warranty'));
        $now            = Carbon::now();
        $dateLimit      = $now->copy()->subDays(14);

        if ($dateWarranty->gt($now)) {
            return response()->json([
                'message' => "วันที่ซื้อ ({$dateWarranty->format('Y-m-d')}) ไม่สามารถมากกว่าวันปัจจุบัน ({$now->format('Y-m-d')}) ได้"
            ], 422);
        }

        $serial_id      = $request->input('serial_id');
        $selected_skumain = $request->input('selected_skumain');

        // Re-verify product data:
        // Detection  → getdatadup (new API) to handle multiple-skumain serials.
        // Product data → getdata   (old API) called with the selected skumain PID.
        $pid            = $request->input('pid');
        $pname          = $request->input('pname');
        $facmodel       = $request->input('facmodel');
        $warrantyPeriod = (int) $request->input('warrantyperiod');
        $otherModelCodes = [];
        try {
            $rawData     = WarrantySearchService::fetchRaw($serial_id);
            if (WarrantySearchService::hasMultipleSkumain($rawData) && !$selected_skumain) {
                return response()->json([
                    'message' => 'กรุณาเลือกสินค้าที่ต้องการลงทะเบียนก่อนบันทึก'
                ], 422);
            }
            if ($selected_skumain && !isset($rawData[$selected_skumain])) {
                return response()->json([
                    'message' => 'ไม่พบสินค้าที่เลือกในข้อมูลหมายเลขซีเรียลนี้'
                ], 422);
            }
            $selectedKey = $selected_skumain ?? array_key_first($rawData);

            // Use getdata (old API) with the selected skumain PID for authoritative product details.
            try {
                $productData    = WarrantySearchService::fetchBySkumain($selectedKey);
                $mainAsset      = ($productData['assets'][$selectedKey] ?? $productData['assets'][array_key_first($productData['assets'] ?? [])] ?? []);
                $pid            = $productData['skumain'] ?? $mainAsset['pid'] ?? $pid;
                $pname          = $mainAsset['pname'] ?? $pname;
                $facmodel       = $mainAsset['facmodel'] ?? $facmodel;
                $warrantyPeriod = (int)($mainAsset['warrantyperiod'] ?? $warrantyPeriod);
            } catch (\Exception $e) {
                // Fallback to getdatadup data if getdata call fails
                Log::warning("warranty-history.store getdata verify failed [{$selectedKey}]: " . $e->getMessage());
                $result = isset($rawData[$selectedKey]) ? $rawData[$selectedKey] : reset($rawData);
                $main   = $result['main_assets'] ?? [];
                if (!empty($main)) {
                    $pid            = $main['pid'] ?? $pid;
                    $pname          = $main['pname'] ?? $pname;
                    $facmodel       = $main['facmodel'] ?? $facmodel;
                    $warrantyPeriod = (int)($main['warrantyperiod'] ?? $warrantyPeriod);
                }
            }

            // outer key ของ rawData = skumain = model_code — เก็บของ skumain ที่ไม่ได้เลือก
            foreach ($rawData as $modelCode => $_) {
                if ($modelCode !== $selectedKey) {
                    $otherModelCodes[] = $modelCode;
                }
            }
        } catch (\Exception $e) {
            Log::warning("warranty-history.store API verify failed [{$serial_id}]: " . $e->getMessage());
            // ถ้า serial ไม่ใช่ 9999 และ API verify ล้มเหลว ให้หยุดเพื่อป้องกันบันทึกด้วยข้อมูลที่ไม่ได้รับการตรวจสอบ
            if (!str_starts_with((string) $serial_id, '9999')) {
                return response()->json([
                    'message' => 'ไม่สามารถยืนยันข้อมูลสินค้ากับระบบได้ กรุณาลองใหม่อีกครั้ง'
                ], 503);
            }
        }

        $expireDate = $dateWarranty->copy()->addMonths($warrantyPeriod);

        // รับข้อมูล power_accessories และ combo_items จาก Frontend
        $powerAccessories = json_decode($request->input('power_accessories'), true);
        $comboItems = json_decode($request->input('combo_items'), true);

        // กรอง combo_items และ power_accessories ที่ตรงกับ model_code ของ skumain อื่นออก
        if (!empty($otherModelCodes)) {
            $comboItems = array_values(array_filter(
                $comboItems ?? [],
                fn($item) => !in_array($item['pid'] ?? null, $otherModelCodes)
            ));
            foreach ($powerAccessories ?? [] as $cat => &$accList) {
                $accList = array_values(array_filter(
                    $accList,
                    fn($acc) => !in_array($acc['accessory_sku'] ?? null, $otherModelCodes)
                ));
            }
            unset($accList);
        }

        logStamp::query()->create([
            'description' => Auth::user()->user_code . " พยายามลงทะเบียนรับประกัน $serial_id"
        ]);

        // เช็คด้วย serial_number + model_code คู่กัน เพราะ serial เดียวกันอาจลงทะเบียนกับ model ต่างกันได้
        $existing = TblHistoryProd::where('serial_number', $serial_id)
            ->where('model_code', $pid)
            ->first();
        if ($existing) {
            return response()->json([
                'message' => "Serial Number {$serial_id} ได้ลงทะเบียนสินค้า {$pid} ไปแล้ว"
            ], 422);
        }

        $slipPath = null;
        $slipUrl  = null;
        try {
            if ($request->hasFile('evidence_file')) {
                $file     = $request->file('evidence_file');
                $fileName = 'slip_' . $serial_id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $slipPath = $file->storeAs('warranty_slip', $fileName, 'public');
                $slipUrl = Storage::disk('public')->url($slipPath);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' . $e->getMessage()
            ], 500);
        }

        try {
            DB::beginTransaction();

            // 1. บันทึกข้อมูลเครื่องหลัก (Main Product)
            $mainItem = TblHistoryProd::create([
                'serial_number'    => $serial_id,
                'model_code'       => $pid,
                'product_name'     => $pname,
                'model_name'       => $facmodel,
                'buy_date'         => $dateWarranty->toDateString(),
                'insurance_expire' => $expireDate->toDateString(),
                'cust_tel'         => $request->input('cust_tel', ''),
                'buy_from'         => $request->input('buy_from', 'N/A'),
                'slip'             => $slipUrl, 
                'insurance'        => 'standard',
                'approval'         => 'Y',
                'status'           => 'enabled',
                'reward'           => 'N',
                'warranty_from'    => 'Service Center',
                'create_at'        => Carbon::now(),
                'updated_at'       => Carbon::now(),
                'updated_by'       => Auth::user()->user_code ?? null,

                // หากใน DB มี 2 คอลัมน์นี้ ให้เติมไปด้วยเพื่อแยกประเภทได้ง่าย
                // 'sku_main'         => $pid,
                // 'product_type'     => 'main',
            ]);

            // 2. บันทึกข้อมูลอุปกรณ์เสริม (Accessories)
            if (!empty($powerAccessories) && is_array($powerAccessories)) {
                foreach ($powerAccessories as $category => $accList) {
                    foreach ($accList as $acc) {
                        if (PowerAccessoriesService::isRemoved($acc)) continue;

                        $accSku = $acc['accessory_sku'] ?? null;

                        if ($accSku) {
                            $accSerial = PowerAccessoriesService::resolveSerial($acc, $serial_id);
                            $accPeriod = (int)($acc['warranty_period'] ?? 0);
                            $accExpireDate = $dateWarranty->copy()->addMonths($accPeriod);

                            TblHistoryProd::create([
                                'serial_number'    => $accSerial,
                                'model_code'       => $accSku,
                                'product_name'     => $acc['product_name'] ?? '',
                                'model_name'       => $acc['product_name'] ?? '',
                                'buy_date'         => $dateWarranty->toDateString(),
                                'insurance_expire' => $accExpireDate->toDateString(),
                                'cust_tel'         => $request->input('cust_tel', ''),
                                'buy_from'         => $request->input('buy_from', 'N/A'),
                                'slip'             => $slipUrl,
                                'insurance'        => 'standard',
                                'approval'         => 'Y',
                                'status'           => 'enabled',
                                'reward'           => 'N',
                                'warranty_from'    => 'Service Center',
                                'create_at'        => Carbon::now(),
                                'updated_at'       => Carbon::now(),
                                'updated_by'       => Auth::user()->user_code ?? null,

                                // 'sku_main'         => $pid,
                                // 'product_type'     => 'accessory',
                            ]);
                        }
                    }
                }
            }

            if (!empty($comboItems) && is_array($comboItems)) {
                foreach ($comboItems as $cItem) {
                    $c_pid = $cItem['pid'] ?? null;

                    if ($c_pid) {
                        $c_period = (int)($cItem['warrantyperiod'] ?? 0);

                        // ถ้าสินค้าย่อยไม่มีระยะเวลาประกันระบุแยก ให้ยึดเวลาจากเครื่องชุดหลัก
                        if ($c_period === 0 && $warrantyPeriod > 0) {
                            $c_period = $warrantyPeriod;
                        }
                        $c_expire_date = $dateWarranty->copy()->addMonths($c_period);

                        TblHistoryProd::create([
                            'serial_number'    => $serial_id, // ใช้ซีเรียลเดียวกับเครื่องหลัก
                            'model_code'       => $c_pid,     // SKU ของสินค้าย่อยในชุด
                            'product_name'     => $cItem['pname'] ?? '',
                            'model_name'       => $cItem['facmodel'] ?? '',
                            'buy_date'         => $dateWarranty->toDateString(),
                            'insurance_expire' => $c_expire_date->toDateString(),
                            'cust_tel'         => $request->input('cust_tel', ''),
                            'buy_from'         => $request->input('buy_from', 'N/A'),
                            'slip'             => $slipUrl,
                            'insurance'        => 'standard',
                            'approval'         => 'Y',
                            'status'           => 'enabled',
                            'reward'           => 'N',
                            'warranty_from'    => 'Service Center',
                            'create_at'        => Carbon::now(),
                            'updated_at'       => Carbon::now(),
                            'updated_by'       => Auth::user()->user_code ?? null,

                            // 'sku_main'         => $pid,
                            // 'product_type'     => 'combo_item',
                        ]);
                    }
                }
            }

            DB::commit();
            logStamp::query()->create([
                'description' => Auth::user()->user_code . " ลงทะเบียนรับประกัน $serial_id สำเร็จ"
            ]);

            return response()->json([
                'message'     => 'บันทึกข้อมูลเสร็จสิ้น สิ้นสุดประกันถึง ' . $expireDate->format('d/m/Y H:i:s'),
                'expire_date' => $expireDate->toDateString(),
                'data'        => $mainItem,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            if ($slipPath && Storage::disk('public')->exists($slipPath)) {
                Storage::disk('public')->delete($slipPath);
            }
            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $e->getMessage()
            ], 500);
        }
    }
}
