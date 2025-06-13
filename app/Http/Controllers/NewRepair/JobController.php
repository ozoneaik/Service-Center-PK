<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Http\Requests\Repair\Job\JobStoreRequest;
use App\Models\CustomerInJob;
use App\Models\JobList;
use App\Models\Remark;
use App\Models\WarrantyProduct;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class JobController extends Controller
{
    public function searchJob(Request $request): JsonResponse
    {
        $serial_id = $request->serial_id;
        $pid = $request->pid;
        try {
            $found = JobList::query()
                ->where('serial_id', $serial_id)
                ->where('pid', $pid)
                ->orderBy('id','desc')->first();
            if ($found && $found->is_code_key === Auth::user()->is_code_cust_id) {

                if ($found->status === 'pending') {
                    return response()->json([
                        'message' => 'เจอข้อมูล',
                        'found' => true,
                        'job' => ['job_detail' => $found]
                    ]);
                }elseif ($found->status === 'send') {
                    throw new \Exception('ส่งไปยัง pumpkin');
                }else{
                    $status = 404;
                    throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
                }

            }elseif ($found && $found->is_code_key !== Auth::user()->is_code_cust_id){
                throw new \Exception('<span>ถูกซ่อมโดยที่อื่น</span>');
            }
            else{
                $status = 404;
                throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getFile() . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'found' => false,
                'data' => [],
            ],$status ?? 400);
        }
    }

    public function storeJob(JobStoreRequest $request) {
        $serial_id = $request->get('serial_id');
        $product_detail = $request->get('productDetail');
        $new_job_id = 'JOB-'.time().rand(0,99999);
        $store_job = JobList::query()->create([
           'serial_id' => $serial_id,
            'job_id' => $new_job_id,
            'pid' => $product_detail['pid'],
            'p_name' => $product_detail['pname'],
            'p_base_unit' => $product_detail['pbaseunit'],
            'p_cat_id' => $product_detail['pcatid'],
            'p_cat_name' => $product_detail['pCatName'],
            'p_sub_cat_name' => $product_detail['pSubCatName'],
            'fac_model' => $product_detail['facmodel'],
            'image_sku' => $product_detail['imagesku'],
            'status' => 'pending',
            'warranty' => false,
            'user_key' => Auth::user()->user_code,
            'is_code_key' => Auth::user()->is_code_cust_id,
        ]);

        return response()->json([
            'job_id' => $store_job->id,
            'serial_id' => $store_job->serial_id,
            'job_detail' => $store_job,
        ]);
    }
}
