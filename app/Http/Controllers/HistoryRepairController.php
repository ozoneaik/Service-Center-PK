<?php

namespace App\Http\Controllers;

use App\Models\CustomerInJob;
use App\Models\JobList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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
            ->where('job_lists.status','success')
            ->select('serial_id','pid','p_name','image_sku')
            ->groupBy('serial_id','pid','p_name','image_sku')
            ->get();
        return response()->json($search);
    }

    public function detail($serial_id){
        $response = Http::post(env('API_DETAIL'), [
            'sn' => $serial_id,
            'views' => 'single',
        ]);
        $searchResults = $response->json();
        $data = [];
        $data['history'] = $searchResults['assets'][0]['history'];
        return response()->json([
            'message' => 'success',
            'history' => $data['history'],
        ]);
    }
}
