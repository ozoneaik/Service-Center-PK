<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeneralController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $job_id = null;
        $sn = null;
        $validated = $request->validate([
            'jobOrSn' => 'required|string',
        ], [
            'jobOrSn.required' => 'กรุณาระบุหมายเลขงานหรือหมายเลขซีเรียล',
            'jobOrSn.string' => 'หมายเลขงานหรือหมายเลขซีเรียลต้องเป็นข้อความ',
        ]);
        try {
            $req = $request->all();
            $jobOrSn = $req['jobOrSn'];

            $select = [
                'job_lists.job_id',
                'job_lists.serial_id',
                'job_lists.pid',
                'job_lists.p_name',
                'job_lists.p_base_unit',
                'job_lists.p_cat_id',
                'job_lists.p_cat_name',
                'job_lists.p_sub_cat_name',
                'job_lists.fac_model',
                'job_lists.status',
                'job_lists.user_key',
                'job_lists.is_code_key',
                'job_lists.created_at',
                'job_lists.updated_at',
                'store_information.shop_name',
                'store_information.address',
                'store_information.phone',
                'users.name as user_key_name'
            ];

            if (str_starts_with($jobOrSn, 'JOB-')) {
                $job_id = $jobOrSn;
                $detail = JobList::query()
                    ->leftJoin('store_information', 'store_information.is_code_cust_id', '=', 'job_lists.is_code_key')
                    ->leftJoin('users', 'users.user_code', '=', 'job_lists.user_key')
                    ->leftJoin('')
                    ->where('job_lists.job_id', $job_id)
                    ->where('job_lists.status', 'send')
                    ->orderBy('job_lists.id', 'desc')
                    ->select($select)
                    ->first();
                $sn = null;
            } else {
                $sn = $jobOrSn;
                $detail = JobList::query()
                    ->leftJoin('store_information', 'store_information.is_code_cust_id', '=', 'job_lists.is_code_key')
                    ->leftJoin('users', 'users.user_code', '=', 'job_lists.user_key')
                    ->where('job_lists.serial_id', $sn)
                    ->orderBy('job_lists.id', 'desc')
                    ->select($select)
                    ->where('job_lists.status', 'send')
                    ->first();
                $job_id = null;
            }
            if (isset($detail)) {
                $detail = $detail->toArray();
            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }

            return response()->json([
                'message' => 'ดึงข้อมูลสำเร็จ ที่ จ็อบ หรือ หมายเลขซีเรียล ที่ส่งไปยัง pk',
                'job' => $detail ?? null,
                'request_body' => [
                    'job_id' => $job_id,
                    'serial_id' => $sn,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'request_body' => [
                    'job_id' => $job_id,
                    'serial_id' => $sn,
                ],
            ], 400);
        }
    }
}
