<?php

namespace App\Http\Controllers\SaleRepair;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StoreInformation;
use App\Traits\FetchesPkApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SalesDealerJobController extends Controller
{
    use FetchesPkApi;
    public function index(): Response
    {
        $user = Auth::user();
        if ($user->role !== 'sale' && $user->role !== 'admin') {
            abort(403, 'เฉพาะพนักงานขายเท่านั้น');
        }

        return Inertia::render('Sales/DealerJobsForSales', [
            'sale_code' => $user->user_code,
        ]);
    }

    public function getDealerList(): JsonResponse
    {
        try {
            $user    = Auth::user();
            $isAdmin = $user->role === 'admin' || $user->admin_that_branch;

            if ($isAdmin) {
                $dealerCodes = JobList::query()
                    ->whereIn('status', ['send', 'pending', 'success', 'canceled'])
                    ->where('created_job_from', 'dealer')
                    ->whereNotNull('dealer_code')
                    ->distinct()
                    ->pluck('dealer_code')
                    ->toArray();

                // ชื่อจาก store_information (แหล่งหลัก)
                $storeNames = StoreInformation::whereIn('is_code_cust_id', $dealerCodes)
                    ->pluck('shop_name', 'is_code_cust_id')
                    ->toArray();

                // ชื่อจาก job_lists.dealer_name (fallback สำหรับ code ที่ไม่มีใน store_information)
                $jobNames = JobList::whereIn('dealer_code', $dealerCodes)
                    ->whereNotNull('dealer_name')
                    ->where('dealer_name', '!=', '')
                    ->pluck('dealer_name', 'dealer_code')
                    ->toArray();

                $dealers = collect($dealerCodes)
                    ->map(fn($code) => [
                        'is_code_cust_id' => $code,
                        'shop_name'       => $storeNames[$code] ?? $jobNames[$code] ?? $code,
                    ])
                    ->sortBy('shop_name')
                    ->values();

                return response()->json(['dealers' => $dealers]);
            }

            $dealers = $this->getManagedDealerList($user->user_code);
            return response()->json(['dealers' => $dealers]);
        } catch (\Exception $e) {
            Log::error('SalesDealerJobController::getDealerList: ' . $e->getMessage());
            return response()->json(['dealers' => [], 'message' => $e->getMessage()], 500);
        }
    }

    public function getJobs(Request $request): JsonResponse
    {
        try {
            $user    = Auth::user();
            $isAdmin = $user->role === 'admin' || $user->admin_that_branch;

            if ($isAdmin) {
                $dealerNameMap = StoreInformation::whereNotNull('is_code_cust_id')
                    ->where('is_code_cust_id', '!=', '')
                    ->where('shop_type', 'dealer')
                    ->pluck('shop_name', 'is_code_cust_id')
                    ->toArray();
            } else {
                $saleCode      = $user->user_code;
                $dealerList = $this->getManagedDealerList($saleCode);
                $dealerCodes   = $dealerList->pluck('is_code_cust_id')->toArray();
                $dealerNameMap = $dealerList->pluck('shop_name', 'is_code_cust_id')->toArray();
            }

            $query = JobList::query()
                ->whereIn('status', ['send', 'pending', 'success', 'canceled'])
                ->where('created_job_from', '=', 'dealer');

            // sale กรองเฉพาะ dealer ในพอร์ต; admin เห็นทุก dealer
            if (!$isAdmin) {
                $query->where(function ($q) use ($dealerCodes, $saleCode) {
                    $q->where('user_key', $saleCode);
                    if (!empty($dealerCodes)) {
                        $q->orWhereIn('dealer_code', $dealerCodes);
                    }
                });
            }

            if ($request->filled('dealer_code')) $query->where('dealer_code', $request->dealer_code);
            if ($request->filled('status'))      $query->where('status', $request->status);
            if ($request->filled('job_id'))      $query->where('job_id', 'like', '%' . $request->job_id . '%');
            if ($request->filled('serial_id'))   $query->where('serial_id', 'like', '%' . $request->serial_id . '%');
            if ($request->filled('group_job'))   $query->where('group_job', 'like', '%' . $request->group_job . '%');
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [$request->start_date, $request->end_date . ' 23:59:59']);
            }

            $jobs        = $query->orderBy('created_at', 'desc')->get();
            $completeIds = $this->getFormCompleteJobIds($jobs->pluck('job_id')->toArray());

            $jobs = $jobs->map(function ($job) use ($dealerNameMap, $completeIds) {
                $job->dealer_shop_name     = $dealerNameMap[$job->dealer_code] ?? $job->dealer_name ?? $job->dealer_code;
                $job->before_form_complete = in_array($job->job_id, $completeIds);
                return $job;
            });

            return response()->json(['jobs' => $jobs, 'message' => 'success']);
        } catch (\Exception $e) {
            Log::error('SalesDealerJobController::getJobs: ' . $e->getMessage());
            return response()->json(['jobs' => [], 'message' => $e->getMessage()], 500);
        }
    }

}
