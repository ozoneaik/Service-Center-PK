<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarrantyProductRequest;
use App\Models\logStamp;
use App\Models\WarrantyProduct;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
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

    public function search(Request $request): JsonResponse
    {
        $request->validate(['serial_id' => 'required',], ['serial_id.required' => 'Serial ID is required']);
        $serial_id = $request->input('serial_id');
        logStamp::query()->create(['description' => Auth::user()->user_code . " ค้นหา ซีเรียล $serial_id ในหน้าลงทะเบียนรับประกัน"]);
        try {
            $response = Http::post(env('API_DETAIL'), [
                'sn' => $serial_id,
                'views' => $request->views,
            ]);
            if ($response->status() === 200) {
                $searchResults = $response->json();
                if ($searchResults['status'] === 'Fail') {
                    throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $request->sn);
                }

                $res_RealProduct = Http::post(env('VITE_API_ORDER'),[
                    'pid' => $searchResults['skumain'],
                    'view' => 'single'
                ]);

                $res_RealProduct = $res_RealProduct->json();

                $real_product = $res_RealProduct['assets'][0];
                $real_product['serial_id'] = $serial_id;

                if (!$searchResults['warrantyexpire']){
                    $warrantyAt = WarrantyProduct::query()->where('serial_id', $serial_id)->first();
                    $expire_date = $warrantyAt->expire_date ?? '';
                    $warrantyAt = $warrantyAt->date_warranty ?? '';
                }else{
                    $expire_date = $searchResults['insurance_expire'];
                    $warrantyAt = $searchResults['buy_date'];
                }
                if($expire_date < Carbon::now()->toDateString()){
                    $real_product['warranty_status'] = false;
                }else{
                    $real_product['warranty_status'] = true;
                }

            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }

            return response()->json([
                'searchResults' => $searchResults,
                'message' => 'success',
                'warrantyAt' => $warrantyAt,
                'expire_date' => $expire_date,
                'time' => Carbon::now(),
                'getRealProduct' => $real_product,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'searchResults' => [],
                'message' => $e->getMessage(),
                'time' => Carbon::now()
            ], 400);
        }
    }

    public function store(Request $request): JsonResponse
    {
        // Validation rules
        $request->validate([
            'date_warranty' => 'required|date',
            'serial_id' => 'required|string',
            'pid' => 'required|string',
            'p_name' => 'required|string',
            'warrantyperiod' => 'required|integer',
            'evidence_file' => 'required|file|mimes:jpeg,jpg,png,gif|max:5120', // 5MB = 5120KB
        ], [
            'date_warranty.required' => 'กรุณาเลือกวันที่ซื้อสินค้า',
            'date_warranty.date' => 'รูปแบบวันที่ไม่ถูกต้อง',
            'evidence_file.required' => 'กรุณาเลือกไฟล์หลักฐานการซื้อสินค้า',
            'evidence_file.file' => 'ไฟล์ที่อัปโหลดไม่ถูกต้อง',
            'evidence_file.mimes' => 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, JPG, PNG, GIF)',
            'evidence_file.max' => 'ขนาดไฟล์ต้องไม่เกิน 5MB',
        ]);

        // แปลง date_warranty ให้เป็น Carbon instance
        $dateWarranty = Carbon::parse($request->input('date_warranty'));

        $now = Carbon::now();
        $dateLimit = $now->copy()->subDays(14);

        // เช็คว่าลงทะเบียนเกินวันปัจจุบัน
        if ($dateWarranty->gt($now)) {
            return response()->json([
                'message' => "วันที่ลงทะเบียนรับประกัน ({$dateWarranty->format('Y-m-d')}) ไม่สามารถมากกว่าวันปัจจุบัน ({$now->format('Y-m-d')}) ได้"
            ], 422);
        }

        // เช็คว่าย้อนหลังเกิน 14 วัน
        // if ($dateWarranty->lt($dateLimit)) {
        //     return response()->json([
        //         'message' => "วันที่ลงทะเบียนรับประกัน ({$dateWarranty->format('Y-m-d')}) ไม่สามารถย้อนหลังเกิน 14 วัน (ก่อนวันที่ {$dateLimit->format('Y-m-d')}) ได้"
        //     ], 422);
        // }

        // ดึงข้อมูลจากฟอร์ม
        $serial_id = $request->input('serial_id');
        logStamp::query()->create([
            'description' => Auth::user()->user_code . " พยายามลงทะเบียนรับประกัน $serial_id"
        ]);

        // เช็คว่า serial_id นี้ได้ลงทะเบียนไปแล้วหรือยัง
        $existingWarranty = WarrantyProduct::where('serial_id', $serial_id)->first();
        if ($existingWarranty) {
            return response()->json([
                'message' => 'ซีเรียลนัมเบอร์นี้ได้ลงทะเบียนรับประกันไปแล้ว'
            ], 422);
        }

        $pid = $request->input('pid');
        $p_name = $request->input('p_name');
        $warranty_period = (int) $request->input('warrantyperiod');
        $expire_date = $dateWarranty->copy()->addMonths($warranty_period);

        // อัปโหลดไฟล์
        $evidenceFilePath = null;
        if ($request->hasFile('evidence_file')) {
            try {
                $file = $request->file('evidence_file');

                // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำ
                $fileName = 'warranty_' . $serial_id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $full_file_path = 'warranty_evidence/' . $fileName;

                // เก็บไฟล์ในโฟลเดอร์ storage/app/public/warranty_evidence
                $evidenceFilePath = $file->storeAs('warranty_evidence', $fileName, 'public');

            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' . $e->getMessage()
                ], 500);
            }
        }

        try {
            DB::beginTransaction();

            WarrantyProduct::query()->create([
                'serial_id' => $serial_id,
                'pid' => $pid,
                'p_name' => $p_name,
                'date_warranty' => $dateWarranty->toDateString(),
                'user_id' => Auth::user()->id,
                'user_is_code_id' => Auth::user()->is_code_cust_id,
                'warranty_period' => $warranty_period,
                'expire_date' => $expire_date->toDateString(),
                'path_file' => $full_file_path ?? null, // เพิ่มฟิลด์นี้ในฐานข้อมูล
            ]);

            $message = 'บันทึกข้อมูลเสร็จสิ้น สิ้นสุดประกันถึง ' . $expire_date->format('d/m/Y H:i:s');
            $status = 200;

            DB::commit();

            logStamp::query()->create([
                'description' => Auth::user()->user_code . " ลงทะเบียนรับประกัน $serial_id สำเร็จ"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // ลบไฟล์ที่อัปโหลดไปแล้วถ้าเกิดข้อผิดพลาด
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
