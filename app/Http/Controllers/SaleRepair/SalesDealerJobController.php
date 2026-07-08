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
            $saleCode = Auth::user()->user_code;
            $custIds  = $this->fetchCustIds($saleCode);

            $dealers = StoreInformation::whereIn('is_code_cust_id', $custIds)
                ->where('shop_type', 'dealer')
                ->select('is_code_cust_id', 'shop_name')
                ->orderBy('shop_name')
                ->get();

            return response()->json(['dealers' => $dealers]);
        } catch (\Exception $e) {
            Log::error('SalesDealerJobController::getDealerList: ' . $e->getMessage());
            return response()->json(['dealers' => [], 'message' => $e->getMessage()], 500);
        }
    }

    public function getJobs(Request $request): JsonResponse
    {
        try {
            $saleCode = Auth::user()->user_code;
            $custIds  = $this->fetchCustIds($saleCode);

            if (empty($custIds)) {
                return response()->json(['jobs' => [], 'message' => 'ไม่พบร้านค้าในความดูแล']);
            }

            $dealerCodes = StoreInformation::whereIn('is_code_cust_id', $custIds)
                ->where('shop_type', 'dealer')
                ->pluck('is_code_cust_id')
                ->toArray();

            if (empty($dealerCodes)) {
                return response()->json(['jobs' => [], 'message' => 'ยังไม่มีร้านค้า (Dealer) ในความดูแลที่อยู่ในระบบ']);
            }

            $query = JobList::query()
                ->join('store_information as si', 'si.is_code_cust_id', '=', 'job_lists.dealer_code')
                ->whereIn('job_lists.dealer_code', $dealerCodes)
                ->whereNotNull('job_lists.group_job')
                ->whereIn('job_lists.status', ['send', 'pending', 'success']);

            if ($request->filled('dealer_code')) {
                $query->where('job_lists.dealer_code', $request->dealer_code);
            }
            if ($request->filled('status')) {
                $query->where('job_lists.status', $request->status);
            }
            if ($request->filled('job_id')) {
                $query->where('job_lists.job_id', 'like', '%' . $request->job_id . '%');
            }
            if ($request->filled('serial_id')) {
                $query->where('job_lists.serial_id', 'like', '%' . $request->serial_id . '%');
            }
            if ($request->filled('group_job')) {
                $query->where('job_lists.group_job', 'like', '%' . $request->group_job . '%');
            }
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('job_lists.created_at', [
                    $request->start_date,
                    $request->end_date . ' 23:59:59',
                ]);
            }

            $jobs = $query
                ->select('job_lists.*', 'si.shop_name as dealer_shop_name')
                ->orderBy('job_lists.created_at', 'desc')
                ->get();

            return response()->json(['jobs' => $jobs, 'message' => 'success']);
        } catch (\Exception $e) {
            Log::error('SalesDealerJobController::getJobs: ' . $e->getMessage());
            return response()->json(['jobs' => [], 'message' => $e->getMessage()], 500);
        }
    }

}
