<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobRequest;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{

    public function check($serial_id): JsonResponse
    {
        try {
            $check = JobList::query()
                ->where('serial_id', $serial_id)
                ->orderBy('id', 'desc')
                ->first();
            if ($check) {
                if ($check->status === 'pending') {
                    $message = 'พบ job กำลังดำเนินการ';
                    return response()->json(['message' => $message,]);
                }elseif ($check->status === 'send') {
                    if ($check->is_code_key !== Auth::user()->is_code_cust_id){
                        $message = 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น';
                        return response()->json(['message' => $message],400);
                    }else{
                        $message = 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin';
                        return response()->json(['message' => $message],400);
                    }

                }
                else {
                    $message = 'serial_id นี้เคยมีการซ่อมไปแล้ว';
                    return response()->json(['message' => $message,], 400);
                }
            } else {
                $message = 'ไม่พบประวัติการซ่อมจากระบบ';
                return response()->json(['message' => $message,], 400);
            }
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 500);
        }

    }

    public function update(JobRequest $request): JsonResponse
    {
        $job_id = $request->input('job_id');
        try {
            DB::beginTransaction();
            $job = JobList::query()->where('job_id', $job_id)->first();
            $findSpApprove = SparePart::query()->where('job_id', $job_id)->get();
            // dd($job);
            foreach ($findSpApprove as $sp) {
                // if (($job->warranty === true) && (($sp->approve == 'yes') && ($sp->approve_status == 'no'))) {
                //     throw new \Exception('ตรวจพบอะไหล่ที่ยังไม่ถูก approve กรุณาตรวจสอบในปุ่มแจ้งเตือน');
                // }
                if ($sp->sp_warranty === true) {
                    $uploadedMenus = FileUpload::query()
                        ->where('job_id', $job_id)
                        ->whereIn('menu_id', [1, 2, 3])
                        ->pluck('menu_id')
                        ->toArray();

                    // ตรวจสอบว่าเมนูที่ต้องมีครบทั้ง 1, 2, 3 ขาดเมนูอะไรไปบ้าง
                    $missingMenus = array_diff([1, 2, 3], $uploadedMenus);

                    if (!empty($missingMenus)) {
                        $missingMenusText = implode(', ', $missingMenus);
                        if ($missingMenusText === '1') $missingMenusText = "สภาพสินค้าก่อนซ่อม";
                        elseif ($missingMenusText === '2') $missingMenusText = "สภาพสินค้าก่อนซ่อม";
                        elseif ($missingMenusText === '3') $missingMenusText = "ภาพอะไหล่ที่เสียส่งเคลม";
                        else $missingMenusText = "ไม่สามารถระบุได้";
                        throw new \Exception("เนื่องจาก job นี้มีการส่งเคลมอะไหล่ กรุณาตรวจสอบข้อมูลสำหรับการเคลมอะไหล่ให้ครบถ้วน ขาดเมนู: {$missingMenusText}");
                    }
                }
            }

            $findBehavior = Behavior::query()->where('job_id', $job_id)->get();
            $findUploadFile = FileUpload::query()->where('job_id', $job_id)->get();
            $findSparePart = SparePart::query()->where('job_id', $job_id)->get();
            $findCustomerInJob = CustomerInJob::query()->where('job_id', $job_id)->get();

            if (count($findBehavior) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกฟอร์มอาการอย่างน้อย 1 รายการ');
            } elseif (count($findUploadFile) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกฟอร์มรูปภาพอย่างน้อย 1 รายการ');
            } elseif (count($findSparePart) <= 0) {
                throw new \Exception('จำเป็นต้องเลือกอะไหล่อย่างน้อย 1 รายการ');
            } elseif (count($findCustomerInJob) <= 0) {
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


    public function cancelJob($serial_id): JsonResponse
    {
        try {
            DB::beginTransaction();
            $job = JobList::query()->where('job_id', $serial_id)->first();
            if ($job->status === 'canceled') {
                throw new \Exception('จ็อบนี้เคยยกเลิกไปแล้ว');
            } else {
                $job->status = 'canceled';
                $job->save();
            }
            DB::commit();
            return response()->json([
                'message' => 'ยกเลิกการซ่อมสำเร็จ',
                'job' => $job ?? [],
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();
            return response()->json([
                'job' => [],
                'message' => $exception->getMessage(),
            ], 400);
        }

    }
}
