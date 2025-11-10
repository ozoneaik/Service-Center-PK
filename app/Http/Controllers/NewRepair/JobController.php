<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Http\Requests\Repair\Job\JobStoreRequest;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\SparePart;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
use App\Models\Symptom;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class JobController extends Controller
{
    // handlePendingRateMessage
    public function searchJob(Request $request): JsonResponse
    {
        $serial_id = $request->serial_id;
        $pid = $request->pid;
        $job_id = $request->job_id ?? null;
        try {
            if (!empty($job_id)) {
                $found = JobList::query()->where('job_id', $job_id)->orderBy('id', 'desc')->first();
                return response()->json([
                    'message' => 'เจอข้อมูล แต่ปิดงานซ่อมไปแล้ว',
                    'found' => true,
                    'job' => ['job_detail' => $found]
                ]);
            } else {
                if ($serial_id === '9999') {
                    $found = JobList::query()
                        ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
                        ->where('job_lists.serial_id', 'LIKE', '9999-%')
                        ->where('job_lists.pid', $pid)
                        ->where('job_lists.is_code_key', Auth::user()->is_code_cust_id)
                        ->where('job_lists.status', 'pending')
                        ->select('job_lists.*', 'customer_in_jobs.name as cust_name', 'customer_in_jobs.phone as cust_phone')
                        ->orderBy('job_lists.id', 'desc')->get();
                    return response()->json([
                        'search_by' => 'pid',
                        'message' => 'success',
                        'found' => count($found) > 0,
                        'jobs' => $found->toArray()
                    ]);
                } else {
                    $found = JobList::query()
                        ->where('serial_id', $serial_id)
                        ->where('pid', $pid)
                        ->orderBy('id', 'desc')->first();
                }

                if ($found && $found->is_code_key === Auth::user()->is_code_cust_id) {
                    if ($found->status === 'pending') {
                        return response()->json([
                            'search_by' => 'sn',
                            'message' => 'เจอข้อมูล',
                            'found' => true,
                            'job' => ['job_detail' => $found]
                        ]);
                    } elseif ($found->status === 'send') {
                        throw new \Exception('ส่งไปยัง pumpkin');
                    } else {
                        $status = 404;
                        throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
                    }
                } elseif ($found && $found->is_code_key !== Auth::user()->is_code_cust_id) {
                    throw new \Exception('<span>ถูกซ่อมโดยที่อื่น</span>');
                } else {
                    $status = 404;
                    throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
                }
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getFile() . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'found' => false,
                'data' => [],
            ], $status ?? 400);
        }
    }

    public function storeJob(JobStoreRequest $request)
    {
        $serial_id = $request->get('serial_id');

        if ($serial_id === '9999') {
            $serial_id = '9999-' . time() . rand(0, 99999);
        }
        $product_detail = $request->get('productDetail');
        $new_job_id = 'JOB-' . time() . rand(0, 99999);
        $store_job = JobList::query()->create([
            'serial_id' => $serial_id,
            'job_id' => $new_job_id,
            'pid' => $product_detail['pid'],
            'p_name' => $product_detail['pname'],
            'p_base_unit' => $product_detail['pbaseunit'],
            'p_cat_id' => $product_detail['pcatid'],
            'p_cat_name' => $product_detail['pCatName'],
            'p_sub_cat_name' => $product_detail['pSubCatName'],
            'fac_model' => $product_detail['facmodel'],
            'warranty_condition' => $product_detail['warrantycondition'] ?? null,
            'warranty_note' => $product_detail['warrantynote'] ?? null,
            'warranty_period' => $product_detail['warrantyperiod'] ?? null,
            'insurance_expire' => $product_detail['insurance_expire'] ?? 'ไม่มีข้อมูล',
            'image_sku' => $product_detail['imagesku'],
            'status' => 'pending',
            'warranty' => $product_detail['warranty'] ?? false,
            'user_key' => Auth::user()->user_code,
            'is_code_key' => Auth::user()->is_code_cust_id,
        ]);

        return response()->json([
            'job_id' => $store_job->id,
            'serial_id' => $store_job->serial_id,
            'job_detail' => $store_job,
        ]);
    }

    public function storeJobFromPid(Request $request)
    {
        try {
            $serial_id = '9999-' . time() . rand(0, 99999);
            $job_id = 'JOB-' . time() . rand(0, 99999);
            $product_detail = $request->get('productDetail');
            $store_job = JobList::query()->create([
                'serial_id' => $serial_id,
                'job_id' => $job_id,
                'pid' => $product_detail['pid'],
                'p_name' => $product_detail['pname'],
                'p_base_unit' => $product_detail['pbaseunit'],
                'p_cat_id' => $product_detail['pcatid'],
                'p_cat_name' => $product_detail['pCatName'],
                'p_sub_cat_name' => $product_detail['pSubCatName'],
                'fac_model' => $product_detail['facmodel'],
                'warranty_condition' => $product_detail['warrantycondition'] ?? null,
                'warranty_note' => $product_detail['warrantynote'] ?? null,
                'warranty_period' => $product_detail['warrantyperiod'] ?? null,
                'insurance_expire' => $product_detail['insurance_expire'] ?? 'ไม่มีข้อมูล',
                'image_sku' => $product_detail['imagesku'],
                'status' => 'pending',
                'warranty' => $product_detail['warranty'] ?? false,
                'user_key' => Auth::user()->user_code,
                'is_code_key' => Auth::user()->is_code_cust_id,
            ]);
            return response()->json([
                'job_id' => $store_job->id,
                'serial_id' => $store_job->serial_id,
                'job_detail' => $store_job,
            ]);
        } catch (QueryException $e) {
            Log::error('Error Database: ' . $e->getMessage() . ' in file ' . $e->getFile() . ' on line ' . $e->getLine());
            return response()->json([
                'message' => 'ไม่สามารถสร้างงานซ่อมได้ error from database',
                'error' => $e->getMessage() . 'in Line => ' . $e->getLine() . ' in file => ' . $e->getFile(),
            ], 400);
        } catch (\Exception $e) {
            Log::error('Error General: ' . $e->getMessage() . ' in file ' . $e->getFile() . ' on line ' . $e->getLine());
            return response()->json([
                'message' => 'ไม่สามารถสร้างงานซ่อมได้ error from database',
                'error' => $e->getMessage() . 'in Line => ' . $e->getLine() . ' in file => ' . $e->getFile(),
            ], 400);
        }
    }


    public function closeJob(Request $request)
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');

        // เก็บ ว่าค้างอยู่หน้าไหน
        $step = 'before';
        $sub_step = 0;
        try {

            DB::beginTransaction();
            // เช็คก่อนว่า สถานะ job ตอนนี้เป็นอย่างไร
            $check_job_status = JobList::query()->where('job_id', $job_id)->first();
            if (isset($check_job_status) && $check_job_status->status === 'pending') {

                $check_repair_man_id = $request['repair_man_id'] ?? null;
                if (!isset($check_repair_man_id)) {
                    throw new \Exception('กรุณาระบุข้อมูลช่างผู้ซ่อม');
                }

                $check_customer = CustomerInJob::query()->where('job_id', $job_id)->first();
                if (!isset($check_customer->name) || !isset($check_customer->phone)) {
                    throw new \Exception('กรุณาบันทึกข้อมูลลูกค้าที่จำเป็นก่อน');
                }
                $check_symptom = Symptom::query()->where('job_id', $job_id)->first();
                if (!isset($check_symptom->symptom)) {
                    throw new \Exception('กรุณากรอกอาการเบื้องต้น');
                }
                $check_file_before = FileUpload::query()->where('job_id', $job_id)->where('menu_id', 1)->get();
                if (count($check_file_before) === 0) {
                    throw new \Exception('กรุณาอัปโหลดไฟล์ สภาพสินค้าก่อนซ่อม');
                }

                $check_behaviour = Behavior::search($job_id);
                if (!isset($check_behaviour)) {
                    $step = 'after';
                    throw new \Exception('กรุณากรอกอาการสาเหตุ');
                }
                $check_spare_part = SparePart::search($job_id);
                if (!isset($check_spare_part)) {
                    $step = 'after';
                    $sub_step = 1;
                    throw new \Exception('กรุณากรอกอะไหล่');
                }
                $check_file_after = FileUpload::search($job_id, 2);
                if (!isset($check_file_after)) {
                    $step = 'after';
                    $sub_step = 3;
                    throw new \Exception('สภาพสินค้าหลังซ่อม');
                }
                // อัพเดทสถานะ job เป็น ปิดงานซ่อม
                $check_job_status->status = 'success';
                $check_job_status->repair_man_id = $check_repair_man_id;
                $check_job_status->close_job_at = Carbon::now();
                $check_job_status->close_job_by = Auth::user()->user_code;
                $check_job_status->save();

                // --- หักสต็อกจาก StockSparePart เมื่อปิดงานซ่อม ---
                $spareParts = SparePart::query()
                    ->where('job_id', $job_id)
                    ->get();

                foreach ($spareParts as $sp) {
                    $stock = StockSparePart::query()
                        ->where('sp_code', $sp->sp_code)
                        ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                        ->first();

                    if ($stock) {
                        $newQty = $stock->qty_sp - (int) $sp->qty;
                        $stock->update([
                            'old_qty_sp' => $stock->qty_sp,
                            'qty_sp' => $newQty,
                        ]);
                    }
                }
            } else {
                throw new \Exception('ไม่สามารถปิดจ็อบได้');
            }
            DB::commit();
            return response()->json([
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'message' => 'ปิดงานซ่อมสำเร็จ'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'step' => $step,
                'sub_step' => $sub_step,
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getFile() . $e->getLine(),
            ], 400);
        }
    }

    public function cancelJob(Request $request)
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');

        // เก็บ ว่าค้างอยู่หน้าไหน
        $step = 'after';
        $sub_step = 0;

        try {
            DB::beginTransaction();
            // เช็คก่อนว่า สถานะ job ตอนนี้เป็นอย่างไร
            $check_job_status = JobList::query()->where('job_id', $job_id)->first();
            if (isset($check_job_status) && $check_job_status->status === 'pending') {
                $check_job_status->status = 'canceled';
                $check_job_status->close_job_by = Auth::user()->user_code;
                $check_job_status->save();
            } else {
                throw new \Exception('ไม่สามารถผิดจ็อบได้');
            }
            //            DB::rollBack();
            DB::commit();
            return response()->json([
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'message' => 'ยกเลิกงานซ่อมสำเร็จ'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getFile() . $e->getLine(),
            ]);
        }
    }
}
