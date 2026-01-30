<?php

namespace App\Http\Controllers\ReceiveRepair;

use App\Http\Controllers\Controller;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\JobSaleList;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReceiveRepairController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user(); // ดึงข้อมูลผู้ใช้งานที่ Login

        // ดึงข้อมูลงานที่มีสถานะ 'send' (เซลล์ส่งมาแล้ว)
        $jobs = JobSaleList::query()
            ->select(
                'job_sale_lists.id',
                'job_sale_lists.job_id',
                'job_sale_lists.status_mj',
                'job_sale_lists.created_at',
                'job_sale_lists.updated_at',
                'job_sale_lists.p_name',
                'job_sale_lists.pid',
                DB::raw("COALESCE(job_sale_lists.shop_under_sale_name, customer_in_job_sales.shop_under_sale) as shop_name"),
                'users.name as sale_name'
            )
            ->leftJoin('customer_in_job_sales', 'job_sale_lists.job_id', '=', 'customer_in_job_sales.job_id')
            ->leftJoin('users', 'job_sale_lists.user_key', '=', 'users.user_code')
            // ->whereIn('job_sale_lists.status_mj', ['send', 'process', 'complete'])
            ->when(
                $request->status && $request->status !== 'all',
                function ($query) use ($request) {
                    $query->where('job_sale_lists.status_mj', $request->status);
                },
                function ($query) {
                    // default / all
                    $query->whereIn('job_sale_lists.status_mj', ['send', 'process', 'complete']);
                }
            )

            // กรองเฉพาะงานที่ส่งมายังศูนย์บริการนี้ (Check Service Center Code)
            ->when($user->is_code_cust_id, function ($query) use ($user) {
                $query->where('customer_in_job_sales.is_code_cust_id', $user->is_code_cust_id);
            })

            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('job_sale_lists.job_id', 'like', "%{$search}%")
                        ->orWhere('job_sale_lists.shop_under_sale_name', 'like', "%{$search}%")
                        ->orWhere('customer_in_job_sales.shop_under_sale', 'like', "%{$search}%")
                        ->orWhere('users.name', 'like', "%{$search}%");
                });
            })
            ->orderBy('job_sale_lists.updated_at', 'desc')
            ->paginate(15)
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'job_id' => $item->job_id,
                    'status' => $item->status_mj,
                    'date_sent' => Carbon::parse($item->updated_at)->format('d/m/Y H:i'),
                    'shop_name' => $item->shop_name ?? '-',
                    'product_name' => $item->p_name,
                    'pid' => $item->pid,
                    'sale_name' => $item->sale_name
                ];
            });

        return Inertia::render('NewRepair/ReceiveRepair/Index', [
            'jobs' => $jobs,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function show($job_id)
    {
        $user = Auth::user();

        // 1. Query ข้อมูล Job และ Join ตารางที่เกี่ยวข้อง
        $query = JobSaleList::query()
            ->leftJoin('customer_in_job_sales', 'job_sale_lists.job_id', '=', 'customer_in_job_sales.job_id')
            ->leftJoin('store_information', 'customer_in_job_sales.is_code_cust_id', '=', 'store_information.is_code_cust_id')
            ->leftJoin('symptoms', 'symptoms.job_id', '=', 'job_sale_lists.job_id')
            ->leftJoin('accessories_notes', 'accessories_notes.job_id', '=', 'job_sale_lists.job_id')
            ->leftJoin('remarks', 'remarks.job_id', '=', 'job_sale_lists.job_id')
            ->leftJoin('users', 'job_sale_lists.user_key', '=', 'users.user_code') // เพื่อเอาชื่อเซลล์

            ->select(
                'job_sale_lists.*',
                'job_sale_lists.shop_under_sale_name',
                'job_sale_lists.shop_under_sale_phone',

                DB::raw("COALESCE(job_sale_lists.shop_under_sale_id, customer_in_job_sales.shop_under_sale_id) as shop_under_sale_id"),
                DB::raw("COALESCE(job_sale_lists.shop_under_sale_name, customer_in_job_sales.shop_under_sale) as shop_under_sale"),

                'customer_in_job_sales.is_code_cust_id',
                'customer_in_job_sales.name as cust_name',
                'customer_in_job_sales.phone as cust_phone',
                'customer_in_job_sales.address as cust_address',
                'customer_in_job_sales.delivery_type',
                'customer_in_job_sales.remark as cust_remark', // subremark

                'symptoms.symptom',
                'accessories_notes.note as accessory_note',
                'remarks.remark as internal_remark',

                'store_information.shop_name as service_center_name',
                'users.name as sale_name'
            )
            ->where('job_sale_lists.job_id', $job_id);

        // 2. Security Check: ถ้าเป็นศูนย์ซ่อม ต้องดูได้เฉพาะงานของตัวเอง
        if ($user->is_code_cust_id) {
            $query->where('customer_in_job_sales.is_code_cust_id', $user->is_code_cust_id);
        }

        $job = $query->first();

        if (!$job) {
            return redirect()->route('repair.receive.index')->with('error', 'ไม่พบข้อมูลงานซ่อม หรือคุณไม่มีสิทธิ์เข้าถึง');
        }

        // 3. ดึงรูปภาพประกอบ (Files Before)
        $filesDb = FileUpload::where('job_id', $job_id)
            ->where('menu_id', 1)
            ->get();

        $job->files_before = $filesDb->map(function ($file) {
            $extension = strtolower(pathinfo($file->file_path, PATHINFO_EXTENSION));
            $isVideo = in_array($extension, ['mp4', 'mov', 'avi', 'webm']);
            return [
                'id' => $file->id,
                'url' => asset('storage/' . $file->file_path), // สร้าง URL ให้ Frontend
                'is_video' => $isVideo,
                'file_path' => $file->file_path
            ];
        });

        return Inertia::render('NewRepair/ReceiveRepair/Show', [
            'job' => $job
        ]);
    }

    // public function acceptJob(Request $request)
    // {
    //     $request->validate(['job_id' => 'required']);
    //     $user = Auth::user();

    //     try {
    //         DB::beginTransaction();

    //         // ตรวจสอบทั้ง Job ID, สถานะ และ [เพิ่ม] ความเป็นเจ้าของศูนย์บริการ
    //         $jobQuery = JobSaleList::query()
    //             ->leftJoin('customer_in_job_sales', 'job_sale_lists.job_id', '=', 'customer_in_job_sales.job_id')
    //             ->where('job_sale_lists.job_id', $request->job_id)
    //             ->where('job_sale_lists.status_mj', 'send');

    //         // [เพิ่ม] ป้องกันการยิง API รับงานของศูนย์อื่น
    //         if ($user->is_code_cust_id) {
    //             $jobQuery->where('customer_in_job_sales.is_code_cust_id', $user->is_code_cust_id);
    //         }

    //         // ต้อง select * จาก job_sale_lists เพื่อให้ได้ Model JobSaleList กลับมา update
    //         $job = $jobQuery->select('job_sale_lists.*')->first();

    //         if (!$job) {
    //             throw new \Exception('ไม่พบรายการ หรือรายการถูกรับไปแล้ว หรือคุณไม่มีสิทธิ์รับงานนี้');
    //         }

    //         // อัปเดตสถานะเป็น process (รับงานแล้ว)
    //         $job->update([
    //             'status_mj' => 'process',
    //             // สามารถเพิ่ม field เก็บว่าใครรับงานได้ตรงนี้ เช่น 'technician_id' => $user->id
    //         ]);

    //         DB::commit();

    //         return response()->json([
    //             'status' => 'success',
    //             'message' => 'รับงานเรียบร้อยแล้ว สถานะเปลี่ยนเป็น Process'
    //         ]);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         Log::error($e->getMessage());
    //         return response()->json(['message' => $e->getMessage()], 400);
    //     }
    // }

    public function acceptJob(Request $request)
    {
        $request->validate(['job_id' => 'required']);
        $user = Auth::user();

        try {
            DB::beginTransaction();

            // 1. ดึงข้อมูล JobSaleList พร้อม Customer
            $jobQuery = JobSaleList::query()
                ->leftJoin('customer_in_job_sales', 'job_sale_lists.job_id', '=', 'customer_in_job_sales.job_id')
                ->where('job_sale_lists.job_id', $request->job_id)
                ->where('job_sale_lists.status_mj', 'send');

            // Security Check
            if ($user->is_code_cust_id) {
                $jobQuery->where('customer_in_job_sales.is_code_cust_id', $user->is_code_cust_id);
            }

            // Select ทั้งหมดเพื่อเอามา Clone
            $jobSale = $jobQuery->select(
                'job_sale_lists.*',
                // เลือก Customer fields มาด้วยเพื่อความชัวร์ (หรือจะดึงแยกก็ได้)
                'customer_in_job_sales.name as cust_name',
                'customer_in_job_sales.phone as cust_phone',
                'customer_in_job_sales.address as cust_address',
                'customer_in_job_sales.remark as cust_remark',
                'customer_in_job_sales.subremark1',
                'customer_in_job_sales.subremark2',
                'customer_in_job_sales.subremark3',
                'customer_in_job_sales.shop_under_sale',
                'customer_in_job_sales.shop_under_sale_id',
                'customer_in_job_sales.is_code_cust_id',
                'customer_in_job_sales.delivery_type'
            )->first();

            if (!$jobSale) {
                throw new \Exception('ไม่พบรายการ หรือรายการถูกรับไปแล้ว หรือคุณไม่มีสิทธิ์รับงานนี้');
            }

            // 2. Clone ข้อมูลลง JobList (ตารางหลัก)
            // ตรวจสอบก่อนว่ามีอยู่แล้วหรือไม่ (กันซ้ำ)
            $existingJob = JobList::where('job_id', $jobSale->job_id)->first();
            if (!$existingJob) {
                JobList::create([
                    'job_id'             => $jobSale->job_id,
                    'pid'                => $jobSale->pid,
                    'p_name'             => $jobSale->p_name,
                    'p_base_unit'        => $jobSale->p_base_unit,
                    'p_cat_id'           => $jobSale->p_cat_id,
                    'p_cat_name'         => $jobSale->p_cat_name,
                    'p_sub_cat_name'     => $jobSale->p_sub_cat_name,
                    'fac_model'          => $jobSale->fac_model,
                    'warranty_condition' => $jobSale->warranty_condition,
                    'warranty_note'      => $jobSale->warranty_note,
                    'warranty_period'    => $jobSale->warranty_period,
                    'serial_id'          => $jobSale->serial_id,
                    'image_sku'          => $jobSale->image_sku,
                    'status'             => 'pending',
                    'warranty'           => $jobSale->warranty,

                    'user_key'           => $user->user_code,
                    'is_code_key'        => $user->is_code_cust_id,

                    'repair_man_id'      => $user->id,
                    'insurance_expire'   => $jobSale->insurance_expire,
                    'status_mj'          => 'process',

                    // ข้อมูลร้านค้า (จาก JobSaleList หรือ Customer)
                    'shop_under_sale_id'   => $jobSale->shop_under_sale_id,
                    'shop_under_sale_name' => $jobSale->shop_under_sale_name ?? $jobSale->shop_under_sale,
                    'shop_under_sale_phone' => $jobSale->shop_under_sale_phone,

                    // Map เวลา (Optional)
                    'created_at'         => now(),
                    'updated_at'         => now(),

                    'created_job_from' => 'sale'
                ]);
            }

            // 3. Clone ข้อมูลลง CustomerInJob (ตารางลูกค้าหลัก)
            $existingCust = CustomerInJob::where('job_id', $jobSale->job_id)->first();
            if (!$existingCust) {
                CustomerInJob::create([
                    'job_id'             => $jobSale->job_id,
                    'serial_id'          => $jobSale->serial_id,
                    'name'               => $jobSale->cust_name,
                    'phone'              => $jobSale->cust_phone,
                    'address'            => $jobSale->cust_address,
                    'remark'             => $jobSale->cust_remark,
                    'subremark1'         => $jobSale->subremark1,
                    'subremark2'         => $jobSale->subremark2,
                    'subremark3'         => $jobSale->subremark3,
                    'shop_under_sale'    => $jobSale->shop_under_sale,
                    'shop_under_sale_id' => $jobSale->shop_under_sale_id,
                    'is_code_cust_id'    => $jobSale->is_code_cust_id,
                    'delivery_type'      => $jobSale->delivery_type,
                ]);
            }

            // 4. อัปเดตสถานะใน JobSaleList (ต้นทาง)
            // ต้อง update ผ่าน Model โดยตรงเพื่อให้ Timestamp ทำงานถูกต้อง
            $originJob = JobSaleList::find($jobSale->id);
            if ($originJob) {
                $originJob->update([
                    'status_mj' => 'process',
                    'status'    => 'process'
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'รับงานเรียบร้อยแล้ว ข้อมูลถูกส่งไปยังระบบซ่อม'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Accept Job Error: " . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
