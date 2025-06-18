<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\AccessoriesNote;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\Remark;
use App\Models\SparePart;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class RpAfSummaryController extends Controller
{
    public function index(Request $request) : JsonResponse{
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');

        $customer = CustomerInJob::findByJobId($job_id);
        $behaviours = Behavior::findByJob($job_id);
        $file_uploads = [
            'file_befores' => FileUpload::findByJobIdBefore($job_id,1),
            'file_afters' => FileUpload::query()->where('job_id',$job_id)->whereIn('menu_id',[2,3,4,5])->get() ?? []
        ];
        $symptoms = Symptom::findByJobId($job_id);
        $remark = Remark::findByJobId($job_id);
        $accessory = AccessoriesNote::findByJobId($job_id);
        $spare_parts = SparePart::findByJobId($job_id);


        return response()->json([
            'job_id' => $job_id,
            'serial_id' => $serial_id,
            'customer' => $customer,
            'behaviours' => $behaviours,
            'file_uploads' => $file_uploads,
            'symptoms' => $symptoms,
            'remark' => $remark,
            'accessory' => $accessory,
            'spare_parts' => $spare_parts,
            'message' => 'success',
            'error' => null,
        ]);
    }
}
