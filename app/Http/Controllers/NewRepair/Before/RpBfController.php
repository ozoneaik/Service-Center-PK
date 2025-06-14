<?php

namespace App\Http\Controllers\NewRepair\Before;

use App\Http\Controllers\Controller;
use App\Models\AccessoriesNote;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\Remark;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class RpBfController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['job_id' => 'required'], ['job_id.required' => 'job_id is required.']);
        $job_id = $request->job_id;
        try {
            $form = [];
            $form['customer'] = CustomerInJob::findByJobId($job_id);
            $remark = Remark::findByJobId($job_id);
            $symptom = Symptom::findByJobId($job_id);
            $accessory = AccessoriesNote::findByJobId($job_id);
            $form['remark_symptom_accessory'] = [
                'remark' => $remark,
                'symptom' => $symptom,
                'accessory' => $accessory,
            ];
            $form['file_befores'] = FileUpload::findByJobIdBefore($job_id);
            $saved = $this->checkForm($form);

            return response()->json([
                'message' => 'ดึงฟอร์มสำเร็จ',
                'error' => null,
                'form' => $form,
                'saved' => $saved,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getFile() . $e->getLine(),
                'form' => [],
                'saved' => false,
            ]);
        }
    }

    // function ในการเช็คว่า ฟอร๋มบันทึกการซ่อม มีการบันทึกลง database หมดแล้วหรือยัง
    private function checkForm($form)
    {
        if (empty($form) || empty($form['customer']) || empty($form['remark_symptom_accessory']) || empty($form['file_befores'])) {
            return false;
        }
        $customer = $form['customer'];
        if (empty($customer['phone']) || empty($customer['name'])){
            return false;
        }
        $remark_symptom_accessory = $form['remark_symptom_accessory'];
        if (empty($remark_symptom_accessory['symptom'])){
            return false;
        }
        $file_befores = $form['file_befores'];
        if (count($file_befores) < 1){
            return false;
        }

        return true;
    }

    public function store(Request $request)
    {

        try {
            $request->validate([
                'job_id' => 'required',
                'customer' => 'required',
                'remark_symptom_accessory' => 'required',
                'file_befores' => 'required'
            ],[
                'file_befores.required' => '<span>จำเป็นต้องอัปโหลดรูปหรือวิดีโอ<br/>🗃️สภาพสินค้าก่อนซ่อม🗃️<br/>อย่างน้อย 1 รายการ</span>'
            ]);
            $job_id = $request->job_id;
            $serial_id = $request->serial_id;
            $customer = $request->customer;
            $remark_symptom_accessory = $request->remark_symptom_accessory;
            $file_befores = $request->file_befores;

            DB::beginTransaction();

            // บันทึกข้อมูลลูกค้า
            $check_customer = CustomerInJob::query()->where('job_id', $job_id)->first();
            if ($check_customer) {
                $store_customer = $check_customer;
            }else{
                $store_customer = new CustomerInJob();
            }
            if (isset($customer['name']) || isset($customer['phone'])) {
                $store_customer->job_id = $job_id;
                $store_customer->serial_id = $serial_id;
                $store_customer->name = $customer['name'];
                $store_customer->phone = $customer['phone'];
                $store_customer->address = $customer['address'] ?? null;
                $store_customer->remark = $customer['remark'] ?? null;
                $store_customer->subremark1 = $customer['subremark1'] ?? false;
                $store_customer->subremark2 = $customer['subremark2'] ?? false;
                if (isset($customer['subremark3'])){
                    $store_customer->subremark3 = $customer['subremark3'];
                    $store_customer->remark = $customer['remark'];
                }
                $store_customer->save();
            }else throw new \Exception('กรุณากรอกชื่อ และ นามสกุล');


            // บันทึกหมายเหตุสำหรับสื่อสารภายในศูนย์ซ่อม
            $store_remark = new Remark();
            $store_remark->job_id = $job_id;
            $store_remark->serial_id = $serial_id;
            $store_remark->remark = $remark_symptom_accessory['remark'];
            $store_remark->save();

            // บันทึกอาการเบื้องต้น หากกรอกเข้ามา
            if (isset($remark_symptom_accessory['symptom'])){
                $check_symptom = Symptom::query()->where('job_id', $job_id)->first();
                if ($check_symptom) {
                    $store_symptom = $check_symptom;
                }else{
                    $store_symptom = new Symptom();
                }
                $store_symptom->job_id = $job_id;
                $store_symptom->serial_id = $serial_id;
                $store_symptom->symptom = $remark_symptom_accessory['symptom'];
                $store_symptom->save();
            }else Symptom::query()->where('job_id', $job_id)->delete();

            // บันทึกหมายเหตุอุปกรณ์เสริม หากกรอกเข้ามา
            if (isset($remark_symptom_accessory['accessory'])){
                $check_accessory = AccessoriesNote::query()->where('job_id', $job_id)->first();
                if ($check_accessory) {
                    $store_accessory = $check_accessory;
                }else{
                    $store_accessory = new AccessoriesNote();
                }
                $store_accessory->job_id = $job_id;
                $store_accessory->serial_id = $serial_id;
                $store_accessory->note = $remark_symptom_accessory['accessory'];
                $store_accessory->save();
            }else AccessoriesNote::query()->where('job_id', $job_id)->delete();

            $this->store_file($file_befores,$serial_id,$job_id);

            DB::commit();
            return back()->with('success', "บันทึกข้อมูลสำเร็จ กรุณากรอกฟอร์ม บันทึกการซ่อมต่อ");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    private function store_file ($file_befores,$serial_id,$job_id) {

        $keep = [];
        foreach ($file_befores as $key=>$file_data) {
            if (is_numeric($file_data['id'])){
                $keep[$key] = $file_data['id'];
            }
        }
        $this->deleteFile($job_id, $keep);

        foreach ($file_befores as $file_data) {

            // กรณีไฟล์ใหม่ที่ต้อง upload
            if (isset($file_data['file']) && $file_data['file'] instanceof UploadedFile) {
                // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการชนกัน
                $uploaded_file = $file_data['file'];
                $timestamp = now()->timestamp;
                $random = rand(0, 9999);
                $original_name = pathinfo($uploaded_file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $uploaded_file->getClientOriginalExtension();
                $new_filename = $timestamp . '_' . $random . '_' . $original_name . '.' . $extension;
                // บันทึกไฟล์ไปยัง storage/app/public/uploads
                $file_path = $uploaded_file->storeAs('uploads', $new_filename, 'public');

                $stored_files[] = [
                    'serial_id' => $serial_id, // หรือจากที่อื่นตามโครงสร้างของคุณ
                    'job_id' => $job_id, // หรือจากที่อื่นตามโครงสร้างของคุณ
                    'menu_id' => 1, // หรือจากที่อื่นตามโครงสร้างของคุณ
                    'file_path' => $file_path,
                ];

                FileUpload::query()->create([
                    'serial_id' => $serial_id,
                    'job_id' => $job_id,
                    'menu_id' => 1,
                    'file_path' => $file_path,
                ]);
            }elseif (isset($file_data['id']) && is_numeric($file_data['id'])) {
                $stored_files[] = $file_data;
            }
        }
    }

    private function deleteFile($job_id, $keep): void
    {
        // ป้องกันการลบไฟล์ทั้งหมด หากไม่มีไฟล์ที่ต้องการเก็บ
        if (empty($keep)) {
            return;
        }

        FileUpload::query()->where('job_id', $job_id)->whereNotIn('id', $keep)->delete();
    }
}
