<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerInJob;
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
                'job_lists.warranty',
                'job_lists.insurance_expire',
                'job_lists.user_key',
                'job_lists.is_code_key',
                'store_information.shop_name',
                'store_information.address',
                'store_information.phone',
                'store_information.digit_code',
                'users.name as user_key_name',
                'symptoms.symptom',
                'accessories_notes.note as accessory_note',
                'remarks.remark',
                'job_lists.created_at',
                'job_lists.updated_at',
            ];

            if (str_starts_with($jobOrSn, 'JOB-')) {
                $job_id = $jobOrSn;
                $sn = null;
                $whereField = 'job_lists.job_id';
                $whereValue = $job_id;
            } else {
                $sn = $jobOrSn;
                $job_id = null;
                $whereField = 'job_lists.serial_id';
                $whereValue = $sn;
            }

            $detail = JobList::query()
                ->leftJoin('store_information', 'store_information.is_code_cust_id', '=', 'job_lists.is_code_key')
                ->leftJoin('users', 'users.user_code', '=', 'job_lists.user_key')
                ->leftJoin('symptoms', 'symptoms.job_id', '=', 'job_lists.job_id')
                ->leftJoin('accessories_notes', 'accessories_notes.job_id', '=', 'job_lists.job_id')
                ->leftJoin('remarks', 'remarks.job_id', '=', 'job_lists.job_id')
                ->where($whereField, $whereValue)
                ->where('job_lists.status', 'send')
                ->orderBy('job_lists.id', 'desc')
                ->select($select)
                ->first();

            if (isset($detail)) {
                $detail = $detail->toArray();
                $customer_remark = CustomerInJob::query()->where('job_id', $detail['job_id'])->first();
                $detail['customer_name'] = $customer_remark['name'] ?? null;
                if ($customer_remark['subremark1']) {
                    $detail['customer_quote_before_repair'] = 'เสนอราคาก่อนซ่อม';
                } else {
                    $detail['customer_quote_before_repair'] = null;
                }
                if ($customer_remark['subremark2']) {
                    $detail['customer_send_back_by_mail'] = 'ซ่อมเสร็จส่งกลับทางไปรษณีย์';
                } else {
                    $detail['customer_send_back_by_mail'] = null;
                }
                if ($customer_remark['subremark3']) {
                    $detail['customer_other'] = 'อื่นๆ';
                    $detail['customer_other_remark'] = $customer_remark['remark'];
                } else {
                    $detail['customer_other'] = null;
                    $detail['customer_other_remark'] = null;
                }
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
