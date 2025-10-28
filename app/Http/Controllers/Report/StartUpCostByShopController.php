<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StartUpCost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StartUpCostByShopController extends Controller
{
    public function index()
    {
        $jobs = JobList::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'success')
            ->where('warranty', true)
            ->orderBy('created_at', 'desc')
            ->paginate(100);

        $jobs_all = JobList::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'success')
            ->where('warranty', true)
            ->orderBy('created_at', 'desc')
            ->get();

        // foreach ($jobs as $key => $job) {
        //     $jobs[$key] = $job;
        //     $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
        //     $jobs[$key]['start_up_cost'] = (float) $start_up_cost['startup_cost'] ?? 0;
        // }
        foreach ($jobs as $key => $job) {
            $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
            $jobs[$key]['start_up_cost'] = $start_up_cost ? (float) $start_up_cost->startup_cost : 0;
        }

        $total_start_up_cost = 0;
        // foreach ($jobs_all as $job) {
        //     $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
        //     $total_start_up_cost += (float) $start_up_cost['startup_cost'] ?? 0;
        // }
        foreach ($jobs_all as $job) {
            $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
            $total_start_up_cost += $start_up_cost ? (float) $start_up_cost->startup_cost : 0;
        }
        return Inertia::render('Reports/StartUpCostByShop/SucBsList', ['jobs' => $jobs, 'total_start_up_cost' => $total_start_up_cost]);
    }
}
