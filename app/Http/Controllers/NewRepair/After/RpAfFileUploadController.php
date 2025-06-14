<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\FileUpload;
use Illuminate\Http\Request;

class RpAfFileUploadController extends Controller
{
    public function index(Request $request) {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');
        $file_afters = FileUpload::findByJobIdBefore($job_id,2);
        return response()->json([
           'message' => 'success',
            'file_afters' => $file_afters,
            'job_id' => $job_id,
            'serial_id' => $serial_id,
        ]);
    }

    public function store(Request $request) {

    }
}
