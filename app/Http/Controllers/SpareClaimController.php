<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClaimRequest;
use App\Models\Claim;
use App\Models\ClaimDetail;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\SparePart;
use App\Models\StoreInformation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpareClaimController extends Controller
{
    // public function index(): Response
    // {
    //     $isCodeKey = Auth::user()->is_code_cust_id;

    //     $spareParts = SparePart::query()
    //         ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
    //         ->select('spare_parts.*')
    //         ->where('spare_parts.status', 'pending')
    //         ->where('spare_parts.claim', true)
    //         ->where('spare_parts.claim_remark', 'เคลมด่วน')
    //         ->where('job_lists.is_code_key', $isCodeKey)
    //         ->get();

    //     $grouped = collect($spareParts)->groupBy('sp_code')->map(function ($items, $sp_code) {
    //         return [
    //             'sp_code' => $sp_code,
    //             'sp_name' => $items->first()->sp_name,
    //             'sp_unit' => $items->first()->sp_unit,
    //             'qty'     => $items->sum('qty'),
    //             'detail'  => $items->values(),
    //         ];
    //     })->values();

    //     return Inertia::render('SpareClaim/ClaimMain', ['spareParts' => $grouped]);
    // }

    // ปรับปรุงฟังก์ชัน index เพื่อรวมเคลมด่วนและเคลมปกติ (วิว)
    public function index(): Response
    {
        $isCodeKey = Auth::user()->is_code_cust_id;

        //  1. เคลมด่วน (pending)
        $urgentParts = SparePart::query()
            ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
            ->select('spare_parts.*', 'job_lists.status as job_status')
            ->where('spare_parts.claim', true)
            ->where('spare_parts.claim_remark', 'เคลมด่วน')
            ->where('spare_parts.status', 'pending')
            ->where('job_lists.is_code_key', $isCodeKey)
            ->orderByDesc('spare_parts.created_at')
            ->get();

        // 2. เคลมปกติ (ไม่ใช่เคลมด่วน แต่ job ปิดงานแล้ว) 
        $normalParts = SparePart::query()
            ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
            ->select('spare_parts.*', 'job_lists.status as job_status')
            ->where('spare_parts.claim', true)
            ->where(function ($q) {
                $q->whereNull('spare_parts.claim_remark')
                    ->orWhere('spare_parts.claim_remark', '!=', 'เคลมด่วน');
            })
            ->where('spare_parts.status', 'pending')
            ->where('job_lists.status', 'success')
            ->where('job_lists.is_code_key', $isCodeKey)
            ->orderByDesc('spare_parts.created_at')
            ->get();

        // รวมทั้งสองประเภท
        $allParts = $urgentParts->merge($normalParts);

        // Group ตาม sp_code
        $grouped = collect($allParts)->groupBy('sp_code')->map(function ($items, $sp_code) {
            $first = $items->first();
            return [
                'sp_code' => $sp_code,
                'sp_name' => $first->sp_name,
                'sp_unit' => $first->sp_unit,
                'qty'     => $items->sum('qty'),
                'type'    => $first->claim_remark === 'เคลมด่วน' ? 'เคลมด่วน' : 'เคลมปกติ',
                'detail'  => $items->values(),
            ];
        })->values();

        return Inertia::render('SpareClaim/ClaimMain', [
            'spareParts' => $grouped,
        ]);
    }

    // public function index(): Response
    // {
    //     $isCodeKey = Auth::user()->is_code_cust_id;

    //     // 1. เคลมด่วน
    //     $urgentParts = SparePart::query()
    //         ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
    //         ->select('spare_parts.*', 'job_lists.status as job_status')
    //         ->where(function ($q) {
    //             $q->where('spare_parts.claim_remark', 'เคลมด่วน')
    //                 ->orWhere('spare_parts.remark_noclaim', 'เคลมด่วน');
    //         })
    //         ->where('spare_parts.status', 'pending')
    //         ->where('job_lists.is_code_key', $isCodeKey)
    //         ->get();

    //     // 2. เคลมปกติ (รวมทั้ง claim = true และ claim = false)
    //     $normalParts = SparePart::query()
    //         ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
    //         ->select('spare_parts.*', 'job_lists.status as job_status')
    //         ->where(function ($q) {
    //             $q->whereNull('spare_parts.claim_remark')
    //                 ->orWhere('spare_parts.claim_remark', '!=', 'เคลมด่วน');
    //         })
    //         ->where('spare_parts.status', 'pending')   // ยังไม่เคลม
    //         ->where('job_lists.status', 'success')     // ปิดงานแล้ว
    //         ->where('job_lists.is_code_key', $isCodeKey)
    //         ->whereIn('spare_parts.claim', [true, false])
    //         ->get();

    //     // รวมสองชุดเข้าด้วยกัน
    //     $allParts = $urgentParts->merge($normalParts);

    //     // Group ตาม sp_code
    //     $grouped = collect($allParts)->groupBy('sp_code')->map(function ($items, $sp_code) {
    //         $first = $items->first();
    //         return [
    //             'sp_code' => $sp_code,
    //             'sp_name' => $first->sp_name,
    //             'sp_unit' => $first->sp_unit,
    //             'qty'     => $items->sum('qty'),
    //             'type'    => $first->claim_remark === 'เคลมด่วน' || $first->remark_noclaim === 'เคลมด่วน'
    //                 ? 'เคลมด่วน'
    //                 : 'เคลมปกติ',
    //             'detail'  => $items->values(),
    //         ];
    //     })->values();

    //     return Inertia::render('SpareClaim/ClaimMain', [
    //         'spareParts' => $grouped,
    //     ]);
    // }

    public function store(ClaimRequest $request): JsonResponse
    {
        // dd($request->all());
        $claim_id = 'C-' . Carbon::now()->timestamp . rand(1000, 9999);
        logStamp::query()->create(['description' => Auth::user()->user_code . " พยายามสร้างเอกสารเคลม $claim_id"]);
        $selected = $request->input('selected');
        $items = [];
        //        "{\\"text\\":\\"ศูนย์ซ่อม : hello world\\\\nแจ้งเรื่อง : เคลม\\\\nรายการ :\\\\n\\\\nSP50122-01*1\\\\nSP50122-02*1\\\\nSP50122-03*1\\"}"}
        DB::beginTransaction();
        Claim::query()->create([
            'claim_id' => $claim_id,
            'user_id' => Auth::user()->is_code_cust_id,
        ]);
        try {
            foreach ($selected as $key => $claim) {
                $items[] = "{$claim['sp_code']}*{$claim['qty']}";
                foreach ($claim['detail'] as $k => $value) {
                    $sp = SparePart::query()
                        ->where('job_id', $value['job_id'])
                        ->where('sp_code', $value['sp_code'])->first();
                    $sp->update(['status' => 'success']);
                    ClaimDetail::query()->create([
                        'claim_id' => $claim_id,
                        'serial_id' => $sp['serial_id'],
                        'job_id' => $sp['job_id'],
                        'sp_code' => $sp->sp_code,
                        'sp_name' => $sp->sp_name,
                        'claim_submit_date' => Carbon::now(),
                        'qty' => $sp->qty,
                        'unit' => $sp->sp_unit,
                    ]);
                }
            }
            $store_info = StoreInformation::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();
            $text_claim_id = "รหัสเอกสารเคลม : $claim_id";
            $text = "ศูนย์ซ่อม : " . $store_info->shop_name . "\n$text_claim_id" . "\nแจ้งเรื่อง : เคลมอะไหล่\nรายการ :\n\n" . implode("\n", $items);
            $token_lark = StoreInformation::query()
                ->leftJoin('sale_information', 'sale_information.sale_code', 'store_information.sale_id')
                ->where('store_information.is_code_cust_id', Auth::user()->is_code_cust_id)
                ->select('sale_information.lark_token')->first();
            $body = [
                "receive_id" => $token_lark->lark_token,
                "msg_type" => "text",
                "content" => json_encode(["text" => $text], JSON_UNESCAPED_UNICODE)
            ];
            $response = Http::post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', [
                'app_id' => env('VITE_LARK_APP_ID'),
                'app_secret' => env('VITE_LARK_APP_SECRET')
            ]);

            $message = 'สร้างเอกสารการเคลมสำเร็จ';
            if ($response->successful()) {
                $responseJson = $response->json();
                $tenant_access_token = $responseJson['tenant_access_token'];

                $responseSend = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $tenant_access_token,
                ])->post('https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id', $body);
                if (!$responseSend->successful()) {
                    $message = 'สร้างเอกสารการเคลมสำเร็จ แต่ไม่สามารถส่งการแจ้งเตือนไปหาเซลล์ประจำร้านได้';
                }
            } else {
                $message = 'สร้างเอกสารการเคลมสำเร็จ แต่ไม่สามารถส่งการแจ้งเตือนไปหาเซลล์ประจำร้านได้';
            }

            DB::commit();
            logStamp::query()->create(['description' => Auth::user()->user_code . " สร้างเอกสารเคลม $claim_id สำเร็จ"]);
            return response()->json([
                'message' => $message
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();
            return response()->json([
                'message' => $exception->getMessage()
            ], 400);
        }
    }

    public function historyShow(): Response
    {
        $history = Claim::query()->where('user_id', Auth::user()->is_code_cust_id)->orderByDesc('created_at')->get();
        foreach ($history as $h) {
            $h['list'] = ClaimDetail::query()
                ->where('claim_details.claim_id', $h->claim_id)
                ->get();
        }
        return Inertia::render('SpareClaim/HistoryClaimNew', [
            'history' => $history
        ]);
    }

    public function historyDetail($claim_id): Response
    {
        $claim = Claim::query()->where('claim_id', $claim_id)->first();
        $list = ClaimDetail::query()->where('claim_id', $claim_id)->get();
        return Inertia::render('SpareClaim/HistoryClaimNewDetail', [
            'list' => $list,
            'claim_id' => $claim_id,
            'claim' => $claim
        ]);
    }

    public function pendingShow(): Response
    {
        $list = Claim::query()->leftJoin('claim_details', 'claim_details.claim_id', '=', 'claims.claim_id')
            ->leftJoin('job_lists', 'claim_details.job_id', '=', 'job_lists.job_id')
            ->leftJoin('customer_in_jobs', 'job_lists.job_id', '=', 'customer_in_jobs.job_id')
            ->where('claim_details.status', 'pending')
            ->where('user_id', Auth::user()->is_code_cust_id)
            ->select(
                'claims.*',
                'claim_details.job_id',
                'customer_in_jobs.name',
                'customer_in_jobs.phone',
                'claim_details.serial_id',
                'claim_details.sp_code',
                'claim_details.sp_name',
                'claim_details.unit',
                'claim_details.qty',
                'claim_details.claim_submit_date',
            )
            ->orderByDesc('claim_details.created_at')
            ->get();
        //        dd($list->toArray());
        return Inertia::render('SpareClaim/PendingClaim', [
            'list' => $list
        ]);
    }

    //เพิ่มฟังก์ชั่น Check Status Order
    public function checkStatusClaim(Request $request): JsonResponse
    {
        $claim_id = $request->input('claim_id');
        if (empty($claim_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Claim ID ไม่ถูกต้อง'
            ], 400);
        }
        try {
            DB::beginTransaction();
            $uri = env('VITE_API_CHECK_ORDER');
            $claim_id_remove_prefix = str_replace('C-', '', $claim_id);
            $body = [
                'jobno' => $claim_id_remove_prefix,
                'type' => 'claim'
            ];
            Log::info('📦 เริ่มเช็คสถานะออเดอร์', [
                'claim_id' => $claim_id,
                'endpoint' => $uri,
                'request_body' => $claim_id_remove_prefix
            ]);

            $response = Http::post($uri, $body);
            Log::info('API Resposne', [
                'claim_id' => $claim_id,
                'http_status' => $response->status(),
                'raw_body' => $response->body(),
            ]);

            if ($response->successful() && $response->status() == 200) {
                $claim = Claim::query()->where('claim_id', $claim_id)->first();
                if (!$claim) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'ไม่พบรหัส id ที่ต้องการ update'
                    ], 400);
                }
                $response_json = $response->json();
                $externalStatus = $response_json['status'] ?? null;
                Log::info('สถานะปัจจุบันการเคลม', [
                    'claim_id' => $claim_id,
                    'status_old' => $claim->status,
                    'status_from_api' => $externalStatus,
                ]);

                if ($externalStatus) {
                    $claim->status = $externalStatus;
                    $claim->save();

                    Log::info('Update Status SuccessFully', [
                        'claim_id' => $claim_id,
                        'status' => $claim->status
                    ]);
                }

                DB::commit();
                return response()->json([
                    'status' => 'success',
                    'data' => ['status' => $claim->status]
                ]);
            } else {
                throw new \Exception('API ไม่สําเร็จ');
            }
        } catch (\Exception $exception) {
            DB::rollBack();
            Log::error('❌ ตรวจสอบสถานะล้มเหลว', [
                'claim_id' => $claim_id,
                'error' => $exception->getMessage(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage()
            ], 400);
        }
    }
}
