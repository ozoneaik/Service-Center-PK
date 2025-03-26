<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClaimRequest;
use App\Models\Claim;
use App\Models\ClaimDetail;
use App\Models\SparePart;
use App\Models\StockSparePart;
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
        //        $spareParts = SparePart::query()->select('sp_code', 'sp_name', DB::raw('SUM(qty) as qty'), 'sp_unit')
        //            ->leftJoin('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
        //            ->where('spare_parts.status', 'pending')
        //            ->where('spare_parts.sp_warranty',true)
        //            ->orWhere('spare_parts.approve','yes')
        //            ->orWhere('spare_parts.approve_status','yes')
        //            ->where('job_lists.status', 'like', 'success')
        //            ->where('job_lists.user_id', auth()->user()->is_code_cust_id)
        //            ->Orwhere('spare_parts.claim', true)
        //            ->groupBy('sp_code', 'sp_name', 'sp_unit')
        //            ->get();

        $spareParts = SparePart::query()
            ->select('spare_parts.sp_code', 'spare_parts.sp_name', 'spare_parts.sp_unit', DB::raw('SUM(spare_parts.qty) as qty'), 'job_lists.is_code_key')
            ->leftJoin('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
            ->where(function ($query) {
                $query->where('spare_parts.sp_warranty', true)
                    ->orWhere('spare_parts.approve', 'yes');
            })
            ->where('spare_parts.status', 'like', 'pending')
            ->where('job_lists.status', 'like', 'success')
            ->where('job_lists.is_code_key', Auth::user()->is_code_cust_id)
            ->groupBy('spare_parts.sp_code', 'spare_parts.sp_name', 'spare_parts.sp_unit', 'job_lists.is_code_key')
            ->get();


        foreach ($spareParts as $key => $sp) {
            $sp['detail'] = SparePart::query()
                ->leftJoin('job_lists', 'job_lists.job_id', 'spare_parts.job_id')
                ->where('sp_code', $sp['sp_code'])
                ->where('spare_parts.status', 'pending')
                ->where('job_lists.status', 'success')
                ->where('job_lists.is_code_key', Auth::user()->is_code_cust_id)
                ->get();
            // foreach ($sp['detail'] as $k => $sp) {
            //     $test = StockSparePart::query()
            //     ->where('is_code_cust_id',$sp['is_code_key'])->first();
            //     // $sp['details']['stock_local']
            //     $sp->test = $k;
            //     dump($test->toArray(),$sp->toArray());
            // }
            $sp['stock_local'] = StockSparePart::query()
                ->where('is_code_cust_id', $sp['is_code_key'])
                ->where('sp_code', $sp['sp_code'])
                ->first();
        }
        // dd($spareParts->toArray());
        return Inertia::render('SpareClaim/ClaimMain', ['spareParts' => $spareParts]);
    }

    public function store(ClaimRequest $request): JsonResponse
    {
        // dd($request->all());
        $claim_id = 'C-' . Carbon::now()->timestamp;
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
            $text = "ศูนย์ซ่อม : hello world\nแจ้งเรื่อง : เคลม\nรายการ :\n\n" . implode("\n", $items);
            $body = [
                "receive_id" => "ou_9083bf66d2e3240e0313dc50ae7edba9",
                "msg_type" => "text",
                "content" => json_encode(["text" => $text], JSON_UNESCAPED_UNICODE)
            ];
            $response = Http::post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', [
                'app_id' => 'cli_a769d3ae8cf81009',
                'app_secret' => '6QJRSc64IkesVHLTginCxdOlbaaSBe1C'
            ]);
            if ($response->successful()) {
                $responseJson = $response->json();
                $tenant_access_token = $responseJson['tenant_access_token'];

                $responseSend = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $tenant_access_token,
                ])->post('https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id', $body);
                if (!$responseSend->successful()) {
                    throw new \Exception('ไม่สามารถส่งการแจ้งเตือนไปหา lark ได้');
                }
            } else {
                throw new \Exception('ไม่สามารถส่งการแจ้งเตือนไปหา lark ได้');
            }

            DB::commit();
            return response()->json([
                'message' => 'สร้างเอกสารการเคลมสำเร็จ'
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
