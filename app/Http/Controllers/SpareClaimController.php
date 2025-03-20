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
        DB::beginTransaction();
        Claim::query()->create([
            'claim_id' => $claim_id,
            'user_id' => Auth::user()->is_code_cust_id,
        ]);
        try {
            foreach ($selected as $key => $claim) {
                if (isset($claim['stock_local']['qty_sp']) && intval($claim['qty']) > $claim['stock_local']['qty_sp']) {
                    $message = 'จำนวนอะไหล่ ' . $claim['sp_code'] . ' ในสต็อกไม่เพียงพอ กรุณาเพิ่มจำนวนอะไหล่ในหน้าจัดการบริการตัวเอง';
                    throw new \Exception($message);
                } elseif (!isset($claim['stock_local']['qty_sp'])) {
                    $message = 'ไม่พบข้อมูลจำนวนอะไหล่ ' . $claim['sp_code'] . ' ในสต็อก กรุณาเพิ่มจำนวนอะไหล่ในหน้าจัดการบริการตัวเอง';
                    throw new \Exception($message);
                }
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
