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
        try {
            $req = $request->all();
            $jobOrSn = $req['jobOrSn'];

            $select = [
                'job_id', 'serial_id', 'pid', 'p_name', 'p_base_unit', 'p_cat_id', 'p_cat_name',
                'p_sub_cat_name', 'fac_model', 'status', 'user_key', 'is_code_key', 'created_at', 'updated_at'
            ];

            if (str_starts_with($jobOrSn, 'JOB-')) {
                $job_id = $jobOrSn;
                $detail = JobList::query()
                    ->where('job_id', $job_id)
                    ->orderBy('id', 'desc')
                    ->select($select)
                    ->first();
                $sn = null;
            } else {
                $sn = $jobOrSn;
                $detail = JobList::query()
                    ->where('serial_id', $sn)
                    ->orderBy('id', 'desc')
                    ->select($select)
                    ->where('status', 'pending')
                    ->first();
                $job_id = null;
            }
            if (isset($detail)) {
                $detail = $detail->toArray();
            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }

            return response()->json([
                'message' => 'ดึงข้อมูลสำเร็จ',
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
