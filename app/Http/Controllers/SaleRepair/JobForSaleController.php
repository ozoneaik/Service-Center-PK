<?php

namespace App\Http\Controllers\SaleRepair;

use App\Http\Controllers\Controller;
use App\Http\Requests\Repair\Job\JobStoreRequest;
use App\Models\AccessoriesNote;
use App\Models\CustomerInJobSale; // ใช้ CustomerInJobSale
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\JobSaleList;      // ใช้ JobSaleList
use App\Models\Remark;
use App\Models\Symptom;
use App\Models\StoreInformation;
use App\Services\SendMessageService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class JobForSaleController extends Controller
{
    // public function searchJob(Request $request): JsonResponse
    // {
    //     $serial_id = $request->serial_id;
    //     $pid = $request->pid;
    //     $job_id = $request->job_id ?? null;
    //     $user = Auth::user();

    //     try {
    //         $query = JobSaleList::query()
    //             ->leftJoin('customer_in_job_sales', 'customer_in_job_sales.job_id', '=', 'job_sale_lists.job_id')
    //             ->leftJoin('store_information', 'customer_in_job_sales.is_code_cust_id', '=', 'store_information.is_code_cust_id')
    //             ->leftJoin('symptoms', 'symptoms.job_id', '=', 'job_sale_lists.job_id')
    //             ->leftJoin('accessories_notes', 'accessories_notes.job_id', '=', 'job_sale_lists.job_id')
    //             ->leftJoin('remarks', 'remarks.job_id', '=', 'job_sale_lists.job_id')

    //             ->select(
    //                 'job_sale_lists.*',
    //                 'job_sale_lists.shop_under_sale_name',
    //                 'job_sale_lists.shop_under_sale_phone',

    //                 // 'job_sale_lists.shop_under_sale_id',
    //                 // 'customer_in_job_sales.shop_under_sale',
    //                 DB::raw("COALESCE(job_sale_lists.shop_under_sale_id, customer_in_job_sales.shop_under_sale_id) as shop_under_sale_id"),
    //                 DB::raw("COALESCE(job_sale_lists.shop_under_sale_name, customer_in_job_sales.shop_under_sale) as shop_under_sale"),

    //                 'customer_in_job_sales.is_code_cust_id',
    //                 'customer_in_job_sales.name as cust_name',
    //                 'customer_in_job_sales.phone as cust_phone',
    //                 'customer_in_job_sales.address as cust_address',
    //                 'customer_in_job_sales.delivery_type',
    //                 'customer_in_job_sales.remark',

    //                 'symptoms.symptom',
    //                 'accessories_notes.note as accessory_note',
    //                 'remarks.remark as internal_remark',

    //                 // [เพิ่ม] นับจำนวนรูปภาพ (menu_id=1 คือสภาพก่อนซ่อม)
    //                 DB::raw("(SELECT count(*) FROM file_uploads WHERE file_uploads.job_id = job_sale_lists.job_id AND file_uploads.menu_id = 1) as file_count"),
    //                 'store_information.shop_name as service_center_name'
    //             );

    //         $found = null;

    //         if (!empty($job_id)) {
    //             $found = $query->clone()
    //                 ->where('job_sale_lists.job_id', $job_id)
    //                 ->orderBy('job_sale_lists.id', 'desc')
    //                 ->first();

    //             if ($found) {
    //                 $found = $this->attachFilesToJob($found);
    //             }

    //             return response()->json([
    //                 'message' => 'เจอข้อมูล แต่ปิดงานซ่อมไปแล้ว',
    //                 'found' => true,
    //                 'job' => ['job_detail' => $found]
    //             ]);
    //         } else {
    //             if ($serial_id === '9999') {
    //                 $found = $query->clone()
    //                     ->where('job_sale_lists.serial_id', 'LIKE', '9999-%')
    //                     ->where('job_sale_lists.pid', $pid)
    //                     ->where('job_sale_lists.user_key', $user->user_code)
    //                     ->where('job_sale_lists.status', 'pending')
    //                     ->orderBy('job_sale_lists.id', 'desc')
    //                     ->get();

    //                 return response()->json([
    //                     'search_by' => 'pid',
    //                     'message' => 'success',
    //                     'found' => count($found) > 0,
    //                     'jobs' => $found->toArray()
    //                 ]);
    //             } else {
    //                 $found = $query->clone()
    //                     ->where('job_sale_lists.serial_id', $serial_id)
    //                     ->where('job_sale_lists.pid', $pid)
    //                     ->orderBy('job_sale_lists.id', 'desc')
    //                     ->first();
    //                 if ($found) {
    //                     $found = $this->attachFilesToJob($found);
    //                 }
    //             }

    //             if ($found && $found->user_key === $user->user_code) {
    //                 if ($found->status === 'pending') {
    //                     return response()->json([
    //                         'search_by' => 'sn',
    //                         'message' => 'เจอข้อมูล',
    //                         'found' => true,
    //                         'job' => ['job_detail' => $found]
    //                     ]);
    //                 } elseif ($found->status === 'send') {
    //                     throw new \Exception('ส่งไปยัง pumpkin');
    //                 } else {
    //                     $status = 404;
    //                     throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
    //                 }
    //             } elseif ($found && $found->user_key !== $user->user_code) {
    //                 throw new \Exception('<span>ถูกซ่อมโดย User ท่านอื่นแล้ว</span>');
    //             } else {
    //                 $status = 404;
    //                 throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
    //             }
    //         }
    //     } catch (\Exception $e) {
    //         Log::error($e->getMessage() . $e->getFile() . $e->getLine());
    //         return response()->json([
    //             'message' => $e->getMessage(),
    //             'found' => false,
    //             'data' => [],
    //         ], $status ?? 400);
    //     }
    // }

    public function searchJob(Request $request): JsonResponse
    {
        $serial_id = $request->serial_id;
        $pid = $request->pid;
        $job_id = $request->job_id ?? null;
        $user = Auth::user();

        try {
            // Query หลักสำหรับค้นหาใน JobSaleList (เหมือนเดิม)
            $query = JobSaleList::query()
                ->leftJoin('customer_in_job_sales', 'customer_in_job_sales.job_id', '=', 'job_sale_lists.job_id')
                ->leftJoin('store_information', 'customer_in_job_sales.is_code_cust_id', '=', 'store_information.is_code_cust_id')
                ->leftJoin('symptoms', 'symptoms.job_id', '=', 'job_sale_lists.job_id')
                ->leftJoin('accessories_notes', 'accessories_notes.job_id', '=', 'job_sale_lists.job_id')
                ->leftJoin('remarks', 'remarks.job_id', '=', 'job_sale_lists.job_id')
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
                    'customer_in_job_sales.remark',
                    'symptoms.symptom',
                    'accessories_notes.note as accessory_note',
                    'remarks.remark as internal_remark',
                    DB::raw("(SELECT count(*) FROM file_uploads WHERE file_uploads.job_id = job_sale_lists.job_id AND file_uploads.menu_id = 1) as file_count"),
                    'store_information.shop_name as service_center_name'
                );

            $found = null;

            // --- CASE 1: Search by Job ID (ระบุเจาะจง) ---
            if (!empty($job_id)) {
                $found = $query->clone()
                    ->where('job_sale_lists.job_id', $job_id)
                    ->orderBy('job_sale_lists.id', 'desc')
                    ->first();

                if ($found) {
                    $found = $this->attachFilesToJob($found);
                }

                // ถ้าเจอด้วย Job ID ให้ส่งข้อมูลกลับไปเลย
                if ($found) {
                    // [Optional] ถ้าต้องการเช็คเงื่อนไข user/status ตรงนี้ด้วย ก็ก๊อปปี้ Logic ด้านล่างมาใส่ได้
                    // แต่ปกตถ้าค้นด้วย ID มักจะต้องการดูรายละเอียดเลย
                    return response()->json([
                        'message' => 'เจอข้อมูล',
                        'found' => true,
                        'job' => ['job_detail' => $found]
                    ]);
                }
            }
            // --- CASE 2: Search by Serial / PID ---
            else {
                if ($serial_id === '9999') {
                    // Logic เดิมสำหรับ 9999
                    $found = $query->clone()
                        ->where('job_sale_lists.serial_id', 'LIKE', '9999-%')
                        ->where('job_sale_lists.pid', $pid)
                        ->where('job_sale_lists.user_key', $user->user_code)
                        ->where('job_sale_lists.status', 'pending')
                        ->orderBy('job_sale_lists.id', 'desc')
                        ->get();

                    return response()->json([
                        'search_by' => 'pid',
                        'message' => 'success',
                        'found' => count($found) > 0,
                        'jobs' => $found->toArray()
                    ]);
                } else {
                    // [STEP 1] เช็คกับตาราง JobList (งานซ่อมจริง) ก่อน
                    $checkInRealJob = JobList::where('serial_id', $serial_id)
                        ->where('pid', $pid)
                        ->latest() // เอาตัวล่าสุด
                        ->first();

                    if ($checkInRealJob) {
                        // ต้องเช็คสถานะเฉพาะเจาะจงข้างในนี้
                        if ($checkInRealJob->status === 'send') {
                            throw new \Exception('ส่งซ่อมไปยังพัมคิน');
                        } elseif ($checkInRealJob->status === 'pending') {
                            throw new \Exception('มีประวัติซ่อมแล้ว');
                        }
                        // throw new \Exception('มีประวัติซ่อมแล้ว');
                    }

                    // [STEP 2] ถ้าไม่เจอใน JobList ให้ค้นหาใน JobSaleList (งานเซลล์)
                    $found = $query->clone()
                        ->where('job_sale_lists.serial_id', $serial_id)
                        ->where('job_sale_lists.pid', $pid)
                        ->orderBy('job_sale_lists.id', 'desc')
                        ->first();

                    if ($found) {
                        $found = $this->attachFilesToJob($found);
                    }
                }

                // [STEP 3] ใช้เงื่อนไขเดิมที่คุณต้องการ
                if ($found && $found->user_key === $user->user_code) {
                    // กรณีเจอข้อมูล และเป็น User ของเรา -> เช็คสถานะเพื่อ Edit
                    if (in_array($found->status_mj, ['active', 'wait', 'pending'])) {
                        return response()->json([
                            'search_by' => 'sn',
                            'message' => 'เจอข้อมูล',
                            'found' => true,
                            'job' => ['job_detail' => $found]
                        ]);
                    } elseif ($found->status_mj === 'send') {
                        throw new \Exception('ส่งงานไปยังศูนย์ซ่อม');
                    } else {
                        $status = 404;
                        throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
                    }
                } elseif ($found && $found->user_key !== $user->user_code) {
                    // กรณีเจอข้อมูล แต่เป็นของคนอื่น
                    throw new \Exception('<span>ถูกซ่อมโดย User ท่านอื่นแล้ว</span>');
                } else {
                    return response()->json([
                        'search_by' => 'sn',
                        'message' => 'ไม่พบข้อมูลการแจ้งซ่อม',
                        'found' => false,
                        'job' => null
                    ], 200);
                }
            }

            $status = 404;
            throw new \Exception('<span>ยืนยันการแจ้งซ่อม</span>');
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getFile() . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'found' => false,
                'data' => [],
            ], $status ?? 400);
        }
    }

    private function attachFilesToJob($job)
    {
        $filesDb = FileUpload::where('job_id', $job->job_id)
            ->where('menu_id', 1)
            ->get(['id', 'file_path']);

        $job->files_before = $filesDb->map(function ($file) {
            $extension = strtolower(pathinfo($file->file_path, PATHINFO_EXTENSION));
            $isVideo = in_array($extension, ['mp4', 'mov', 'avi', 'webm']);

            return [
                'id' => $file->id,
                'url' => asset('storage/' . $file->file_path),
                'is_video' => $isVideo,
                'file_path' => $file->file_path
            ];
        });

        return $job;
    }

    public function storeJob(JobStoreRequest $request)
    {
        $serial_id = $request->get('serial_id');

        if ($serial_id === '9999') {
            $serial_id = '9999-' . time() . rand(0, 99999);
        }
        $product_detail = $request->get('productDetail');

        // Prefix MJ
        $new_job_id = 'MJ-' . time() . rand(0, 99999);

        $shop_id = $request->input('shop_under_sale_id');
        $shop_name = $request->input('shop_under_sale_name');
        $shop_phone = $request->input('shop_under_sale_phone');

        $store_job = JobSaleList::query()->create([
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

            'shop_under_sale_id' => $shop_id,
            'shop_under_sale_name' => $shop_name,
            'shop_under_sale_phone' => $shop_phone,
            'status_mj' => 'active', 
            'created_job_from' => 'sale',
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
            $job_id = 'MJ-' . time() . rand(0, 99999);
            $product_detail = $request->get('productDetail');

            $shop_id = $request->input('shop_under_sale_id');
            $shop_name = $request->input('shop_under_sale_name');
            $shop_phone = $request->input('shop_under_sale_phone');

            $store_job = JobSaleList::query()->create([
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

                'shop_under_sale_id' => $shop_id,
                'shop_under_sale_name' => $shop_name,
                'shop_under_sale_phone' => $shop_phone,
                'status_mj' => 'active',
                'created_job_from' => 'sale',
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

    // public function getCustomersUnderSale(Request $request)
    // {
    //     try {
    //         $loginResponse = Http::post('https://pkapi.pumpkin.tools/api/auth/login', [
    //             'username' => 'B63333',
    //             'password' => '!Nut#63333'
    //         ]);

    //         if ($loginResponse->failed()) {
    //             throw new \Exception('API Login Failed: ' . $loginResponse->body());
    //         }

    //         $token = $loginResponse->json()['access_token'];

    //         $saleCode = Auth::user()->user_code;
    //         Log::info("Searching customers for Sale Code: " . $saleCode);

    //         $payload = ['sale_code' => $saleCode];
    //         if (!empty($request->search)) {
    //             $payload['search'] = $request->search;
    //         }

    //         $customerResponse = Http::withToken($token)
    //             ->asMultipart()
    //             ->post('https://pkapi.pumpkin.tools/api/getCustInSales', $payload);

    //         if ($customerResponse->failed()) {
    //             if ($customerResponse->status() === 404) {
    //                 return response()->json([
    //                     'status' => 'success',
    //                     'data' => []
    //                 ]);
    //             }
    //             Log::error('API Error Response: ' . $customerResponse->body());
    //             throw new \Exception('Get Customer Failed: ' . $customerResponse->status());
    //         }

    //         $apiResult = $customerResponse->json();

    //         return response()->json([
    //             'status' => 'success',
    //             'data' => $apiResult['data'] ?? []
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Get Customer Error: ' . $e->getMessage());
    //         return response()->json(['message' => $e->getMessage()], 500);
    //     }
    // }

    public function getCustomersUnderSale(Request $request)
    {
        try {
            // 1. ส่วนการ Login และเรียก API จริง (คงไว้เหมือนเดิม)
            $loginResponse = Http::post('https://pkapi.pumpkin.tools/api/auth/login', [
                'username' => 'B63333',
                'password' => '!Nut#63333'
            ]);

            if ($loginResponse->failed()) {
                throw new \Exception('API Login Failed: ' . $loginResponse->body());
            }

            $token = $loginResponse->json()['access_token'];
            $saleCode = Auth::user()->user_code;

            $payload = ['sale_code' => $saleCode];
            if (!empty($request->search)) {
                $payload['search'] = $request->search;
            }

            $customerResponse = Http::withToken($token)
                ->asMultipart()
                ->post('https://pkapi.pumpkin.tools/api/getCustInSales', $payload);

            // ดึงข้อมูลจริงจาก API มาเก็บไว้ในตัวแปร $customers
            $customers = [];
            if ($customerResponse->successful()) {
                $apiResult = $customerResponse->json();
                $customers = $apiResult['data'] ?? [];
            } else {
                // กรณี 404 (ไม่เจอข้อมูลใน API) ให้เป็น array ว่าง แล้วค่อยไปเติม Mock ต่อ
                if ($customerResponse->status() !== 404) {
                    Log::error('API Error Response: ' . $customerResponse->body());
                    throw new \Exception('Get Customer Failed: ' . $customerResponse->status());
                }
            }

            $user = Auth::user();

            if ($user->role === 'admin') { // เช็คว่าเป็น Admin หรือไม่
                $specialStore = [
                    'cust_id' => 'IS-CODE-001415445',
                    'cust_code' => 'IS-CODE-001415445',
                    'cust_name' => 'Pumpkin Corporation (warehouse)',
                    'amphoe' => 'บางขุนเทียน',
                    'amphur' => 'บางขุนเทียน',
                    'province' => 'กรุงเทพมหานคร',
                    'tel' => '-',
                    'contact_phone' => '0931622330',
                    'address' => 'สำนักงานใหญ่',
                    'zipcode' => '10150'
                ];

                $search = trim($request->search ?? '');

                // ตรวจสอบการค้นหา
                $isMatch = empty($search) ||
                    str_contains(strtolower($specialStore['cust_name']), strtolower($search)) ||
                    str_contains(strtolower($specialStore['cust_code']), strtolower($search));

                if ($isMatch) {
                    // เช็คว่ามีอยู่แล้วหรือไม่
                    $exists = false;
                    foreach ($customers as $c) {
                        if (isset($c['cust_code']) && $c['cust_code'] === $specialStore['cust_code']) {
                            $exists = true;
                            break;
                        }
                    }

                    if (!$exists) {
                        array_unshift($customers, $specialStore);
                    }
                }
            }
            // ------------------------------------------------------------------

            return response()->json([
                'status' => 'success',
                'data' => $customers
            ]);
        } catch (\Exception $e) {
            Log::error('Get Customer Error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function storeDetail(Request $request)
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

            // 1. บันทึกข้อมูลลูกค้า (CustomerInJobSale)
            if (isset($customer['name']) || isset($customer['phone'])) {
                CustomerInJobSale::updateOrCreate(
                    ['job_id' => $job_id],
                    [
                        'serial_id' => $serial_id,
                        'name' => $customer['name'],
                        'phone' => $customer['phone'],
                        'address' => $customer['address'] ?? null,
                        'remark' => (!empty($customer['subremark3']) && $customer['subremark3'] !== false) ? ($customer['remark'] ?? null) : null,
                        'subremark1' => $customer['subremark1'] ?? false,
                        'subremark2' => $customer['subremark2'] ?? false,
                        'subremark3' => (isset($customer['subremark3']) && $customer['subremark3'] !== '0') ? $customer['subremark3'] : false,

                        'shop_under_sale' => $customer['shop_under_sale'] ?? null,
                        'shop_under_sale_id' => $customer['shop_under_sale_id'] ?? null,
                        'is_code_cust_id' => $customer['is_code_cust_id'] ?? null,
                        'delivery_type'   => $customer['delivery_type'] ?? 'shop',
                    ]
                );
            } else {
                throw new \Exception('กรุณากรอกชื่อ และ นามสกุล');
            }

            // 2. บันทึกอาการ / หมายเหตุ / อุปกรณ์ (ใช้ Model เดิม เพราะเป็นส่วนกลาง)
            if (isset($remark_symptom_accessory['remark'])) {
                Remark::updateOrCreate(['job_id' => $job_id], ['serial_id' => $serial_id, 'remark' => $remark_symptom_accessory['remark']]);
            } else {
                Remark::where('job_id', $job_id)->delete();
            }

            if (isset($remark_symptom_accessory['symptom'])) {
                Symptom::updateOrCreate(['job_id' => $job_id], ['serial_id' => $serial_id, 'symptom' => $remark_symptom_accessory['symptom']]);
            } else {
                Symptom::where('job_id', $job_id)->delete();
            }

            if (isset($remark_symptom_accessory['accessory'])) {
                AccessoriesNote::updateOrCreate(['job_id' => $job_id], ['serial_id' => $serial_id, 'note' => $remark_symptom_accessory['accessory']]);
            } else {
                AccessoriesNote::where('job_id', $job_id)->delete();
            }

            // 3. บันทึกไฟล์
            $this->store_file($file_befores, $serial_id, $job_id);

            // [แก้ไข] อัปเดตสถานะเป็น wait (ใน JobSaleList)
            JobSaleList::where('job_id', $job_id)->update([
                'status_mj' => 'wait'
            ]);

            DB::commit();

            // [เพิ่ม] ส่ง SMS หลังจาก Commit DB สำเร็จ
            try {
                if (!empty($customer['phone'])) {
                    $user = Auth::user();

                    // ค่า Default
                    $shop_name = 'Pumpkin';

                    // ตรวจสอบว่า User มีข้อมูล Store Information หรือไม่
                    if (!empty($customer['is_code_cust_id'])) {
                        $serviceCenter = StoreInformation::where('is_code_cust_id', $customer['is_code_cust_id'])->first();

                        if ($serviceCenter && !empty($serviceCenter->shop_name)) {
                            // ใช้ชื่อจาก Service Center ที่เลือก
                            $shop_name = $serviceCenter->shop_name;
                        }
                    }
                    // (Optional) Fallback: ถ้าหาไม่เจอ ให้ใช้ชื่อร้านของ User ที่ Login (ถ้าต้องการ)
                    // else {
                    //     $user = Auth::user();
                    //     if ($user && $user->store_info && !empty($user->store_info->shop_name)) {
                    //         $shop_name = $user->store_info->shop_name;
                    //     }
                    // }

                    // กำหนดค่า Config
                    $sms_account = env('SMS_ACCOUNT');
                    $sms_password = env('SMS_PASSWORD');

                    // เตรียมข้อความ
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

                try {
                    $creditCheckUrl = 'http://192.168.9.32:9000/api/check-credit-lk.php';
                    $creditResponse = Http::timeout(2)->get($creditCheckUrl, ['system_name' => 'Service Center']);
                    if ($creditResponse->successful()) {
                        Log::info("SMS Credit Check [Success]:", ['body' => $creditResponse->json()]);
                    }
                } catch (\Exception $e) {
                    Log::error("SMS Credit Check [Failed]: " . $e->getMessage());
                }
            } catch (\Exception $smsException) {
                // Catch แยก เพื่อไม่ให้กระทบ Transaction หลัก ถ้าส่ง SMS ไม่ผ่าน งานก็ยังต้องถูกบันทึก
                Log::error("SMS Exception Job: {$job_id} - " . $smsException->getMessage());
            }

            return back()->with('success', "บันทึกข้อมูล (Sale) สำเร็จ กรุณากรอกฟอร์ม บันทึกการซ่อมต่อ");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage() . ' Line:' . $e->getLine());
        }
    }

    // --- Private Helper Functions ---

    private function store_file($file_befores, $serial_id, $job_id)
    {
        $keep = [];
        if (is_array($file_befores)) {
            foreach ($file_befores as $key => $file_data) {
                if (isset($file_data['id']) && is_numeric($file_data['id'])) {
                    $keep[$key] = $file_data['id'];
                }
            }
        }
        $this->deleteFile($job_id, $keep);

        if (is_array($file_befores)) {
            foreach ($file_befores as $file_data) {
                if (isset($file_data['file']) && $file_data['file'] instanceof UploadedFile) {
                    $uploaded_file = $file_data['file'];
                    $timestamp = now()->timestamp;
                    $random = rand(0, 9999);
                    $original_name = pathinfo($uploaded_file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $uploaded_file->getClientOriginalExtension();
                    $new_filename = $timestamp . '_' . $random . '_' . $original_name . '.' . $extension;
                    $file_path = $uploaded_file->storeAs('uploads', $new_filename, 'public');

                    FileUpload::query()->create([
                        'serial_id' => $serial_id,
                        'job_id' => $job_id,
                        'menu_id' => 1,
                        'file_path' => $file_path,
                    ]);
                }
            }
        }
    }

    private function deleteFile($job_id, $keep): void
    {
        $files_to_delete = FileUpload::where('job_id', $job_id)
            ->where('menu_id', 1)
            ->when(!empty($keep), function ($query) use ($keep) {
                return $query->whereNotIn('id', $keep);
            })
            ->get();

        foreach ($files_to_delete as $file) {
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }
            $file->delete();
        }
    }

    public function confirmSendJob(Request $request)
    {
        $request->validate(['job_id' => 'required']);
        $user = Auth::user();

        try {
            // ตรวจสอบว่าเป็น Job ของเรา และสถานะยังแก้ไขได้ (active/wait/pending)
            $job = JobSaleList::where('job_id', $request->job_id)
                ->where('user_key', $user->user_code)
                ->whereIn('status_mj', ['active', 'wait', 'pending'])
                ->first();

            if (!$job) {
                throw new \Exception('ไม่พบรายการ หรือรายการนี้ถูกส่งไปแล้ว ไม่สามารถดำเนินการซ้ำได้');
            }

            // อัปเดตสถานะ
            $job->update([
                'status_mj' => 'send', // สถานะ MJ เป็น send
                'status' => 'send',    // สถานะ Legacy (ถ้ามี)
                'close_job_at' => now(), // (Optional) บันทึกเวลาส่ง
                'close_job_by' => $user->user_code
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'ส่งงานเรียบร้อยแล้ว'
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * ฟังก์ชันลบงาน (Cancel/Delete)
     * ลบข้อมูลทั้งหมดที่เกี่ยวข้องกับ Job นี้ (เฉพาะสถานะที่ยังไม่ส่ง)
     */
    public function cancelJob(Request $request)
    {
        $request->validate(['job_id' => 'required']);
        $user = Auth::user();
        $jobId = $request->job_id;

        try {
            DB::beginTransaction();

            // 1. ตรวจสอบสิทธิ์และสถานะ
            $job = JobSaleList::where('job_id', $jobId)
                ->where('user_key', $user->user_code)
                ->whereIn('status_mj', ['active', 'wait', 'pending']) // ลบได้เฉพาะตอนยังไม่ส่ง
                ->first();

            if (!$job) {
                throw new \Exception('ไม่สามารถลบรายการนี้ได้ (อาจถูกส่งไปแล้ว หรือไม่ใช่รายการของคุณ)');
            }

            // 2. ลบรูปภาพออกจาก Storage (ถ้ามี)
            $files = FileUpload::where('job_id', $jobId)->get();
            foreach ($files as $file) {
                if (Storage::disk('public')->exists($file->file_path)) {
                    Storage::disk('public')->delete($file->file_path);
                }
                $file->delete();
            }

            // 3. ลบข้อมูลจากตารางที่เกี่ยวข้อง
            CustomerInJobSale::where('job_id', $jobId)->delete();
            Remark::where('job_id', $jobId)->delete();
            Symptom::where('job_id', $jobId)->delete();
            AccessoriesNote::where('job_id', $jobId)->delete();

            // 4. ลบ Job หลัก
            $job->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'ลบรายการเรียบร้อยแล้ว'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
