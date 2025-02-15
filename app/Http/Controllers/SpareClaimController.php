<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\ClaimDetail;
use App\Models\SparePart;
use App\Models\SparePartWarranty;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SpareClaimController extends Controller
{
    public function index(): Response
    {
        $spareParts = SparePartWarranty::query()->select('sp_code', 'sp_name', DB::raw('SUM(qty) as qty'), 'sp_unit')
            ->leftJoin('job_lists', 'job_lists.job_id', '=', 'spare_part_warranties.job_id')
            ->where('spare_part_warranties.status', 'pending')
            ->where('job_lists.status', 'like', 'success')
            ->where('job_lists.user_id', auth()->user()->is_code_cust_id)
            ->groupBy('sp_code', 'sp_name', 'sp_unit')
            ->get();
        foreach ($spareParts as $key => $sp) {
            $sp['detail'] = SparePartWarranty::query()
                ->leftJoin('job_lists','job_lists.job_id','spare_part_warranties.job_id')
                ->where('sp_code', $sp['sp_code'])
                ->where('spare_part_warranties.status', 'pending')
                ->where('job_lists.status', 'success')
                ->where('job_lists.user_id', auth()->user()->is_code_cust_id)
                ->get();
        }
        return Inertia::render('SpareClaim/ClaimPending', ['spareParts' => $spareParts]);
    }

    public function historyShow(): Response
    {
        $history = Claim::query()->where('user_id',auth()->user()->is_code_cust_id)->orderByDesc('created_at')->get();
        foreach ($history as $h) {
            $h['list'] = ClaimDetail::query()
                ->where('claim_details.claim_id', $h->claim_id)
                ->get();
        }
        return Inertia::render('SpareClaim/HistoryClaim',[
            'history' => $history
        ]);
    }
}
