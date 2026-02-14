<?php

namespace App\Http\Controllers;

use App\Models\ClaimFileUpload;
use App\Models\SpareReturnDetail;
use App\Models\SpareReturnFile;
use App\Models\SpareReturnHeader;
use App\Models\SpareReturnTransaction;
use Illuminate\Http\Request;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AccountingReturnController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        abort_unless(in_array($user->role, ['admin', 'acc']), 403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');

        $status = $request->query('status', 'active');

        $jobs = SpareReturnHeader::query()
            // โหลด details, claim.files (claim_file_uploads), และ files (spare_return_files)
            // ->with(['details.originalClaimDetail', 'claim.files', 'files'])
            ->with(['details.originalClaimDetail', 'files'])
            ->when($status !== 'all', function ($q) use ($status) {
                if ($status === 'complete') {
                    $q->whereIn('status', ['complete', 'partial']);
                } else {
                    $q->where('status', $status);
                }
            })
            ->orderByDesc('created_at')
            ->get()
            // ->map(function ($job) {
            //     // --- 1. ส่วนของฝ่ายขาย (Sales) ---
            //     // ดึงไฟล์จากตาราง claim_file_uploads ที่ตรงกับเลขใบ RT ของรอบนี้เท่านั้น
            //     // (แนะนำให้เพิ่ม relationship ใน SpareReturnHeader จะดีที่สุด แต่ใช้ query ตรงแบบนี้ก็ได้)
            //     $currentSalesFiles = \App\Models\ClaimFileUpload::where('return_job_no', $job->return_job_no)->get();

            //     $job->sales_files = $currentSalesFiles;

            //     // ดึงหมายเหตุเฉพาะรอบนี้ จากไฟล์แรกที่เจอ
            //     $job->sales_remark_actual = $currentSalesFiles->whereNotNull('remark')->first()?->remark ?? '-';

            //     // --- 2. ส่วนของบัญชี (Accounting) ---
            //     $job->acc_remark_actual = $job->remark ?? '-';
            //     $job->acc_files_actual = $job->files->values();

            //     return $job;
            // });
            
            ->map(function ($job) {
                $job->sales_remark_actual = $job->salesFiles->first()?->remark ?? '-';
                $job->acc_remark_actual = $job->remark ?? '-';
                // ไม่ต้องรัน query ใหม่ในนี้แล้ว
                return $job;
            });

        return Inertia::render('SpareClaim/Accounting/SpareReturnList', [
            'jobs' => $jobs,
            'filterStatus' => $status
        ]);
    }

    // public function confirm(Request $request)
    // {
    //     $request->validate([
    //         'return_header_id' => 'required|exists:spare_return_headers,id',
    //         'items' => 'required|array',
    //         'items.*.detail_id' => 'required|exists:spare_return_details,id',
    //         'items.*.receive_qty' => 'required|integer|min:0',
    //     ]);

    //     try {
    //         DB::beginTransaction();
    //         $header = SpareReturnHeader::findOrFail($request->return_header_id);

    //         $currentTotalSent = 0;
    //         $currentTotalReceivedAcc = 0;

    //         foreach ($request->items as $item) {
    //             $detail = SpareReturnDetail::where('id', $item['detail_id'])
    //                 ->where('return_header_id', $header->id)
    //                 ->first();

    //             if ($detail) {
    //                 // *** จุดสำคัญ: บวกยอดใหม่เข้าไปในยอดสะสมเดิม (account_rc_qty) ***
    //                 $newAccumulatedQty = $detail->account_rc_qty + $item['receive_qty'];

    //                 if ($newAccumulatedQty > $detail->qty) {
    //                     throw new \Exception("รหัสสินค้า {$detail->sp_code} รับเกินจำนวนที่ส่งมา (ยอดเดิม: {$detail->account_rc_qty}, เพิ่ม: {$item['receive_qty']})");
    //                 }

    //                 $detail->update(['account_rc_qty' => $newAccumulatedQty]);

    //                 // คำนวณยอดรวมทั้งใบเพื่อหา Status
    //                 $currentTotalSent += $detail->qty;
    //                 $currentTotalReceivedAcc += $newAccumulatedQty;
    //             }
    //         }

    //         // เช็ค Status ใหม่: ถ้าผลรวมสะสมครบแล้วให้เป็น complete ถ้ายังไม่ครบให้เป็น partial
    //         $finalStatus = ($currentTotalReceivedAcc >= $currentTotalSent) ? 'complete' : 'partial';

    //         $timestamp = now()->format('d/m/Y H:i');
    //         $addRemark = "\n[{$timestamp} รับเพิ่ม]: " . ($request->remark ?: '-');

    //         $header->update([
    //             'status' => $finalStatus,
    //             'receive_by_account' => Auth::user()->user_code,
    //             'account_receive_date' => now(),
    //             'remark' => $header->remark . $addRemark
    //         ]);

    //         // จัดการอัปโหลดไฟล์ (โค้ดเดิมของคุณ)
    //         if ($request->hasFile('files')) {
    //             foreach ($request->file('files') as $file) {
    //                 $fileName = 'acc_return_' . $header->return_job_no . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    //                 $path = $file->storeAs('uploads/returns', $fileName, 'public');
    //                 SpareReturnFile::create([
    //                     'return_header_id' => $header->id,
    //                     'file_path' => $path,
    //                     'file_name' => $file->getClientOriginalName(),
    //                     'file_type' => $file->getClientOriginalExtension(),
    //                 ]);
    //             }
    //         }

    //         DB::commit();
    //         return redirect()->back()->with('success', 'บันทึกสำเร็จ');
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return redirect()->back()->withErrors(['error' => $e->getMessage()]);
    //     }
    // }

    public function confirm(Request $request)
    {
        // Validate ข้อมูล
        $request->validate([
            'return_header_id' => 'required|exists:spare_return_headers,id',
            'items' => 'required|array',
            'items.*.detail_id' => 'required|exists:spare_return_details,id',
            'items.*.receive_qty' => 'required|integer|min:0',
            'is_full_receive' => 'required|boolean',
            'remark' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => 'image|max:10240'
        ]);

        try {
            DB::beginTransaction();

            $header = SpareReturnHeader::findOrFail($request->return_header_id);
            $userCode = Auth::user()->user_code ?? 'System'; // ปรับตามฟิลด์จริงของ User Model

            // 1. วนลูปจัดการรายการสินค้า
            foreach ($request->items as $item) {
                // ถ้า qty เป็น 0 ข้ามไปเลย (ไม่ต้องบันทึก transaction)
                if ($item['receive_qty'] <= 0) {
                    continue;
                }

                $detail = SpareReturnDetail::where('id', $item['detail_id'])
                    ->where('return_header_id', $header->id)
                    ->lockForUpdate() // ล็อกแถวป้องกัน race condition
                    ->first();

                if ($detail) {
                    // คำนวณยอดสะสมใหม่
                    $newAccumulatedQty = $detail->account_rc_qty + $item['receive_qty'];

                    // Validation: ห้ามรับเกินยอดส่ง
                    if ($newAccumulatedQty > $detail->qty) {
                        throw new \Exception("รหัสสินค้า {$detail->sp_code} : ยอดรับรวม ($newAccumulatedQty) เกินจำนวนที่ส่งมา ({$detail->qty})");
                    }

                    // [NEW] บันทึก Transaction ประวัติการรับครั้งนี้
                    SpareReturnTransaction::create([
                        'return_header_id' => $header->id,
                        'return_detail_id' => $detail->id,
                        'qty' => $item['receive_qty'], // จำนวนที่รับเพิ่มในครั้งนี้
                        'recorded_by' => $userCode,
                        'remark' => $request->remark // บันทึกหมายเหตุลง transaction ด้วย (ถ้าต้องการ)
                    ]);

                    // อัปเดตยอดสะสมที่ Detail
                    $detail->update([
                        'account_rc_qty' => $newAccumulatedQty
                    ]);
                }
            }

            // 2. คำนวณสถานะรวมใหม่ (Query ผลรวมจริงจาก DB เพื่อความแม่นยำ)
            $stats = SpareReturnDetail::where('return_header_id', $header->id)
                ->selectRaw('SUM(qty) as total_sent, SUM(account_rc_qty) as total_received')
                ->first();

            // ถ้า ยอดรับรวม >= ยอดส่งรวม ให้ถือว่าจบงาน (Complete)
            // ถ้ายังไม่ครบ ให้เป็น Partial
            $finalStatus = ($stats->total_received >= $stats->total_sent) ? 'complete' : 'partial';

            // 3. เตรียม Remark สำหรับ Header (ต่อท้ายของเดิม)
            $timestamp = now()->format('d/m/Y H:i');
            $actionText = ($finalStatus === 'complete') ? 'ปิดงานรับครบ' : 'รับเพิ่ม';
            // $newRemark = $request->remark ? "\n[{$timestamp} {$actionText}]: " . $request->remark : "";
            $newRemark = $request->remark ? "\n[{$timestamp}: " . $request->remark : "";

            // 4. อัปเดต Header
            $header->update([
                'status' => $finalStatus,
                'receive_by_account' => $userCode, // คนล่าสุดที่ทำรายการ
                'account_receive_date' => now(),
                'remark' => $header->remark . $newRemark
            ]);

            // 5. จัดการอัปโหลดไฟล์ (ถ้ามี)
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $fileName = 'acc_return_' . $header->return_job_no . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('uploads/returns', $fileName, 'public');

                    SpareReturnFile::create([
                        'return_header_id' => $header->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_type' => $file->getClientOriginalExtension(),
                    ]);
                }
            }

            DB::commit();

            return redirect()->back()->with('success', "บันทึกการรับสินค้าเรียบร้อยแล้ว (สถานะ: $finalStatus)");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Accounting Confirm Error: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }
}
