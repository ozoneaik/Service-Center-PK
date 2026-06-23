<?php

namespace App\Http\Controllers;

use App\Models\logStamp;
use App\Models\WarrantyProduct;
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

class WarrantyProductController extends Controller
{
    public function index(): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ลงทะเบียนรับประกัน"]);
        return Inertia::render('Warranty/WrForm');
    }

    // public function search(Request $request): JsonResponse
    // {
    //     $request->validate(['serial_id' => 'required'], [
    //         'serial_id.required' => 'กรุณากรอกหมายเลขซีเรียล (Serial ID)',
    //     ]);

    //     $serial_id = trim($request->input('serial_id'));

    //     logStamp::query()->create([
    //         'description' => Auth::user()->user_code . " ค้นหาหมายเลขซีเรียล {$serial_id} ในหน้าลงทะเบียนรับประกัน"
    //     ]);

    //     try {
    //         $start = microtime(true);
    //         $URL = env('VITE_WARRANTY_SN_API_GETDATA');

    //         $response = Http::timeout(15)->get($URL, ['search' => $serial_id]);
    //         $elapsed = number_format(microtime(true) - $start, 2);

    //         if (!$response->successful()) {
    //             throw new \Exception('API ตอบกลับไม่สำเร็จ');
    //         }

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception($data['message'] ?? 'ไม่พบหมายเลขซีเรียลในระบบ');
    //         }

    //         if (!str_contains($data['search_type'] ?? '', 'serial')) {
    //             throw new \Exception('ระบบอนุญาตให้ค้นหาด้วยหมายเลขซีเรียล (Serial) เท่านั้น');
    //         }

    //         // --- เริ่มแก้: ดึงข้อมูลจาก main_assets ก่อน ---
    //         $main_assets = $data['main_assets'] ?? [];
    //         $main_serial = $main_assets['serial'] ?? null;

    //         // ตรวจสอบว่ามี main_assets และ Serial ที่หามาไม่ตรงกับ Serial หลัก (แสดงว่าค้นหาด้วย Serial อะไหล่)
    //         if (!empty($main_assets) && !empty($main_serial) && $serial_id !== $main_serial) {
    //             $pid = $main_assets['pid'] ?? ($data['skumain'] ?? '');
    //             $pname = $main_assets['pname'] ?? '';
    //             $facmodel = $main_assets['facmodel'] ?? $pid;
    //             $display_serial = $main_serial; // บังคับใช้ Serial ของเครื่องหลัก
    //             $imagesku = $main_assets['imagesku'][0] ?? null;
    //             $warrantyperiod = $main_assets['warrantyperiod'] ?? '';
    //             $warrantycondition = $main_assets['warrantycondition'] ?? '';
    //             $warrantynote = $main_assets['warrantynote'] ?? '';
    //         } else {
    //             // กรณีค้นหาตรงกับเครื่องหลักอยู่แล้ว หรือไม่มีชุด main_assets
    //             $assets = $data['assets'] ?? [];
    //             $pid = $data['skumain'] ?? array_key_first($assets);
    //             $asset = $assets[$pid] ?? [];

    //             $pname = $asset['pname'] ?? '';
    //             $facmodel = $asset['facmodel'] ?? $pid;
    //             $display_serial = $serial_id; // ใช้ Serial เดิมที่ค้นหา
    //             $imagesku = $asset['imagesku'][0] ?? null;
    //             $warrantyperiod = $asset['warrantyperiod'] ?? '';
    //             $warrantycondition = $asset['warrantycondition'] ?? '';
    //             $warrantynote = $asset['warrantynote'] ?? '';
    //         }
    //         // --- จบแก้ ---

    //         $insurance_expire = $data['insurance_expire'] ?? null;
    //         $buy_date = $data['buy_date'] ?? null;

    //         // แก้ไข: เช็ค local DB เช็คจาก $display_serial (เครื่องหลัก) เพื่อให้ได้ข้อมูลที่แม่นยำ
    //         if (empty($insurance_expire) || empty($buy_date)) {
    //             $local = WarrantyProduct::where('serial_id', $display_serial)->first();
    //             if ($local) {
    //                 $insurance_expire = $insurance_expire ?: $local->expire_date;
    //                 $buy_date = $buy_date ?: $local->date_warranty;
    //             }
    //         }

    //         $warranty_status = false;
    //         $warranty_color = 'red';
    //         $warranty_text = 'ไม่อยู่ในประกัน';

    //         $warrantyexpire = $data['warrantyexpire'] ?? null;

    //         if ($warrantyexpire === true) {
    //             $warranty_status = true;
    //             $warranty_color = 'green';
    //             $warranty_text = 'อยู่ในประกัน';
    //         } elseif (!empty($insurance_expire)) {
    //             //  ถ้าไม่มี warrantyexpire แต่มีวันหมดประกัน → เช็ควัน
    //             try {
    //                 $expireDate = Carbon::parse($insurance_expire);
    //                 if ($expireDate->isFuture()) {
    //                     $warranty_status = true;
    //                     $warranty_color = 'green';
    //                     $warranty_text = 'อยู่ในประกัน';
    //                 } else {
    //                     $warranty_status = false;
    //                     $warranty_color = 'red';
    //                     $warranty_text = 'หมดอายุการรับประกัน';
    //                 }
    //             } catch (\Exception $e) {
    //                 $warranty_text = 'ไม่สามารถระบุวันหมดประกันได้';
    //             }
    //         } elseif (!empty($buy_date) && empty($insurance_expire)) {
    //             // เพิ่มเงื่อนไข: มีวันลงทะเบียน (buy_date) แต่ไม่มีวันหมดประกัน (insurance_expire เป็น null)
    //             $warranty_status = false;
    //             $warranty_color = 'orange';
    //             $warranty_text = 'รออนุมัติการรับประกัน';
    //         } elseif ($warrantyexpire === false && empty($buy_date)) {
    //             $warranty_status = false;
    //             $warranty_color = 'orange';
    //             $warranty_text = 'ยังไม่ได้ลงทะเบียนรับประกัน';
    //         } else {
    //             // ไม่มีทั้ง warrantyexpire และวันหมดประกัน และ buy_date → ยังไม่ได้ลงทะเบียน
    //             $warranty_status = false;
    //             $warranty_color = 'orange';
    //             $warranty_text = 'ยังไม่ได้ลงทะเบียนรับประกัน';
    //         }

    //         $power_accessories = $data['power_accessories'] ?? null;
    //         $sn_hd = $data['sn_hd'] ?? null;
    //         if (!empty($power_accessories) && is_array($power_accessories)) {
    //             foreach ($power_accessories as $category => &$accessories_list) {
    //                 foreach ($accessories_list as &$acc) {
    //                     $acc['qty'] = 1; // ตั้งค่าเริ่มต้นเป็น 1 ชิ้น
    //                     if ($category === 'battery' && isset($sn_hd['batteryQty'])) {
    //                         $acc['qty'] = $sn_hd['batteryQty'];
    //                     } elseif ($category === 'charger' && isset($sn_hd['chargerQty'])) {
    //                         $acc['qty'] = $sn_hd['chargerQty'];
    //                     }
    //                     $acc_sku = $acc['accessory_sku'] ?? null;
    //                     $acc['image_url'] = null; // กำหนดค่าเริ่มต้นเผื่อไม่มีรูป

    //                     if ($acc_sku) {
    //                         try {
    //                             // เอา SKU อุปกรณ์ไปยิง API เพื่อดึง detail
    //                             $accResponse = Http::timeout(5)->get($URL, ['search' => $acc_sku]);

    //                             if ($accResponse->successful()) {
    //                                 $accData = $accResponse->json();
    //                                 // ถ้ามีข้อมูลรูปใน main_assets -> imagesku ให้ดึงมาใส่
    //                                 if (!empty($accData['main_assets']['imagesku']) && is_array($accData['main_assets']['imagesku'])) {
    //                                     $acc['image_url'] = $accData['main_assets']['imagesku'][0];
    //                                 }
    //                             }
    //                         } catch (\Exception $e) {
    //                             // ถ้ายิงไม่สำเร็จก็ปล่อยผ่านไป (ไม่มีรูป)
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         $real_product = [
    //             'pid' => $pid,
    //             'pname' => $pname,
    //             'facmodel' => $facmodel,
    //             'serial_id' => $display_serial, 
    //             'imagesku' => $imagesku,
    //             'warrantyperiod' => $warrantyperiod,
    //             'warrantycondition' => $warrantycondition,
    //             'warrantynote' => $warrantynote,
    //             'insurance_expire' => $insurance_expire,
    //             'buy_date' => $buy_date,
    //             'warranty_status' => $warranty_status,
    //             'power_accessories' => $power_accessories,
    //             'sn_hd' => $sn_hd,
    //         ];

    //         Log::info("Search Warranty Result: " . json_encode($real_product, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    //         return response()->json([
    //             'message' => 'success',
    //             'searchResults' => $data,
    //             'getRealProduct' => $real_product,
    //             'warrantyAt' => $buy_date,
    //             'expire_date' => $insurance_expire,
    //             'warranty_status' => $warranty_status,
    //             'warranty_color' => $warranty_color,
    //             'warranty_text' => $warranty_text,
    //             'time' => Carbon::now(),
    //             'elapsed' => $elapsed,
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => $e->getMessage(),
    //             'searchResults' => [],
    //             'time' => Carbon::now(),
    //         ], 400);
    //     }
    // }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['serial_id' => 'required'], [
            'serial_id.required' => 'กรุณากรอกหมายเลขซีเรียล (Serial ID)',
        ]);

        $serial_id = trim($request->input('serial_id'));
        $selected_skumain = $request->input('selected_skumain');

        logStamp::query()->create([
            'description' => Auth::user()->user_code . " ค้นหาหมายเลขซีเรียล {$serial_id} ในหน้าลงทะเบียนรับประกัน"
        ]);

        try {
            $start = microtime(true);
            $rawData = WarrantySearchService::fetchRaw($serial_id);
            $elapsed = number_format(microtime(true) - $start, 2);

            // When multiple products match the serial and the user hasn't chosen yet,
            // return a selection payload instead of a product.
            if (WarrantySearchService::hasMultipleSkumain($rawData) && !$selected_skumain) {
                return response()->json([
                    'needs_selection' => true,
                    'options'         => WarrantySearchService::extractOptions($rawData),
                    'elapsed'         => $elapsed,
                    'time'            => Carbon::now(),
                ]);
            }

            // Use the explicitly selected skumain, or fall back to the only result.
            $result = ($selected_skumain && isset($rawData[$selected_skumain]))
                ? $rawData[$selected_skumain]
                : reset($rawData);

            $processed   = WarrantySearchService::processResult($result, $serial_id, $selected_skumain ?? null);
            $real_product = $processed['real_product'];

            Log::info("Search Warranty Result: " . json_encode($real_product, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return response()->json([
                'message' => 'success',
                'getRealProduct' => $real_product,
                'warrantyAt' => $processed['buy_date'],
                'expire_date' => $processed['insurance_expire'],
                'warranty_status' => $processed['warranty_status'],
                'warranty_color' => $processed['warranty_color'],
                'warranty_text' => $processed['warranty_text'],
                'time' => Carbon::now(),
                'elapsed' => $elapsed,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'searchResults' => [],
                'time' => Carbon::now(),
            ], 400);
        }
    }

    // public function store(Request $request): JsonResponse
    // {
    //     // Validation rules
    //     $request->validate([
    //         'date_warranty' => 'required|date',
    //         'serial_id' => 'required|string',
    //         'pid' => 'required|string',
    //         'p_name' => 'required|string',
    //         'warrantyperiod' => 'required|integer',
    //         'evidence_file' => 'required|file|mimes:jpeg,jpg,png,gif|max:5120', // 5MB = 5120KB
    //     ], [
    //         'date_warranty.required' => 'กรุณาเลือกวันที่ซื้อสินค้า',
    //         'date_warranty.date' => 'รูปแบบวันที่ไม่ถูกต้อง',
    //         'evidence_file.required' => 'กรุณาเลือกไฟล์หลักฐานการซื้อสินค้า',
    //         'evidence_file.file' => 'ไฟล์ที่อัปโหลดไม่ถูกต้อง',
    //         'evidence_file.mimes' => 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, JPG, PNG, GIF)',
    //         'evidence_file.max' => 'ขนาดไฟล์ต้องไม่เกิน 5MB',
    //     ]);

    //     // แปลง date_warranty ให้เป็น Carbon instance
    //     $dateWarranty = Carbon::parse($request->input('date_warranty'));

    //     $now = Carbon::now();
    //     $dateLimit = $now->copy()->subDays(14);

    //     // เช็คว่าลงทะเบียนเกินวันปัจจุบัน
    //     if ($dateWarranty->gt($now)) {
    //         return response()->json([
    //             'message' => "วันที่ลงทะเบียนรับประกัน ({$dateWarranty->format('Y-m-d')}) ไม่สามารถมากกว่าวันปัจจุบัน ({$now->format('Y-m-d')}) ได้"
    //         ], 422);
    //     }

    //     // เช็คว่าย้อนหลังเกิน 14 วัน
    //     // if ($dateWarranty->lt($dateLimit)) {
    //     //     return response()->json([
    //     //         'message' => "วันที่ลงทะเบียนรับประกัน ({$dateWarranty->format('Y-m-d')}) ไม่สามารถย้อนหลังเกิน 14 วัน (ก่อนวันที่ {$dateLimit->format('Y-m-d')}) ได้"
    //     //     ], 422);
    //     // }

    //     // ดึงข้อมูลจากฟอร์ม
    //     $serial_id = $request->input('serial_id');
    //     $power_accessories = json_decode($request->input('power_accessories'), true);
    //     logStamp::query()->create([
    //         'description' => Auth::user()->user_code . " พยายามลงทะเบียนรับประกัน $serial_id"
    //     ]);

    //     // เช็คว่า serial_id นี้ได้ลงทะเบียนไปแล้วหรือยัง
    //     $existingWarranty = WarrantyProduct::where('serial_id', $serial_id)->first();
    //     if ($existingWarranty) {
    //         return response()->json([
    //             'message' => 'ซีเรียลนัมเบอร์นี้ได้ลงทะเบียนรับประกันไปแล้ว'
    //         ], 422);
    //     }

    //     $pid = $request->input('pid');
    //     $p_name = $request->input('p_name');
    //     $warranty_period = (int) $request->input('warrantyperiod');
    //     $expire_date = $dateWarranty->copy()->addMonths($warranty_period);

    //     // อัปโหลดไฟล์
    //     $evidenceFilePath = null;
    //     if ($request->hasFile('evidence_file')) {
    //         try {
    //             $file = $request->file('evidence_file');

    //             // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำ
    //             $fileName = 'warranty_' . $serial_id . '_' . time() . '.' . $file->getClientOriginalExtension();
    //             $full_file_path = 'warranty_evidence/' . $fileName;

    //             // เก็บไฟล์ในโฟลเดอร์ storage/app/public/warranty_evidence
    //             $evidenceFilePath = $file->storeAs('warranty_evidence', $fileName, 'public');
    //         } catch (\Exception $e) {
    //             return response()->json([
    //                 'message' => 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' . $e->getMessage()
    //             ], 500);
    //         }
    //     }

    //     try {
    //         DB::beginTransaction();

    //         WarrantyProduct::query()->create([
    //             'serial_id' => $serial_id,
    //             'pid' => $pid,
    //             'p_name' => $p_name,
    //             'date_warranty' => $dateWarranty->toDateString(),
    //             'user_id' => Auth::user()->id,
    //             'user_is_code_id' => Auth::user()->is_code_cust_id,
    //             'warranty_period' => $warranty_period,
    //             'expire_date' => $expire_date->toDateString(),
    //             'path_file' => $full_file_path ?? null, // เพิ่มฟิลด์นี้ในฐานข้อมูล
    //         ]);

    //         if (!empty($power_accessories)) {
    //             // วนลูปแยกประเภทเช่น 'battery', 'charger'
    //             foreach ($power_accessories as $acc_category => $accessories_list) {
    //                 foreach ($accessories_list as $acc) {
    //                     $acc_sku = $acc['accessory_sku'] ?? null;

    //                     if ($acc_sku) {
    //                         $acc_period = (int)($acc['warranty_period'] ?? 0);
    //                         $acc_expire_date = $dateWarranty->copy()->addMonths($acc_period);

    //                         WarrantyProduct::query()->create([
    //                             'serial_id' => $serial_id, // ใช้ซีเรียลเดียวกับเครื่องหลัก
    //                             'pid' => $acc_sku,         // เอา SKU อุปกรณ์มาเก็บเป็น Product ID แทน
    //                             'p_name' => $acc['product_name'] ?? '',
    //                             'date_warranty' => $dateWarranty->toDateString(),
    //                             'user_id' => Auth::user()->id,
    //                             'user_is_code_id' => Auth::user()->is_code_cust_id,
    //                             'warranty_period' => $acc_period,
    //                             'expire_date' => $acc_expire_date->toDateString(),
    //                             'path_file' => $full_file_path ?? null,
    //                             // หาก Database ของคุณสร้างฟิลด์ใหม่แล้วให้ uncomment 2 บรรทัดล่างนี้
    //                             'skumain' => $pid,      // อ้างอิงตัวเครื่องหลัก
    //                             'accessory_sku' => $acc_sku,
    //                         ]);
    //                     }
    //                 }
    //             }
    //         }

    //         $message = 'บันทึกข้อมูลเสร็จสิ้น สิ้นสุดประกันถึง ' . $expire_date->format('d/m/Y H:i:s');
    //         $status = 200;

    //         DB::commit();

    //         logStamp::query()->create([
    //             'description' => Auth::user()->user_code . " ลงทะเบียนรับประกัน $serial_id สำเร็จ"
    //         ]);
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         // ลบไฟล์ที่อัปโหลดไปแล้วถ้าเกิดข้อผิดพลาด
    //         if ($evidenceFilePath && Storage::disk('public')->exists($evidenceFilePath)) {
    //             Storage::disk('public')->delete($evidenceFilePath);
    //         }

    //         $message = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $e->getMessage();
    //         $status = 500;
    //     } finally {
    //         return response()->json([
    //             'message' => $message,
    //         ], $status);
    //     }
    // }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date_warranty' => 'required|date',
            'serial_id' => 'required|string',
            'pid' => 'required|string',
            'p_name' => 'required|string',
            'warrantyperiod' => 'required|integer',
            'evidence_file' => 'required|file|mimes:jpeg,jpg,png,gif|max:5120',
        ], [
            'date_warranty.required' => 'กรุณาเลือกวันที่ซื้อสินค้า',
            'date_warranty.date' => 'รูปแบบวันที่ไม่ถูกต้อง',
            'evidence_file.required' => 'กรุณาเลือกไฟล์หลักฐานการซื้อสินค้า',
            'evidence_file.file' => 'ไฟล์ที่อัปโหลดไม่ถูกต้อง',
            'evidence_file.mimes' => 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, JPG, PNG, GIF)',
            'evidence_file.max' => 'ขนาดไฟล์ต้องไม่เกิน 5MB',
        ]);

        $dateWarranty = Carbon::parse($request->input('date_warranty'));
        $now = Carbon::now();

        if ($dateWarranty->gt($now)) {
            return response()->json([
                'message' => "วันที่ลงทะเบียนรับประกัน ({$dateWarranty->format('Y-m-d')}) ไม่สามารถมากกว่าวันปัจจุบัน ({$now->format('Y-m-d')}) ได้"
            ], 422);
        }

        $serial_id = $request->input('serial_id');
        $selected_skumain = $request->input('selected_skumain');
        $power_accessories = json_decode($request->input('power_accessories'), true);
        $combo_items = json_decode($request->input('combo_items'), true); // ✅ ดึงรายการ Combo ส่งมาจาก Frontend

        logStamp::query()->create([
            'description' => Auth::user()->user_code . " พยายามลงทะเบียนรับประกัน $serial_id"
        ]);

        // Re-verify product data:
        // Detection  → getdatadup (new API) to handle multiple-skumain serials.
        // Product data → getdata   (old API) called with the selected skumain PID.
        $pid             = $request->input('pid');
        $p_name          = $request->input('p_name');
        $warranty_period  = (int) $request->input('warrantyperiod');
        $otherModelCodes  = [];
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
                $productData     = WarrantySearchService::fetchBySkumain($selectedKey);
                $mainAsset       = ($productData['assets'][$selectedKey] ?? $productData['assets'][array_key_first($productData['assets'] ?? [])] ?? []);
                $pid             = $productData['skumain'] ?? $mainAsset['pid'] ?? $pid;
                $p_name          = $mainAsset['pname'] ?? $p_name;
                $warranty_period = (int)($mainAsset['warrantyperiod'] ?? $warranty_period);
            } catch (\Exception $e) {
                // Fallback to getdatadup data if getdata call fails
                Log::warning("warranty.store getdata verify failed [{$selectedKey}]: " . $e->getMessage());
                $result = isset($rawData[$selectedKey]) ? $rawData[$selectedKey] : reset($rawData);
                $main   = $result['main_assets'] ?? [];
                if (!empty($main)) {
                    $pid             = $main['pid'] ?? $pid;
                    $p_name          = $main['pname'] ?? $p_name;
                    $warranty_period = (int)($main['warrantyperiod'] ?? $warranty_period);
                }
            }

            // outer key ของ rawData = skumain — เก็บของ skumain ที่ไม่ได้เลือก
            foreach ($rawData as $modelCode => $_) {
                if ($modelCode !== $selectedKey) {
                    $otherModelCodes[] = $modelCode;
                }
            }
        } catch (\Exception $e) {
            Log::warning("warranty.store API verify failed [{$serial_id}]: " . $e->getMessage());
        }

        // กรอง combo_items และ power_accessories ที่ตรงกับ model_code ของ skumain อื่นออก
        if (!empty($otherModelCodes)) {
            $combo_items = array_values(array_filter(
                $combo_items ?? [],
                fn($item) => !in_array($item['pid'] ?? null, $otherModelCodes)
            ));
            foreach ($power_accessories ?? [] as $cat => &$accList) {
                $accList = array_values(array_filter(
                    $accList,
                    fn($acc) => !in_array($acc['accessory_sku'] ?? null, $otherModelCodes)
                ));
            }
            unset($accList);
        }

        // เช็คด้วย serial_id + pid คู่กัน เพราะ serial เดียวกันอาจลงทะเบียนกับ model ต่างกันได้
        $existingWarranty = WarrantyProduct::where('serial_id', $serial_id)
            ->where('pid', $pid)
            ->first();
        if ($existingWarranty) {
            return response()->json([
                'message' => "ซีเรียลนัมเบอร์ {$serial_id} ได้ลงทะเบียนรับประกันสินค้า {$pid} ไปแล้ว"
            ], 422);
        }

        $expire_date = $dateWarranty->copy()->addMonths($warranty_period);

        $evidenceFilePath = null;
        if ($request->hasFile('evidence_file')) {
            try {
                $file = $request->file('evidence_file');
                $fileName = 'warranty_' . $serial_id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $full_file_path = 'warranty_evidence/' . $fileName;
                $evidenceFilePath = $file->storeAs('warranty_evidence', $fileName, 'public');
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' . $e->getMessage()
                ], 500);
            }
        }

        try {
            DB::beginTransaction();

            // 1. บันทึกเครื่องหลัก
            WarrantyProduct::query()->create([
                'serial_id' => $serial_id,
                'pid' => $pid,
                'p_name' => $p_name,
                'date_warranty' => $dateWarranty->toDateString(),
                'user_id' => Auth::user()->id,
                'user_is_code_id' => Auth::user()->is_code_cust_id,
                'warranty_period' => $warranty_period,
                'expire_date' => $expire_date->toDateString(),
                'path_file' => $full_file_path ?? null,
            ]);

            // 2. บันทึก Power Accessories (ถ้ามี)
            if (!empty($power_accessories)) {
                foreach ($power_accessories as $acc_category => $accessories_list) {
                    foreach ($accessories_list as $acc) {
                        if (PowerAccessoriesService::isRemoved($acc)) continue;

                        $acc_sku = $acc['accessory_sku'] ?? null;
                        if ($acc_sku) {
                            $acc_serial = PowerAccessoriesService::resolveSerial($acc, $serial_id);
                            $acc_period = (int)($acc['warranty_period'] ?? 0);
                            $acc_expire_date = $dateWarranty->copy()->addMonths($acc_period);

                            WarrantyProduct::query()->create([
                                'serial_id' => $acc_serial,
                                'pid' => $acc_sku,
                                'p_name' => $acc['product_name'] ?? '',
                                'date_warranty' => $dateWarranty->toDateString(),
                                'user_id' => Auth::user()->id,
                                'user_is_code_id' => Auth::user()->is_code_cust_id,
                                'warranty_period' => $acc_period,
                                'expire_date' => $acc_expire_date->toDateString(),
                                'path_file' => $full_file_path ?? null,
                                'skumain' => $pid,
                                'accessory_sku' => $acc_sku,
                            ]);
                        }
                    }
                }
            }

            // 3. บันทึก Combo Items (ถ้ามี)
            if (!empty($combo_items)) {
                foreach ($combo_items as $c_item) {
                    $c_pid = $c_item['pid'] ?? null;
                    if ($c_pid) {
                        $c_period = (int)($c_item['warrantyperiod'] ?? 0);
                        // ถ้า Combo ย่อยไม่มีระยะเวลาประกันระบุแยก ให้ยึดเวลาจากเครื่องชุดหลัก
                        if ($c_period === 0 && $warranty_period > 0) {
                            $c_period = $warranty_period;
                        }
                        $c_expire_date = $dateWarranty->copy()->addMonths($c_period);

                        WarrantyProduct::query()->create([
                            'serial_id' => $serial_id,
                            'pid' => $c_pid,
                            'p_name' => $c_item['pname'] ?? '',
                            'date_warranty' => $dateWarranty->toDateString(),
                            'user_id' => Auth::user()->id,
                            'user_is_code_id' => Auth::user()->is_code_cust_id,
                            'warranty_period' => $c_period,
                            'expire_date' => $c_expire_date->toDateString(),
                            'path_file' => $full_file_path ?? null,
                            'skumain' => $pid, // ชี้ไปหาตัวกล่อง Combo หลัก
                        ]);
                    }
                }
            }

            $message = 'บันทึกข้อมูลเสร็จสิ้น สิ้นสุดประกันถึง ' . $expire_date->format('d/m/Y H:i:s');
            $status = 200;

            DB::commit();

            logStamp::query()->create([
                'description' => Auth::user()->user_code . " ลงทะเบียนรับประกัน $serial_id สำเร็จ"
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            if ($evidenceFilePath && Storage::disk('public')->exists($evidenceFilePath)) {
                Storage::disk('public')->delete($evidenceFilePath);
            }

            $message = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $e->getMessage();
            $status = 500;
        } finally {
            return response()->json([
                'message' => $message,
            ], $status);
        }
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'serial_id' => 'required',
            'date_warranty' => 'required',
        ]);

        $serial_id = $request->input('serial_id');
        $pid = $request->input('pid');

        WarrantyProduct::query()->where('serial_id', $serial_id)->update([
            'date_warranty' => $request->input('date_warranty'),
        ]);

        return response()->json([
            'message' => 'success',
        ]);
    }

    /**
     * ฟังก์ชันสำหรับดูไฟล์หลักฐาน
     */
    public function getEvidenceFile($serial_id)
    {
        $warranty = WarrantyProduct::where('serial_id', $serial_id)->first();

        if (!$warranty || !$warranty->evidence_file_path) {
            return response()->json(['message' => 'ไม่พบไฟล์หลักฐาน'], 404);
        }

        $filePath = storage_path('app/public/' . $warranty->evidence_file_path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'ไฟล์หลักฐานไม่พบในระบบ'], 404);
        }

        return response()->file($filePath);
    }
}
