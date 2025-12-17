<?php

namespace App\Http\Controllers\NewRepair\Before;

use App\Http\Controllers\Controller;
use App\Models\AccessoriesNote;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\Remark;
use App\Models\StoreInformation;
use App\Models\Symptom;
use App\Services\SendMessageService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
        if (empty($customer['phone']) || empty($customer['name'])) {
            return false;
        }
        $remark_symptom_accessory = $form['remark_symptom_accessory'];
        if (empty($remark_symptom_accessory['symptom'])) {
            return false;
        }
        $file_befores = $form['file_befores'];
        if (count($file_befores) < 1) {
            return false;
        }

        return true;
    }

    // public function store(Request $request)
    // {
    //     try {
    //         $request->validate([
    //             'job_id' => 'required',
    //             'customer' => 'required',
    //             'remark_symptom_accessory' => 'required',
    //             'file_befores' => 'required'
    //         ], [
    //             'file_befores.required' => '<span>จำเป็นต้องอัปโหลดรูปหรือวิดีโอ<br/>🗃️สภาพสินค้าก่อนซ่อม🗃️<br/>อย่างน้อย 1 รายการ</span>'
    //         ]);

    //         $job_id = $request->job_id;
    //         $serial_id = $request->serial_id;
    //         $customer = $request->customer;
    //         $remark_symptom_accessory = $request->remark_symptom_accessory;
    //         $file_befores = $request->file_befores;

    //         DB::beginTransaction();

    //         // ✅ บันทึกข้อมูลลูกค้า
    //         if (isset($customer['name']) || isset($customer['phone'])) {
    //             if (!is_numeric($customer['phone']) || strlen($customer['phone']) != 10) {
    //                 throw new \Exception('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เบอร์ต้องเป็นตัวเลข 10 หลัก)');
    //             }

    //             CustomerInJob::updateOrCreate(
    //                 ['job_id' => $job_id],
    //                 [
    //                     'serial_id' => $serial_id,
    //                     'name' => $customer['name'],
    //                     'phone' => $customer['phone'],
    //                     'address' => $customer['address'] ?? null,
    //                     'remark' => (!empty($customer['subremark3']) && $customer['subremark3'] !== false)
    //                         ? ($customer['remark'] ?? null)
    //                         : null,
    //                     'subremark1' => $customer['subremark1'] ?? false,
    //                     'subremark2' => $customer['subremark2'] ?? false,
    //                     'subremark3' => (isset($customer['subremark3']) && $customer['subremark3'] !== '0') ? $customer['subremark3'] : false,
    //                 ]
    //             );
    //         } else {
    //             throw new \Exception('กรุณากรอกชื่อ และ นามสกุล');
    //         }

    //         // ✅ หมายเหตุภายในศูนย์ซ่อม
    //         if (isset($remark_symptom_accessory['remark'])) {
    //             Remark::updateOrCreate(
    //                 ['job_id' => $job_id],
    //                 [
    //                     'serial_id' => $serial_id,
    //                     'remark' => $remark_symptom_accessory['remark'] ?? null,
    //                 ]
    //             );
    //         } else {
    //             Remark::where('job_id', $job_id)->delete();
    //         }

    //         // ✅ อาการเบื้องต้น
    //         if (isset($remark_symptom_accessory['symptom'])) {
    //             Symptom::updateOrCreate(
    //                 ['job_id' => $job_id],
    //                 [
    //                     'serial_id' => $serial_id,
    //                     'symptom' => $remark_symptom_accessory['symptom'],
    //                 ]
    //             );
    //         } else {
    //             Symptom::where('job_id', $job_id)->delete();
    //         }

    //         // ✅ อุปกรณ์เสริม
    //         if (isset($remark_symptom_accessory['accessory'])) {
    //             AccessoriesNote::updateOrCreate(
    //                 ['job_id' => $job_id],
    //                 [
    //                     'serial_id' => $serial_id,
    //                     'note' => $remark_symptom_accessory['accessory'],
    //                 ]
    //             );
    //         } else {
    //             AccessoriesNote::where('job_id', $job_id)->delete();
    //         }

    //         // ✅ บันทึกไฟล์
    //         $this->store_file($file_befores, $serial_id, $job_id);

    //         DB::commit();
    //         return back()->with('success', "บันทึกข้อมูลสำเร็จ กรุณากรอกฟอร์ม บันทึกการซ่อมต่อ");
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return back()->with('error', $e->getMessage());
    //     }
    // }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'job_id' => 'required',
                'customer' => 'required',
                'remark_symptom_accessory' => 'required',
                'file_befores' => 'required'
            ], [
                'file_befores.required' => '<span>จำเป็นต้องอัปโหลดรูปหรือวิดีโอ<br/>🗃️สภาพสินค้าก่อนซ่อม🗃️<br/>อย่างน้อย 1 รายการ</span>'
            ]);

            $job_id = $request->job_id;
            $serial_id = $request->serial_id;
            $customer = $request->customer;
            $remark_symptom_accessory = $request->remark_symptom_accessory;
            $file_befores = $request->file_befores;

            DB::beginTransaction();

            // บันทึกข้อมูลลูกค้า
            if (isset($customer['name']) || isset($customer['phone'])) {
                if (!is_numeric($customer['phone']) || strlen($customer['phone']) != 10) {
                    throw new \Exception('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เบอร์ต้องเป็นตัวเลข 10 หลัก)');
                }

                CustomerInJob::updateOrCreate(
                    ['job_id' => $job_id],
                    [
                        'serial_id' => $serial_id,
                        'name' => $customer['name'],
                        'phone' => $customer['phone'],
                        'address' => $customer['address'] ?? null,
                        'remark' => (!empty($customer['subremark3']) && $customer['subremark3'] !== false)
                            ? ($customer['remark'] ?? null)
                            : null,
                        'subremark1' => $customer['subremark1'] ?? false,
                        'subremark2' => $customer['subremark2'] ?? false,
                        'subremark3' => (isset($customer['subremark3']) && $customer['subremark3'] !== '0') ? $customer['subremark3'] : false,
                    ]
                );
            } else {
                throw new \Exception('กรุณากรอกชื่อ และ นามสกุล');
            }

            // หมายเหตุภายในศูนย์ซ่อม
            if (isset($remark_symptom_accessory['remark'])) {
                Remark::updateOrCreate(
                    ['job_id' => $job_id],
                    [
                        'serial_id' => $serial_id,
                        'remark' => $remark_symptom_accessory['remark'] ?? null,
                    ]
                );
            } else {
                Remark::where('job_id', $job_id)->delete();
            }

            // อาการเบื้องต้น
            if (isset($remark_symptom_accessory['symptom'])) {
                Symptom::updateOrCreate(
                    ['job_id' => $job_id],
                    [
                        'serial_id' => $serial_id,
                        'symptom' => $remark_symptom_accessory['symptom'],
                    ]
                );
            } else {
                Symptom::where('job_id', $job_id)->delete();
            }

            // อุปกรณ์เสริม
            if (isset($remark_symptom_accessory['accessory'])) {
                AccessoriesNote::updateOrCreate(
                    ['job_id' => $job_id],
                    [
                        'serial_id' => $serial_id,
                        'note' => $remark_symptom_accessory['accessory'],
                    ]
                );
            } else {
                AccessoriesNote::where('job_id', $job_id)->delete();
            }

            // บันทึกไฟล์
            $this->store_file($file_befores, $serial_id, $job_id);

            DB::commit();

            // เริ่มการส่ง SMS (ใส่หลังจาก Commit DB สำเร็จ)
            try {
                if (!empty($customer['phone'])) {
                    $user = Auth::user();

                    // ค่า Default
                    $shop_name = 'Pumpkin';

                    // ตรวจสอบว่า User มีข้อมูล Store Information หรือไม่
                    if ($user && $user->store_info) {
                        // ดึง shop_name จากความสัมพันธ์ store_info ใน Model User
                        if (!empty($user->store_info->shop_name)) {
                            $shop_name = $user->store_info->shop_name;
                        }
                    }

                    // กำหนดค่า Config
                    $sms_account = env('SMS_ACCOUNT');
                    $sms_password = env('SMS_PASSWORD');

                    // เตรียมข้อความ (แทนที่ Ticket ID ด้วยตัวแปร $job_id)
                    // $message = "ศูนย์บริการหลังการขายพัมคิน รับสินค้าเข้าสู่ระบบเรียบร้อย เลขที่ Ticket ของท่านคือ {$job_id} ท่านสามารถตรวจสอบสถานะการซ่อมได้ที่ https://pumpkin.co.th/track/?track={$job_id}";
                    $message = "PSC {$shop_name} รับสินค้าเข้าสู่ระบบเรียบร้อย เลขที่อ้างอิง {$job_id}";
                    $category = 'General';
                    $sender_name = ''; // ค่าเริ่มต้น

                    // เรียกใช้งาน Service
                    $sms_result = SendMessageService::sendMessage(
                        $sms_account,
                        $sms_password,
                        $customer['phone'],
                        $message,
                        '',
                        $category,
                        $sender_name
                    );

                    if ($sms_result['result']) {
                        Log::info("SMS Sent Success Job: {$job_id}, TaskID: " . $sms_result['task_id']);
                    } else {
                        Log::error("SMS Sent Failed Job: {$job_id}, Error: " . ($sms_result['error'] ?? 'Unknown Error'));
                    }
                }
            } catch (\Exception $smsException) {
                Log::error("SMS Exception Job: {$job_id} - " . $smsException->getMessage());
            }
            // -------------------------------------------------------------

            return back()->with('success', "บันทึกข้อมูลสำเร็จ กรุณากรอกฟอร์ม บันทึกการซ่อมต่อ");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    private function store_file($file_befores, $serial_id, $job_id)
    {

        $keep = [];
        foreach ($file_befores as $key => $file_data) {
            if (is_numeric($file_data['id'])) {
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
            } elseif (isset($file_data['id']) && is_numeric($file_data['id'])) {
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

        //        FileUpload::query()->where('job_id', $job_id)->whereNotIn('id', $keep)->delete();

        $files_to_delete = FileUpload::where('job_id', $job_id)
            ->where('menu_id', 1)
            ->when(!empty($keep), function ($query) use ($keep) {
                return $query->whereNotIn('id', $keep);
            })
            ->get();

        foreach ($files_to_delete as $file) {
            // ลบไฟล์จาก storage
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
                Log::info("Deleted file from storage: {$file->file_path}");
            }

            // ลบข้อมูลจากฐานข้อมูล
            $file->delete();
            Log::info("Deleted file record from database: ID {$file->id}");
        }
    }


    public function WorkReceipt(Request $request)
    {
        $job_id = $request->get('job_id');
        $find_symptom = Symptom::findByJobId($job_id);
        if ($find_symptom) {
            return response()->json([
                'job_id' => $job_id,
                'find_symptom' => true,
                'message' => 'รับใบรับสินค้า',
                'path' => route('genReCieveSpPdf', ['job_id' => $job_id])
            ]);
        } else {
            return response()->json([
                'job_id' => $job_id,
                'find_symptom' => false,
                'message' => 'กรุณากรอกอาการเบื้องต้นก่อน',
                'path' => null
            ], 400);
        }
    }

    public function checkPhone(Request $request)
    {
        $phone = $request->get('phone');

        // ค้นหาข้อมูลลูกค้าจากเบอร์โทร ล่าสุด (latest)
        $customer = CustomerInJob::where('phone', $phone)
            ->latest() // เอาข้อมูลล่าสุดที่เคยซ่อม
            ->first();

        if ($customer) {
            return response()->json([
                'found' => true,
                'name' => $customer->name,
                'address' => $customer->address,
                // ถ้ามีข้อมูลอื่นๆ ที่อยาก Auto fill ก็เพิ่มตรงนี้
            ]);
        }

        return response()->json([
            'found' => false,
        ]);
    }
}
