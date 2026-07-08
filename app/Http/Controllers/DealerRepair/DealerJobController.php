<?php

namespace App\Http\Controllers\DealerRepair;

use App\Http\Controllers\Controller;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\Symptom;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DealerJobController extends Controller
{
    public function searchJob(Request $request): JsonResponse
    {
        $serial_id = $request->serial_id;
        $pid = $request->pid;
        $job_id = $request->job_id ?? null;
        $dealer_code = Auth::user()->is_code_cust_id;

        try {
            if (!empty($job_id)) {
                $found = JobList::query()
                    ->where('job_id', $job_id)
                    ->where('dealer_code', $dealer_code)
                    ->orderBy('id', 'desc')
                    ->first();

                return response()->json([
                    'message' => 'เจอข้อมูล',
                    'found' => (bool) $found,
                    'job' => ['job_detail' => $found],
                ]);
            }

            if ($serial_id === '9999') {
                $found = JobList::query()
                    ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
                    ->where('job_lists.serial_id', 'LIKE', '9999-%')
                    ->where('job_lists.pid', $pid)
                    ->where('job_lists.dealer_code', $dealer_code)
                    ->whereIn('job_lists.status', ['pending', 'send'])
                    ->select('job_lists.*', 'customer_in_jobs.name as cust_name', 'customer_in_jobs.phone as cust_phone')
                    ->orderBy('job_lists.id', 'desc')
                    ->get();

                return response()->json([
                    'search_by' => 'pid',
                    'message' => 'success',
                    'found' => count($found) > 0,
                    'jobs' => $found->toArray(),
                ]);
            }

            $found = JobList::query()
                ->where('serial_id', $serial_id)
                ->where('pid', $pid)
                ->where('dealer_code', $dealer_code)
                ->orderBy('id', 'desc')
                ->first();

            if ($found) {
                if (in_array($found->status, ['pending', 'send'])) {
                    return response()->json([
                        'search_by' => 'sn',
                        'message' => 'เจอข้อมูล',
                        'found' => true,
                        'job' => ['job_detail' => $found],
                    ]);
                }-

                $status = 404;
                throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
            }

            $status = 404;
            throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getFile() . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'found' => false,
                'data' => [],
            ], $status ?? 400);
        }
    }

    public function storeJob(Request $request): JsonResponse
    {
        $request->validate([
            'serial_id' => 'required',
            'productDetail' => 'required|array',
            'dealer_name' => 'required|string',
            'dealer_phone' => 'required|string',
        ]);

        $serial_id = $request->get('serial_id');
        if ($serial_id === '9999') {
            $serial_id = '9999-' . time() . rand(0, 99999);
        }

        $product_detail = $request->get('productDetail');
        $new_job_id = 'JOB-' . time() . rand(0, 99999);
        $user = Auth::user();

        try {
            $store_job = JobList::query()->create([
                'serial_id' => $serial_id,
                'job_id' => $new_job_id,
                'pid' => $product_detail['pid'],
                'p_name' => $product_detail['pname'],
                'p_base_unit' => $product_detail['pbaseunit'] ?? null,
                'p_cat_id' => $product_detail['pcatid'] ?? null,
                'p_cat_name' => $product_detail['pCatName'] ?? null,
                'p_sub_cat_name' => $product_detail['pSubCatName'] ?? null,
                'fac_model' => $product_detail['facmodel'] ?? null,
                'warranty_condition' => $product_detail['warrantycondition'] ?? null,
                'warranty_note' => $product_detail['warrantynote'] ?? null,
                'warranty_period' => $product_detail['warrantyperiod'] ?? null,
                'insurance_expire' => $product_detail['insurance_expire'] ?? 'ไม่มีข้อมูล',
                'image_sku' => $product_detail['imagesku'] ?? null,
                'status' => 'pending',
                'warranty' => $product_detail['warranty'] ?? false,
                'user_key' => $user->user_code,
                'is_code_key' => $user->is_code_cust_id,
                'dealer_code' => $user->is_code_cust_id,
                'dealer_name' => $request->get('dealer_name'),
                'dealer_phone' => $request->get('dealer_phone'),
                'created_job_from' => 'dealer',
            ]);

            return response()->json([
                'job_id' => $store_job->job_id,
                'serial_id' => $store_job->serial_id,
                'job_detail' => $store_job,
            ]);
        } catch (QueryException $e) {
            Log::error('DealerJob DB Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'ไม่สามารถสร้างงานซ่อมได้',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function storeJobFromPid(Request $request): JsonResponse
    {
        $request->validate([
            'productDetail' => 'required|array',
            'dealer_name' => 'required|string',
            'dealer_phone' => 'required|string',
        ]);

        try {
            $serial_id = '9999-' . time() . rand(0, 99999);
            $job_id = 'JOB-' . time() . rand(0, 99999);
            $product_detail = $request->get('productDetail');
            $user = Auth::user();

            $store_job = JobList::query()->create([
                'serial_id' => $serial_id,
                'job_id' => $job_id,
                'pid' => $product_detail['pid'],
                'p_name' => $product_detail['pname'],
                'p_base_unit' => $product_detail['pbaseunit'] ?? null,
                'p_cat_id' => $product_detail['pcatid'] ?? null,
                'p_cat_name' => $product_detail['pCatName'] ?? null,
                'p_sub_cat_name' => $product_detail['pSubCatName'] ?? null,
                'fac_model' => $product_detail['facmodel'] ?? null,
                'warranty_condition' => $product_detail['warrantycondition'] ?? null,
                'warranty_note' => $product_detail['warrantynote'] ?? null,
                'warranty_period' => $product_detail['warrantyperiod'] ?? null,
                'insurance_expire' => $product_detail['insurance_expire'] ?? 'ไม่มีข้อมูล',
                'image_sku' => $product_detail['imagesku'] ?? null,
                'status' => 'pending',
                'warranty' => $product_detail['warranty'] ?? false,
                'user_key' => $user->user_code,
                'is_code_key' => $user->is_code_cust_id,
                'dealer_code' => $user->is_code_cust_id,
                'dealer_name' => $request->get('dealer_name'),
                'dealer_phone' => $request->get('dealer_phone'),
                'created_job_from' => 'dealer',
            ]);

            return response()->json([
                'job_id' => $store_job->job_id,
                'serial_id' => $store_job->serial_id,
                'job_detail' => $store_job,
            ]);
        } catch (\Exception $e) {
            Log::error('DealerJob FromPid Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'ไม่สามารถสร้างงานซ่อมได้',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function cancelJob(Request $request): JsonResponse
    {
        $job_id = $request->get('job_id');

        try {
            DB::beginTransaction();

            $job = JobList::query()
                ->where('job_id', $job_id)
                ->where('dealer_code', Auth::user()->is_code_cust_id)
                ->first();

            if (!$job || $job->status !== 'pending') {
                throw new \Exception('ไม่สามารถยกเลิกงานซ่อมได้');
            }

            $job->status = 'canceled';
            $job->close_job_by = Auth::user()->user_code;
            $job->save();

            DB::commit();

            return response()->json([
                'job_id' => $job_id,
                'message' => 'ยกเลิกงานซ่อมสำเร็จ',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'job_id' => $job_id,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
