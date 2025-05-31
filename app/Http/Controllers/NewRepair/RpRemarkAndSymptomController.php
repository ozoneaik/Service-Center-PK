<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Http\Requests\Repair\RemarkAndSymptomRequest;
use App\Models\JobList;
use App\Models\Remark;
use App\Models\Symptom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RpRemarkAndSymptomController extends Controller
{
    public function detail(Request $request) : JsonResponse
    {
        try {
            $job_id = $request->get('job_id');
            if (!$job_id) {
                return response()->json([
                    'message' => 'กรุณาระบุ job_id',
                ], 400);
            }
            $serial_id = JobList::query()->where('job_id', $job_id)->select('serial_id')->first();
            $remark = Remark::query()->where('job_id', $job_id)->select('remark')->first();
            $symptoms = Symptom::query()->where('job_id', $job_id)->select('symptom')->first();

            return response()->json([
                'message' => 'ดึงข้อมูลสำเร็จ',
                'symptom' => $symptoms->symptom ?? null,
                'remark' => $remark->remark ?? null,
                'serial_id' => $serial_id->serial_id,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeOrUpdate(RemarkAndSymptomRequest $request): JsonResponse
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');
        $remark = $request->get('remark');
        $symptom = $request->get('symptom');


        if ($remark) {
            $check = Remark::query()->where('job_id', $job_id)->first();
            if ($check) {
                $remarkNew = Remark::query()->where('job_id', $job_id)->update(['remark' => $remark]);
            } else {
                $remarkNew = Remark::query()->create([
                    'job_id' => $job_id,
                    'serial_id' => $serial_id,
                    'remark' => $remark,
                ]);
            }
        }else {
            $remarkDelete = Remark::query()->where('job_id', $job_id)->first();
            $remarkDelete->delete();
        }

        if ($symptom) {
            $check = Symptom::query()->where('job_id', $job_id)->first();
            if ($check) {
                $symptomNew = Symptom::query()->update([
                    'job_id' => $job_id,
                    'serial_id' => $serial_id,
                    'symptom' => $symptom,
                ]);
            } else {
                $symptomNew = Symptom::query()->create([
                    'job_id' => $job_id,
                    'serial_id' => $serial_id,
                    'symptom' => $symptom,
                ]);
            }
        }
        return response()->json([
            'message' => 'บันทึกอาการเบื้องต้นหรือหมายเหตุสำหรับสื่อสารภายใน เรียบร้อยแล้ว',
            'remark' => $remarkNew ?? null,
            'symptom' => $symptomNew ?? null,
        ]);

    }

}
