<?php

namespace App\Http\Controllers\SendJob;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\logStamp;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class sendJobController extends Controller
{
    public function sendJobList(Request $request): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ส่งซ่อมพิมคินฯ"]);
        $query = JobList::query();
        if (isset($request->searchSku) && isset($request->searchSn)) {
            $query->where('pid', 'like', "%{$request->searchSku}%")->where('serial_id', 'like', "%{$request->searchSn}%");
        } elseif (isset($request->searchSku)) {
            $query->where('pid', 'like', "%{$request->searchSku}%");
        } elseif (isset($request->searchSn)) {
            $query->where('serial_id', 'like', "%{$request->searchSn}%");
        }
        $jobs = $query->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'pending')->orderBy('id', 'desc')->get();
        return Inertia::render('SendJobs/SenJobList', ['jobs' => $jobs]);
    }

    public function updateJobSelect(Request $request): \Illuminate\Http\RedirectResponse
    {
        $selectedJob = $request->selectedJobs;
        try {
            $group_job = time() . rand(1000, 9999);
            $created_at = Carbon::now();
            DB::beginTransaction();
            if (count($selectedJob) > 0) {
                foreach ($selectedJob as $job) {
                    $findJob = JobList::query()->where('job_id', $job['job_id'])->first();
                    $findJob->status = 'send';
                    $findJob->group_job = $group_job;
                    $findJob->created_at = $created_at;
                    $findJob->updated_at = $created_at;
                    $findJob->save();
                }
            } else {
                throw new \Exception('ไม่มีจ็อบที่ต้องการส่ง');
            }
            DB::commit();
            logStamp::query()->create(['description' => Auth::user()->user_code . " กดส่งส่งซ่อมพิมคินฯ สำเร็จ $group_job"]);
            return Redirect::route('sendJobs.list')->with('success', 'ส่งไปยัง PK สำเร็จ');
        } catch (\Exception $exception) {
            DB::rollBack();
            return Redirect::route('sendJobs.list')->with('error', $exception->getMessage());
        }
    }

    public function docJobList(): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ออกเอกสารส่งกลับ"]);
        $groups = JobList::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'send')
            ->select('print_at', 'group_job', 'print_updated_at', 'counter_print', 'created_at')
            ->groupBy('group_job', 'print_at', 'print_updated_at', 'counter_print', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('SendJobs/DocSendJobs', ['groups' => $groups]);
    }

    public function groupDetail($job_group): JsonResponse
    {
        try {
            $job_group = JobList::query()->where('group_job', $job_group)->get();
            return response()->json([
                'message' => 'success',
                'group' => $job_group
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'group' => []
            ], 400);
        }
    }

    public function printJobList($job_group): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " พิมพ์เอกสาร ออกเอกสารส่งกลับ $job_group"]);
        $job_groups = JobList::query()->where('group_job', $job_group)->get();
        if ($job_groups->isEmpty()) {
            $job_groups = [];
        } else {
            $now = Carbon::now();
            foreach ($job_groups as $job) {
                $job['counter_print'] = $job['counter_print'] + 1;
                if (!isset($job['print_at'])) {
                    $job['print_at'] = $now;
                }
                $job['print_updated_at'] = $now;
                $job->save();
            }
        }
        return Inertia::render('SendJobs/PrintSendJob', ['group' => $job_groups, 'job_group' => $job_group]);
    }

}
