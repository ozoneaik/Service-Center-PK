<?php

namespace App\Http\Controllers;

use App\Models\logStamp;
use App\Models\TblHistoryProd;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TblHistoryProdController extends Controller
{
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
        $warrantyPeriod = (int) $request->input('warrantyperiod');
        $expireDate     = $dateWarranty->copy()->addMonths($warrantyPeriod);

        logStamp::query()->create([
            'description' => Auth::user()->user_code . " พยายามลงทะเบียนรับประกัน $serial_id"
        ]);

        $existing = TblHistoryProd::where('serial_number', $serial_id)->first();
        if ($existing) {
            return response()->json([
                'message' => "Serial Number {$serial_id} ถูกลงทะเบียนแล้ว"
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

            $item = TblHistoryProd::create([
                'serial_number'    => $serial_id,
                'model_code'       => $request->input('pid'),
                'product_name'     => $request->input('pname'),
                'model_name'       => $request->input('facmodel'),
                'buy_date'         => $dateWarranty->toDateString(),
                'insurance_expire' => $expireDate->toDateString(),
                'cust_tel'         => $request->input('cust_tel', ''),
                'buy_from'         => $request->input('buy_from', 'N/A'),
                'slip'             => $slipUrl, 
                'insurance'        => 'standard',
                'approval'         => 'Y',
                'status'           => 'enabled',
                'reward'           => 'Y',
                'warranty_from'    => 'Service Center',
                'create_at'        => Carbon::now(),
                'updated_at'       => Carbon::now(),
                'updated_by'       => Auth::user()->user_code ?? null,
            ]);

            DB::commit();
            logStamp::query()->create([
                'description' => Auth::user()->user_code . " ลงทะเบียนรับประกัน $serial_id สำเร็จ"
            ]);

            return response()->json([
                'message'     => 'บันทึกข้อมูลเสร็จสิ้น สิ้นสุดประกันถึง ' . $expireDate->format('d/m/Y H:i:s'),
                'expire_date' => $expireDate->toDateString(),
                'data'        => $item,
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
