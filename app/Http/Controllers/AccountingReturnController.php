<?php

namespace App\Http\Controllers;

use App\Models\SpareReturnDetail;
use App\Models\SpareReturnFile;
use App\Models\SpareReturnHeader;
use Illuminate\Http\Request;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AccountingReturnController extends Controller
{
    // public function index(Request $request): Response
    // {
    //     //เช็คเงื่อนไขให้เข้าหน้านี้ได้แค่ acc และ admin
    //     $user = Auth::user();
    //     abort_unless(in_array($user->role, ['admin', 'acc']), 403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');

    //     $status = $request->query('status', 'active');

    //     $jobs = SpareReturnHeader::query()
    //         // ดึงความสัมพันธ์ files และระบุให้ชัดเจนในภายหลัง
    //         ->with(['details', 'claim', 'files'])
    //         ->when($status !== 'all', function ($q) use ($status) {
    //             if ($status === 'complete') {
    //                 $q->whereIn('status', ['complete', 'partial']);
    //             } else {
    //                 $q->where('status', $status);
    //             }
    //         })
    //         ->orderByDesc('created_at')
    //         ->get()
    //         ->map(function ($job) {
    //             // แยก Remark: ปกติคุณเก็บต่อกันด้วย " | " เราจะแยกมันออก
    //             $remarks = explode(' | ', $job->remark);

    //             $job->sales_remark = $remarks[0] ?? '-';
    //             // กรองหา remark ที่มีคำว่า [บัญชีตอบกลับ:]
    //             $job->acc_remark = collect($remarks)->first(fn($r) => str_contains($r, '[บัญชีตอบกลับ:]')) ?? '-';
    //             $job->acc_remark = str_replace('[บัญชีตอบกลับ:] ', '', $job->acc_remark);

    //             $job->sales_files = $job->files->filter(
    //                 fn($f) =>
    //                 $f->created_at < $job->account_receive_date || !$job->account_receive_date
    //             )->values(); // เพิ่ม values()

    //             $job->acc_files = $job->files->filter(
    //                 fn($f) =>
    //                 $job->account_receive_date && $f->created_at >= $job->account_receive_date
    //             )->values();

    //             return $job;
    //         });

    //     return Inertia::render('SpareClaim/Accounting/SpareReturnList', [
    //         'jobs' => $jobs,
    //         'filterStatus' => $status
    //     ]);
    // }

    public function index(Request $request): Response
    {
        $user = Auth::user();
        abort_unless(in_array($user->role, ['admin', 'acc']), 403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');

        $status = $request->query('status', 'active');

        $jobs = SpareReturnHeader::query()
            // โหลด details, claim.files (claim_file_uploads), และ files (spare_return_files)
            ->with(['details', 'claim.files', 'files'])
            ->when($status !== 'all', function ($q) use ($status) {
                if ($status === 'complete') {
                    $q->whereIn('status', ['complete', 'partial']);
                } else {
                    $q->where('status', $status);
                }
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($job) {
                // --- 1. ส่วนของฝ่ายขาย (Sales) ---
                // ดึงไฟล์จากตาราง claim_file_uploads ผ่าน relationship files() ที่เพิ่มใน Model Claim
                $salesFiles = $job->claim ? $job->claim->files : collect();
                $job->sales_files = $salesFiles->values();

                // หมายเหตุจากเซลล์ ใช้จาก claim_file_uploads.remark (ดึงจากไฟล์แรกที่มี)
                $job->sales_remark_actual = $salesFiles->whereNotNull('remark')->first()?->remark ?? '-';

                // --- 2. ส่วนของบัญชี (Accounting) ---
                // หมายเหตุการตรวจสอบ ใช้จาก spare_return_headers.remark โดยตรง
                $job->acc_remark_actual = $job->remark ?? '-';

                // หลักฐานรูปภาพบัญชี จาก spare_return_files
                $job->acc_files_actual = $job->files->values();

                return $job;
            });

        return Inertia::render('SpareClaim/Accounting/SpareReturnList', [
            'jobs' => $jobs,
            'filterStatus' => $status
        ]);
    }

    // บันทึกยืนยันการรับของ
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

            // 1. วนลูปอัปเดตยอดรับจริง
            foreach ($request->items as $item) {
                $detail = SpareReturnDetail::where('id', $item['detail_id'])
                    ->where('return_header_id', $header->id)
                    ->first();

                if ($detail) {
                    $detail->update([
                        'account_rc_qty' => $item['receive_qty']
                    ]);
                }
            }

            // 2. กำหนดสถานะงาน
            $finalStatus = $request->is_full_receive ? 'complete' : 'partial';

            // เตรียมข้อความ Remark
            $systemRemark = $request->is_full_receive ? "" : " | [ตอบกลับจากระบบ]: ปิดงานยอดไม่ครบ";
            $accRemark = $request->remark ? " | [บัญชีตอบกลับ:] " . $request->remark : "";

            // 3. อัปเดต Header
            $header->update([
                'status' => $finalStatus,
                'receive_by_account' => Auth::user()->user_code,
                'account_receive_date' => now(),
                'remark' => $header->remark . $systemRemark . $accRemark
            ]);

            // 4. [NEW] จัดการอัปโหลดไฟล์ (ถ้ามี)
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

            return redirect()->back()->with('success', 'บันทึกการรับคืนสินค้าเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Accounting Confirm Error: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }
}
