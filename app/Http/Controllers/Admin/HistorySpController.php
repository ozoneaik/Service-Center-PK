<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HistorySpController extends Controller
{
    public function index(Request $request){
        $query = JobList::query()
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            ->whereMonth('job_lists.created_at', now()->month)
            ->whereYear('job_lists.created_at', now()->year)
            ->select('job_lists.*', 'customer_in_jobs.name', 'customer_in_jobs.phone');

        // ค้นหาตาม serial_id
        if ($request->filled('serial_id')) {
            $query->where('job_lists.serial_id', 'like', "%{$request->serial_id}%");
        }

        // ค้นหาตาม job_id
        if ($request->filled('job_id')) {
            $query->where('job_lists.job_id', 'like', "%{$request->job_id}%");
        }

        // ค้นหาตามเบอร์โทรศัพท์
        if ($request->filled('phone')) {
            $query->where('customer_in_jobs.phone', 'like', "%{$request->phone}%");
        }

        // ค้นหาตามชื่อลูกค้า
        if ($request->filled('name')) {
            $query->where('customer_in_jobs.name', 'like', "%{$request->name}%");
        }

        // ค้นหาตามสถานะการซ่อม
        if ($request->filled('status')) {
            $query->where('job_lists.status', $request->status);
        }

        $jobs = $query->orderBy('job_lists.id', 'desc')->get();
        
        return Inertia::render('HistoryPage/HistoryMain', ['jobs' => $jobs]);
    }
}
