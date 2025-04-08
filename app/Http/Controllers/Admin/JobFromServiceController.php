<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\Remark;
use App\Models\SparePart;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class JobFromServiceController extends Controller
{
    public function index()
    {
        $jobList = JobList::query()
            ->leftJoin('store_information', 'store_information.is_code_cust_id', '=', 'job_lists.is_code_key')
            ->select('job_lists.*', 'store_information.shop_name')
            ->where('status', 'send')->orderBy('updated_at', 'desc')
            ->get();
        return Inertia::render('Admin/JobFromService/JobFromServiceList', ['jobList' => $jobList]);
    }

    public function detail($job_id)
    {
        // ดึงข้อมูลจาก JobList และตรวจสอบว่ามีข้อมูลหรือไม่
        $jobDetail = JobList::query()
            ->leftJoin('store_information', 'store_information.is_code_cust_id', '=', 'job_lists.is_code_key')
            ->select('job_lists.*', 'store_information.shop_name', 'store_information.address', 'store_information.phone')
            ->where('job_lists.job_id', $job_id)->first();

        // ถ้าไม่พบข้อมูล job ให้ redirect หรือแสดง error
        if (!$jobDetail) {
            // ทางเลือก 1: redirect กลับไปยังหน้าที่เหมาะสมพร้อมแสดงข้อความ error
            return redirect()->route('jobs.index')->with('error', 'ไม่พบข้อมูลงานที่ค้นหา');

            // หรือ ทางเลือก 2: ส่งไปหน้า 404
            // abort(404, 'ไม่พบข้อมูลงานที่ค้นหา');
        }

        // ถ้ามีข้อมูล job ให้ดำเนินการต่อ
        $detailFull = $jobDetail->toArray();

        // ดึงข้อมูล behaviors และตรวจสอบว่ามีค่าหรือไม่
        $detailFull['behaviors'] = Behavior::query()->where('job_id', $job_id)->get();
        $detailFull['behaviors'] = $detailFull['behaviors']->isNotEmpty() ? $detailFull['behaviors']->toArray() : [];

        // ดึงข้อมูล customer และตรวจสอบ
        $customer = CustomerInJob::query()->where('job_id', $job_id)->first();
        $detailFull['customer_in_job'] = $customer ? $customer->toArray() : null;

        // ดึงข้อมูล upload_file และตรวจสอบ
        $uploadFiles = FileUpload::query()->where('job_id', $job_id)->get();
        $detailFull['upload_file'] = $uploadFiles->isNotEmpty() ? $uploadFiles->toArray() : [];

        // ดึงข้อมูล spare parts และตรวจสอบ
        $spareParts = SparePart::query()->where('job_id', $job_id)->get();
        $detailFull['sp'] = $spareParts->isNotEmpty() ? $spareParts->toArray() : [];

        // ดึงข้อมูล remark และตรวจสอบ
        $remark = Remark::query()->where('job_id', $job_id)->first();
        $detailFull['remark'] = $remark ? $remark->toArray() : null;

        // ดึงข้อมูล symptoms และตรวจสอบ
        $symptom = Symptom::query()->where('job_id', $job_id)->first();
        $detailFull['symptoms'] = $symptom ? $symptom->toArray() : null;

        // ส่งข้อมูลไปยัง view
        return Inertia::render('Admin/JobFromService/JobFromServiceDetail', ['jobDetail' => $detailFull]);
    }

    public function update($job_id)
    {
        try {
            $jobDetail = JobList::query()->where('job_id', $job_id)->first();
            if (!$jobDetail) {
                throw new \Exception('ไม่พบรายละเอียด job นี้');
            } else {
                DB::beginTransaction();
                $jobDetail->status = 'success';
                $jobDetail->save();
            }
            DB::commit();
            return Redirect::route('JobFormService.index')->with('success', 'ปิดงานซ่อมสำเร็จ');
        } catch (\Exception $exception) {
            DB::rollBack();
            return Redirect::route('JobFormService.index')->with('error', $exception->getMessage());
        }
    }
}
