<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StoreInformation;
use App\Models\Symptom;
use App\Models\WarrantyProduct;
use App\Models\TblHistoryProd;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AssRepairController extends Controller
{
    /**
     * Query params (ส่งมาอย่างน้อย 1 อย่าง):
     *   - serial  : เลขซีเรียล  (serial_id ใน job_list)
     *   - job_id  : เลขงาน      (job_id ใน job_list)
     */

    public function getRepairInfo(Request $request): JsonResponse
    {
        // 1. ตรวจสอบข้อมูลด้วย Validator ใช้กฎ required_without เพื่อรับประกันว่ามีการส่งค่าอย่างน้อยหนึ่งค่า
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'serial' => 'required_without:job_id|nullable|string',
            'job_id' => 'required_without:serial|nullable|string',
        ], [
            'serial.required_without' => 'กรุณาระบุ serial หรือ job_id อย่างน้อย 1 ค่า',
            'job_id.required_without' => 'กรุณาระบุ serial หรือ job_id อย่างน้อย 1 ค่า',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $serial = $request->input('serial');
        $jobId  = $request->input('job_id');

        /** @var JobList|null $job */
        $job = JobList::query()
            ->when($serial, fn($q) => $q->where('serial_id', $serial))
            ->when(!$serial && $jobId, fn($q) => $q->where('job_id', $jobId))
            ->first();

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'ไม่พบข้อมูลงานซ่อมจาก serial / job_id ที่ระบุ',
            ], 404);
        }

        // --- ค้นหา StoreInformation จาก is_code_key ใน job ---
        /** @var StoreInformation|null $store */
        $store = StoreInformation::query()
            ->where('is_code_cust_id', $job->is_code_key)
            ->first();

        // --- ค้นหา WarrantyProduct ---
        /** @var WarrantyProduct|null $warranty */
        $warranty = WarrantyProduct::query()
            ->where('serial_id', $job->serial_id)
            ->where('pid', $job->pid)
            ->first();

        // --- ค้นหา Symptom ---
        $symptomText = Symptom::findByJobId($job->job_id);

        // --- ประกันออนไลน์ (อ้างอิงจาก TblHistoryProd และ fallback ไป JobList) ---
        $historyProd = $job->serial_id
            ? TblHistoryProd::where('serial_number', $job->serial_id)->first()
            : null;

        $warrantyExpire    = $historyProd?->insurance_expire ?: $job->insurance_expire;
        $warrantyStartDate = $historyProd?->buy_date;

        // ถ้าเกิดว่ามีวันที่ซื้อมา แต่ไม่มีวันหมดอายุ ให้คำนวณวันหมดอายุให้เลย โดยนำฟิลด์ warranty_period จาก job_list มาคำนวณ
        if (!empty($warrantyStartDate) && (empty($warrantyExpire) || $warrantyExpire === 'ไม่มีข้อมูล')) {
            $months = (int) $job->warranty_period;
            if ($months > 0) {
                try {
                    $warrantyExpire = Carbon::parse($warrantyStartDate)->addMonths($months)->format('Y-m-d');
                } catch (\Exception $e) {
                }
            }
        }

        // เช็คจาก joblist ด้วย ถ้าขึ้นว่า "ไม่มีข้อมูลให้เป็น null ไป"
        if ($warrantyExpire === 'ไม่มีข้อมูล' || trim($warrantyExpire) === '') {
            $warrantyExpire = null;
        }

        // ถ้าข้อมูลการลงทะเบียนไม่มีทั้งใน HistoryProd และ ในของ Joblist ไม่มีข้อมูล ก็ควรให้เป็น null และ ให้เป็น false
        $hasAnyData = $historyProd || $warrantyExpire;
        $isRegistered = $hasAnyData ? true : false;

        // สร้าง Array รอไว้เลย ไม่ต้องรอให้มีวันที่
        $onlineWarranty = [
            'is_registered' => $isRegistered,
            'status'        => null,
            'expire_date'   => null,
            'start_date'    => null,
        ];

        // 3. จัดการวันที่และสถานะ พร้อมป้องกันข้อผิดพลาดเวลา Parse Date (try-catch)
        if ($warrantyExpire) {
            try {
                $today      = now()->startOfDay();
                $expireDate = Carbon::parse($warrantyExpire)->startOfDay();

                if ($today->lte($expireDate)) {
                    $onlineWarranty['status'] = 'อยู่ในประกัน';
                } else {
                    $onlineWarranty['status'] = 'หมดประกัน';
                    // ถ้าหมดประกันแล้ว ให้ปรับสถานะ is_registered เป็น false
                    $onlineWarranty['is_registered'] = false;
                }

                $onlineWarranty['expire_date'] = $expireDate->format('Y-m-d');
            } catch (\Exception $e) {
                // เก็บตกเผื่อรูปแบบวันที่ในระบบไม่ใช่ที่ถูกต้อง (ตัวอย่าง 0000-00-00 หรือมีค่านั้นๆ)
                $onlineWarranty['status']      = 'รูปแบบวันที่หมดประกันไม่ถูกต้อง';
                $onlineWarranty['is_registered'] = false;
            }
        } else {
            // ถ้าไม่มีข้อมูลการลงทะเบียนทั้งคู่ ให้ค่าตกลงเป็น null และ false
            $onlineWarranty['status']      = null;
            $onlineWarranty['is_registered'] = false;
        }

        if ($warrantyStartDate) {
            try {
                $onlineWarranty['start_date']  = Carbon::parse($warrantyStartDate)->format('Y-m-d');
            } catch (\Exception $e) {
                // ป้องกันไม่ให้ระบบพังเมื่อเจอรูปแบบที่ไม่รองรับ
                $onlineWarranty['start_date']  = null;
            }
        }

        // --- Build Response ---
        $data = [
            'store_code'             => $store?->is_code_cust_id ?? null, // 1. รหัสร้านค้า
            'store_name'             => $store?->shop_name ?? null, // 2. ชื่อร้านค้า
            'store_phone'            => $store?->phone ?? null,   // 3. เบอร์โทรร้านค้า
            'sale_id'                => $store?->sale_id ?? null, // 4. รหัสเซลล์ดูแลปัจจุบัน
            'sale_name'              => $store?->gp?->name ?? null,   // 5. เซลล์ดูแลปัจจุบัน (ชื่อ) — ถ้ามี relation Gp ให้ดึงชื่อ ไม่งั้น null
            'repair_man_id'          => $job->repair_man_id ?? null,   // 6. รหัสพนักงานส่งซ่อม
            'consumer_phone'         => $job->shop_under_sale_phone ?? null,  // 7. เบอร์มือถือผู้บริโภค
            'consumer_name'          => $job->shop_under_sale_name ?? null,   // 8. ชื่อผู้บริโภค
            'serial'                 => $job->serial_id,   // 9. serial
            'pid'                    => $job->pid, // 10. รหัสสินค้า
            'p_name'                 => $job->p_name,  // 11. ชื่อสินค้า
            'model'                  => $job->fac_model,  // 12. โมเดล
            'product_group'          => null,   // 13. กลุ่มสินค้า
            'warranty_doc'           => null,  // 14. ใบรับประกัน
            'online_warranty'        => $onlineWarranty, // 15. ประกันออนไลน์ (expire_date จาก warranty_product หรือ insurance_expire จาก job_list)
            'symptom'                => $symptomText,   // 16. อาการเบื้องต้น
            'repair_note'            => null, // 17. หมายเหตุส่งซ่อม
            'mall_doc_no'            => null,   // 18. เลขที่เอกสารห้าง
            'job_type'               => 'ปกติ',  // 19. ประเภทงาน
            'so_no'                  => null,   // 20. เลขที่ SO
            't_doc_no'               => null,  // 21. เลขที่เอกสาร T
            'job_status'             => $job->status, // 22. สถานะงาน
        ];

        return response()->json([
            'success' => true,
            'data'    => $data,
        ], 200, [], JSON_INVALID_UTF8_SUBSTITUTE);
    }
}
