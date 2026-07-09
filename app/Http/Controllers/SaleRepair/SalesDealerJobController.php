<?php

namespace App\Http\Controllers\SaleRepair;

use App\Http\Controllers\Controller;
use App\Models\JobList;
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
            $dealers = $this->getManagedDealerList(Auth::user()->user_code);
            return response()->json(['dealers' => $dealers]);
        } catch (\Exception $e) {
            Log::error('SalesDealerJobController::getDealerList: ' . $e->getMessage());
            return response()->json(['dealers' => [], 'message' => $e->getMessage()], 500);
        }
    }

    public function getJobs(Request $request): JsonResponse
    {
        try {
            $saleCode   = Auth::user()->user_code;
            $dealerList = $this->getManagedDealerList($saleCode);

            $dealerCodes   = $dealerList->pluck('is_code_cust_id')->toArray();
            $dealerNameMap = $dealerList->pluck('shop_name', 'is_code_cust_id')->toArray();

            $query = JobList::query()
                ->where(function ($q) use ($dealerCodes, $saleCode) {
                    // jobs ที่ sale สร้างเอง
                    $q->where('user_key', $saleCode);
                    // jobs ที่ร้านค้าในพอร์ตสร้าง (ถ้า API คืนข้อมูลมา)
                    if (!empty($dealerCodes)) {
                        $q->orWhereIn('dealer_code', $dealerCodes);
                    }
                })
                ->whereIn('status', ['send', 'pending', 'success', 'canceled']);

            if ($request->filled('dealer_code')) {
                $query->where('dealer_code', $request->dealer_code);
            }
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('job_id')) {
                $query->where('job_id', 'like', '%' . $request->job_id . '%');
            }
            if ($request->filled('serial_id')) {
                $query->where('serial_id', 'like', '%' . $request->serial_id . '%');
            }
            if ($request->filled('group_job')) {
                $query->where('group_job', 'like', '%' . $request->group_job . '%');
            }
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date,
                    $request->end_date . ' 23:59:59',
                ]);
            }

            $jobs = $query->orderBy('created_at', 'desc')->get();

            $completeIds = $this->getFormCompleteJobIds($jobs->pluck('job_id')->toArray());

            $jobs = $jobs->map(function ($job) use ($dealerNameMap, $completeIds) {
                $job->dealer_shop_name    = $dealerNameMap[$job->dealer_code]
                    ?? $job->dealer_name
                    ?? $job->dealer_code;
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
