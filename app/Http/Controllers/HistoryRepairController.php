<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\JobList;
use App\Models\Remark;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class HistoryRepairController extends Controller
{
    public function index(): Response
    {
        $jobs = JobList::query()
            ->where('is_code_key', auth()->user()->is_code_cust_id)
            ->orderBy('id', 'desc')
            ->get();
        return Inertia::render('HistoryPage/HistoryMain',['jobs' => $jobs]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(
            ['search' => 'required', 'type' => 'required'],
            ['search.required' => 'search is required', 'type.required' => 'search is required']
        );

        $search = CustomerInJob::query()
            ->leftJoin('job_lists', 'job_lists.job_id', '=', 'customer_in_jobs.job_id')
            ->where('phone', $request->get('search'))
            ->where('job_lists.status', 'success')
            ->select('job_lists.serial_id', 'job_lists.pid', 'job_lists.p_name', 'job_lists.image_sku', 'job_lists.warranty as warranty_status')
            ->groupBy('job_lists.serial_id', 'job_lists.pid', 'job_lists.p_name', 'job_lists.image_sku', 'job_lists.warranty')
            ->get();
        return response()->json($search);
    }

    public function detail($serial_id): JsonResponse
    {
        $response = Http::post(env('API_DETAIL'), [
            'sn' => $serial_id,
            'views' => 'single',
        ]);
        $searchResults = $response->json();
        $data = [];
        $hisSystem = $this->historyInSystem($serial_id);
        $data['history'] = array_merge($hisSystem, $searchResults['assets'][0]['history']);
        return response()->json([
            'message' => 'success',
            'history' => $data['history'],
        ]);
    }


    private function historyInSystem($serial_id)
    {
        $jobs = JobList::query()->where('serial_id', $serial_id)
            ->where('user_id', auth()->user()->is_code_cust_id)
            ->orderBy('id', 'desc')
            ->get();
        $histories = [];
        foreach ($jobs as $key => $job) {
            $remark = Remark::query()->where('job_id', $job->job_id)->first();
            $histories[$key]['remark'] = $remark ? $remark->remark : 'ไม่มีข้อมูล';
            $histories[$key]['endservice'] = $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : 'N/A';
            $sparePart = SparePart::query()->where('job_id', $job->job_id)
                ->select('qty', 'sp_unit as unit', 'sp_code as spcode', 'sp_name as spname')->get();
            $histories[$key]['sparepart'] = $sparePart->toArray();
            $behavior = Behavior::query()->where('job_id', $job->job_id)->select('behavior_name as behaviorname')->get();
            $histories[$key]['behavior'] = $behavior->toArray();
        }
        return $histories;
    }
}
