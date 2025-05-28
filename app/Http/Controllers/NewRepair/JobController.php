<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Models\CustomerInJob;
use App\Models\JobList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class JobController extends Controller
{
    public function found($serial_id): JsonResponse
    {
        try {
            $found = JobList::query()->where('serial_id', $serial_id)->orderBy('id','desc')->first();
            if ($found && $found->is_code_key === Auth::user()->is_code_cust_id) {
                $customer = $this->customerDetail($found->job_id);
                return response()->json([
                    'message' => 'เจอข้อมูล',
                    'job' => [
                        'job_detail' => $found,
                        'customer' => $customer,
                    ],
                ]);
            }else{
                $status = 404;
                throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getFile() . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'data' => [],
            ],$status ?? 400);
        }
    }

    private function customerDetail($job_id): array
    {
        return CustomerInJob::findByJobId($job_id);
//        return $customer->findByJobId($job_id);
    }


}
