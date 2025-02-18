<?php

namespace App\Http\Controllers;

use App\Models\CustomerInJob;
use App\Models\JobList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HistoryRepairController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('HistoryPage/HistoryMain');
    }

    public function search(Request $request)
    {
        $request->validate(
            ['search' => 'required', 'type' => 'required'],
            ['search.required' => 'search is required', 'type.required' => 'search is required']
        );

        $search = CustomerInJob::query()
            ->leftJoin('job_lists', 'job_lists.job_id', '=', 'customer_in_jobs.job_id')
            ->where('phone',$request->get('search'))
            ->select('serial_id','pid','p_name','image_sku')
            ->groupBy('serial_id','pid','p_name','image_sku')
            ->get();
        $data = [];
        foreach ($search as $key=>$value) {
            $l = JobList::query()->where('serial_id',$value->serial_id)->orderBy('created_at','desc')->get();
            $data[$key]['detail'] = $value->toArray();
            $data[$key]['list'] = $l->toArray();
        }



        return response()->json($data);
    }
}
