<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobRequest;
use App\Models\JobList;
use Illuminate\Http\JsonResponse;

class JobController extends Controller
{
    public function update(JobRequest $request) : JsonResponse{
        $job_id = $request->input('job_id');
        $job = JobList::query()->where('job_id',$job_id)->update([
           'status' => 'success'
        ]);
        return response()->json([
            'message' => 'Job updated successfully',
            'job' => $job,
        ]);
    }
}
