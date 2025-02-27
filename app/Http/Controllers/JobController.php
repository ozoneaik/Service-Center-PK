<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobRequest;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\SparePart;
use GuzzleHttp\Psr7\UploadedFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    public function update(JobRequest $request): JsonResponse
    {
        $job_id = $request->input('job_id');
        try {
            DB::beginTransaction();
            $job = JobList::query()->where('job_id', $job_id)->first();
            $findSpApprove = SparePart::query()->where('job_id', $job_id)->get();
            foreach ($findSpApprove as $sp) {
                if (($job->warranty === true) && (($sp->approve == 'yes') && ($sp->approve_status == 'no'))) {
                    throw new \Exception('ตรวจพบอะไหล่ที่ยังไม่ถูก approve กรุณาตรวจสอบในปุ่มแจ้งเตือน');
                }
                if ($job->warranty === true){
                    if ($sp->sp_warranty === true){
                        $findUploadFile = FileUpload::query()->where('job_id', $job_id)
                            ->where('menu_id',3)
                            ->first();
                        if (!$findUploadFile) {
                            throw new \Exception('จำเป็นต้องอัปโหลดภาพอะไหล่ที่เสียส่งเคลม กรุณาตรวจสอบในปุ่มแจ้งเตือน');
                        }
                    }
                }
            }

            $findBehavior = Behavior::query()->where('job_id', $job_id)->get();
            $findUploadFile = FileUpload::query()->where('job_id', $job_id)->get();
            $findSparePart = SparePart::query()->where('job_id', $job_id)->get();
            $findCustomerInJob = CustomerInJob::query()->where('job_id', $job_id)->get();

            if (count($findBehavior) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกฟอร์มอาการอย่างน้อย 1 รายการ');
            }elseif (count($findUploadFile) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกฟอร์มรูปภาพอย่างน้อย 1 รายการ');
            }elseif (count($findSparePart) <= 0) {
                throw new \Exception('จำเป็นต้องเลือกอะไหล่อย่างน้อย 1 รายการ');
            }elseif (count($findCustomerInJob) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกข้อมูลลูกค้า');
            }

            $job = JobList::query()->where('job_id', $job_id)->update(['status' => 'success']);
            $message = 'ปิดงานซ่อมสำเร็จ';
            $status = 200;
            DB::commit();
        } catch (\Exception $e) {
            $status = 400;
            $message = $e->getMessage();
            DB::rollBack();
        } finally {
            return response()->json([
                'message' => $message,
                'job' => $job ?? [],
            ], $status);
        }
    }
}
