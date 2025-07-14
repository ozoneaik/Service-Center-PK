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

class SpareClaimController extends Controller
{
    public function index(): Response
    {
        $job_success = JobList::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'success')
            ->get();
        $sp_selected = [];

        $global_index = 0;
        foreach ($job_success as $job) {
            $spareParts = SparePart::query()
                ->where('job_id', $job->job_id)
                ->where('status', 'pending')
                ->where('price_multiple_gp', 0)
                ->get();

            foreach ($spareParts as $sp) {
                $should_add = false;

                if ($job->warranty) {
                    // ถ้ามี warranty ให้เช็คทั้ง remark_noclaim และ claim
                    if ($sp->remark_noclaim == 'เคลมปกติ' || $sp->claim) {
                        $should_add = true;
                    }
                } else {
                    // ถ้าไม่มี warranty ให้เช็คแค่ claim
                    if ($sp->claim) {
                        $should_add = true;
                    }
                }

                if ($should_add) {
                    $sp_selected[$global_index] = $sp->toArray();
                    $global_index++;
                }
            }
        }

        $sp_selected_alt = [];

        foreach ($job_success as $job) {
            $spareParts = SparePart::query()
                ->where('job_id', $job->job_id)
                ->where('status', 'pending')
                ->where('price_multiple_gp', 0)
                ->get();

            foreach ($spareParts as $sp) {
                if ($job->warranty) {
                    if ($sp->remark_noclaim == 'เคลมปกติ' || $sp->claim) {
                        $sp_selected_alt[] = $sp->toArray();
                    }
                } else {
                    if ($sp->claim) {
                        $sp_selected_alt[] = $sp->toArray();
                    }
                }
            }
        }

        $groupAssoc = [];

        foreach ($sp_selected_alt as $item) {
            $code = $item['sp_code'];
            if (!isset($groupAssoc[$code])) {
                $groupAssoc[$code] = [
                    'sp_code' => $item['sp_code'],
                    'sp_name' => $item['sp_name'],
                    'sp_unit' => $item['sp_unit'],
                    'qty' => 0,
                    'detail' => [],
                ];
            }
            $groupAssoc[$code]['qty'] += $item['qty'];
            $groupAssoc[$code]['detail'][] = $item;
        }
        $group = array_values($groupAssoc);


        return Inertia::render('SpareClaim/ClaimMain', ['spareParts' => $group]);
    }

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
        return Inertia::render('SpareClaim/HistoryClaim', [
            'history' => $history
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
}
