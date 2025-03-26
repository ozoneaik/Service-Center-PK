<?php

namespace App\Http\Controllers\SendJob;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class sendJobController extends Controller
{
    /**
     * @return Response
     */
    public function sendJobList(): Response
    {
        $jobs = JobList::query()
            ->where('is_code_key',Auth::user()->is_code_cust_id)
            ->where('status','pending')
            ->orderBy('id','desc')
            ->get();

        return Inertia::render('SendJobs/SenJobList',['jobs'=>$jobs]);
    }

    public function updateJobSelect(Request $request){
        $selectedJob = $request->selectedJobs;
        try {
            DB::beginTransaction();
            if(count($selectedJob) > 0){
                foreach ($selectedJob as $job){
                    $findJob = JobList::query()->where('job_id',$job['job_id'])->first();
                    $findJob->status = 'send';
                    $findJob->save();
                }
            }else{
                throw new \Exception('ไม่มีจ็อบที่ต้องการส่ง');
            }
            DB::commit();
            return Redirect::route('sendJobs.list')->with('success','ส่งไปยัง PK สำเร็จ');
        }catch (\Exception $exception){
            DB::rollBack();
            return Redirect::route('sendJobs.list')->with('error',$exception->getMessage());
        }
    }

    public function docJobList(){
        return Inertia::render('SendJobs/DocJobList');
    }
}
