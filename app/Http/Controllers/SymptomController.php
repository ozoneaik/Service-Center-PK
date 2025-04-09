<?php

namespace App\Http\Controllers;

use App\Http\Requests\SymptomRequest;
use App\Models\logStamp;
use App\Models\Remark;
use App\Models\Symptom;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use function PHPUnit\Framework\isNull;

class SymptomController extends Controller
{
    public function store(SymptomRequest $request): JsonResponse
    {
        $symptom = $request->input('symptom');
        $serial_id = $request->input('serial_id');
        $job_id = $request->input('job_id');
        logStamp::query()->create(['description' => Auth::user()->user_code . " พยายามบันทึกอาการเบื้องต้นหรือหมายเหตุสำหรับสื่อสารภายใน $job_id"]);
        $remark = $request->input('remark') ? $request->input('remark') : null;
        try {
            DB::beginTransaction();
            Symptom::query()->where('job_id', $job_id)->where('serial_id', $serial_id)->delete();
            $new_symptom = Symptom::query()->create([
                'serial_id' => $serial_id,
                'job_id' => $job_id,
                'symptom' => $symptom,
            ]);

            if (isNull($remark)) {
                Remark::query()->where('job_id', $job_id)->where('serial_id', $serial_id)->delete();
                $new_remark = Remark::query()->create([
                    'serial_id' => $serial_id,
                    'job_id' => $job_id,
                    'remark' => $remark,
                ]);
            }
            DB::commit();
            $status = 200;
            $message = 'บันทึกข้อมูลสำเร็จ';
            logStamp::query()->create(['description' => Auth::user()->user_code . " บันทึกอาการเบื้องต้นหรือหมายเหตุสำหรับสื่อสารภายในสำเร็จ $job_id"]);
        } catch (\Exception $exception) {
            DB::rollBack();
            $message = $exception->getMessage();
            $status = 400;
        } finally {
            return response()->json([
                'message' => $message,
                'status' => $status,
                'symptom' => $new_symptom ?? '',
                'remark' => $new_remark ?? '',
            ], $status);
        }
    }
}
