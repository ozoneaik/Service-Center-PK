<?php

namespace App\Http\Controllers\DealerRepair;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StoreInformation;
use App\Traits\FetchesPkApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DealerSearchController extends Controller
{
    use FetchesPkApi;

    public function index(Request $request): Response
    {
        $user   = Auth::user();
        $isSale = $user->role === 'sale';

        if ($isSale) {
            $selectedDealer = $request->dealer_code;

            if (isset($request->job_id)) {
                $dealerCodes = $this->fetchCustIds($user->user_code);

                $job = JobList::query()
                    ->where('job_id', $request->job_id)
                    ->whereIn('dealer_code', $dealerCodes)
                    ->first();

                if (!$job) {
                    abort(403, 'ไม่พบงานซ่อม หรือไม่มีสิทธิ์เข้าถึง');
                }

                $autoSn = str_starts_with($job->serial_id, '9999') ? '9999' : $job->serial_id;

                return Inertia::render('DealerRepair/DealerRepair', [
                    'auto_sn'         => $autoSn,
                    'auto_pid'        => $job->pid,
                    'auto_job_sn'     => $job->serial_id,
                    'selected_dealer' => $job->dealer_code,
                    'is_sale'         => true,
                ]);
            }

            return Inertia::render('DealerRepair/DealerRepair', [
                'selected_dealer' => $selectedDealer,
                'is_sale'         => true,
            ]);
        }

        if (isset($request->job_id)) {
            $jobQuery = JobList::query()->where('job_id', $request->job_id);

            // admin เข้าถึงได้ทุก job โดยไม่ต้องกรอง dealer_code
            if ($user->role !== 'admin') {
                $jobQuery->where('dealer_code', $user->is_code_cust_id);
            }

            $job = $jobQuery->first();

            if (!$job) {
                abort(403, 'ไม่พบงานซ่อม หรือไม่มีสิทธิ์เข้าถึง');
            }

            $autoSn = str_starts_with($job->serial_id, '9999') ? '9999' : $job->serial_id;

            return Inertia::render('DealerRepair/DealerRepair', [
                'auto_sn'     => $autoSn,
                'auto_pid'    => $job->pid,
                'auto_job_sn' => $job->serial_id,
                'auto_dealer_code' => $job->dealer_code,
            ]);
        }

        return Inertia::render('DealerRepair/DealerRepair');
    }

    public function history(Request $request): Response
    {
        $user   = Auth::user();
        $isSale = $user->role === 'sale';

        if ($isSale) {
            $dealerList  = $this->getManagedDealerList($user->user_code);
            $dealerCodes = $dealerList->pluck('is_code_cust_id')->toArray();

            $jobs = JobList::query()
                ->leftJoin('sale_information', 'sale_information.sale_code', '=', 'job_lists.user_key')
                ->whereIn('job_lists.dealer_code', $dealerCodes)
                ->when($request->dealer_code, fn($q, $dc) => $q->where('job_lists.dealer_code', $dc))
                ->when($request->search, function ($q, $search) {
                    $q->where(function ($inner) use ($search) {
                        $inner->where('job_lists.job_id', 'like', "%{$search}%")
                            ->orWhere('job_lists.serial_id', 'like', "%{$search}%")
                            ->orWhere('job_lists.p_name', 'like', "%{$search}%")
                            ->orWhere('job_lists.pid', 'like', "%{$search}%");
                    });
                })
                ->select('job_lists.*', 'sale_information.name as created_by_sale_name')
                ->orderBy('job_lists.id', 'desc')
                ->paginate(15)
                ->withQueryString();

            return Inertia::render('DealerRepair/DealerHistory', [
                'jobs'            => $jobs,
                'dealer_list'     => $dealerList,
                'selected_dealer' => $request->dealer_code,
                'is_sale'         => true,
            ]);
        }

        $jobs = JobList::query()
            ->leftJoin('sale_information', 'sale_information.sale_code', '=', 'job_lists.user_key')
            ->where('job_lists.dealer_code', $user->is_code_cust_id)
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('job_lists.job_id', 'like', "%{$search}%")
                        ->orWhere('job_lists.serial_id', 'like', "%{$search}%")
                        ->orWhere('job_lists.p_name', 'like', "%{$search}%")
                        ->orWhere('job_lists.pid', 'like', "%{$search}%");
                });
            })
            ->select('job_lists.*', 'sale_information.name as created_by_sale_name')
            ->orderBy('job_lists.id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('DealerRepair/DealerHistory', [
            'jobs' => $jobs,
        ]);
    }

    public function dealerList(): JsonResponse
    {
        $user = Auth::user();
        if ($user->role !== 'sale') {
            return response()->json(['dealers' => []]);
        }
        return response()->json([
            'dealers' => $this->getManagedDealerList($user->user_code),
        ]);
    }
}
