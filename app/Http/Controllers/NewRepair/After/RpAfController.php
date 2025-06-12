<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\Behavior;
use App\Models\FileUpload;
use App\Models\SparePart;
use Illuminate\Http\Request;

class RpAfController extends Controller
{
    public function index(Request $request)
    {
        $step = 0;
        $serial_id = $request->get('serial_id');
        $job_id = $request->get('job_id');
        $check_behaviours = Behavior::search($job_id);
        if ($check_behaviours !== null) {
            $step = 1; // ไปยัง step เลือกรายการอะไหล่
        }
        $check_sp = SparePart::search($job_id);
        if ($check_sp !== null) {
            $step = 2; // ไปยัง step ใบนำเสนอราคา
        }
        $check_upload_after_file = FileUpload::search($job_id, 2);
        if ($check_upload_after_file !== null) {
            $step = 4; //ไปยัง step สรุปการทำงาน
        }
        return response()->json([
            'step' => $step,
        ]);
    }
}
