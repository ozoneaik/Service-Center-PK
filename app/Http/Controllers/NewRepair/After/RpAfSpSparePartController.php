<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\Request;

class RpAfSpSparePartController extends Controller
{
    public function index(Request $request) {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');
        $spare_parts = SparePart::findByJobId($job_id);

        return response()->json([
           'message' => 'success',
           'job_id' => $job_id,
           'serial_id' => $serial_id,
            'spare_parts' => $spare_parts,
        ]);
    }

    public function store(Request $request) {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');

        return response()->json([
            'message' => 'success',
            'job_id' => $job_id,
            'serial_id' => $serial_id,
        ]);
    }
}
