<?php

namespace App\Http\Controllers\DealerRepair;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DealerSearchController extends Controller
{
    public function index(Request $request): Response
    {
        if (isset($request->job_id)) {
            $job = JobList::query()
                ->where('job_id', $request->job_id)
                ->where('dealer_code', Auth::user()->is_code_cust_id)
                ->first();

            if (!$job) {
                abort(403, 'ไม่พบงานซ่อม หรือไม่มีสิทธิ์เข้าถึง');
            }

            // serial_id แบบ 9999-XXXXX ต้องค้นสินค้าด้วย "9999" (PID search)
            // แต่ DealerRpMain ต้องการ serial จริงเพื่อ searchJob ตรง
            $autoSn = str_starts_with($job->serial_id, '9999') ? '9999' : $job->serial_id;

            return Inertia::render('DealerRepair/DealerRepair', [
                'auto_sn'     => $autoSn,
                'auto_pid'    => $job->pid,
                'auto_job_sn' => $job->serial_id,
            ]);
        }

        return Inertia::render('DealerRepair/DealerRepair');
    }

    public function history(Request $request): Response
    {
        $user = Auth::user();
        $jobs = JobList::query()
            ->where('dealer_code', $user->is_code_cust_id)
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('job_id', 'like', "%{$search}%")
                        ->orWhere('serial_id', 'like', "%{$search}%")
                        ->orWhere('p_name', 'like', "%{$search}%")
                        ->orWhere('pid', 'like', "%{$search}%");
                });
            })
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('DealerRepair/DealerHistory', [
            'jobs' => $jobs,
        ]);
    }
}
