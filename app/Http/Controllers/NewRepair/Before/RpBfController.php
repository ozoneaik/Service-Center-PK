<?php

namespace App\Http\Controllers\NewRepair\Before;

use App\Http\Controllers\Controller;
use App\Models\CustomerInJob;
use Illuminate\Http\Request;

class RpBfController extends Controller
{
    public function index(Request $request) {
        $request->validate(['job_id' => 'required'],['job_id.required' => 'job_id is required.']);
        $job_id = $request->job_id;
        try {
            $form = [];
            $form['customer'] = CustomerInJob::findByJobId($job_id);
            $form['remark_symptom'] = [];
            return response()->json([
                'message' => 'ดึงฟอร์มสำเร็จ',
                'error' => null,
                'form' => $form
            ]);
        }catch (\Exception $e){
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getFile() . $e->getLine(),
                'form' => []
            ]);
        }
    }
}
