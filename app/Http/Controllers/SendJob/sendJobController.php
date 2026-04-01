<?php

namespace App\Http\Controllers\SendJob;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\StoreInformation;
use Carbon\Carbon;
use GuzzleHttp\Promise\Utils;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class sendJobController extends Controller
{
    // public function sendJobList(Request $request): Response
    // {
    //     logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ส่งซ่อมพิมคินฯ"]);
    //     $query = JobList::query();
    //     if (isset($request->searchSku) && isset($request->searchSn)) {
    //         $query->where('pid', 'like', "%{$request->searchSku}%")->where('serial_id', 'like', "%{$request->searchSn}%");
    //     } elseif (isset($request->searchSku)) {
    //         $query->where('pid', 'like', "%{$request->searchSku}%");
    //     } elseif (isset($request->searchSn)) {
    //         $query->where('serial_id', 'like', "%{$request->searchSn}%");
    //     }
    //     $jobs = $query->where('is_code_key', Auth::user()->is_code_cust_id)
    //         ->where('status', 'pending')->orderBy('id', 'desc')->get();
    //     return Inertia::render('SendJobs/SenJobList', ['jobs' => $jobs]);
    // }

    // public function updateJobSelect(Request $request): \Illuminate\Http\RedirectResponse
    // {
    //     $selectedJob = $request->selectedJobs;
    //     try {
    //         $group_job = time() . rand(1000, 9999);
    //         $created_at = Carbon::now();
    //         DB::beginTransaction();
    //         if (count($selectedJob) > 0) {
    //             foreach ($selectedJob as $job) {
    //                 $findJob = JobList::query()->where('job_id', $job['job_id'])->first();
    //                 $findJob->status = 'send';
    //                 $findJob->group_job = $group_job;
    //                 $findJob->created_at = $created_at;
    //                 $findJob->updated_at = $created_at;
    //                 $findJob->save();
    //             }
    //         } else {
    //             throw new \Exception('ไม่มีจ็อบที่ต้องการส่ง');
    //         }
    //         DB::commit();
    //         logStamp::query()->create(['description' => Auth::user()->user_code . " กดส่งส่งซ่อมพิมคินฯ สำเร็จ $group_job"]);
    //         return Redirect::route('sendJobs.docJobList')->with('success', 'ส่งไปยัง PK สำเร็จ');
    //     } catch (\Exception $exception) {
    //         DB::rollBack();
    //         return Redirect::route('sendJobs.list')->with('error', $exception->getMessage());
    //     }
    // }

    // public function docJobList(): Response
    // {
    //     logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ออกเอกสารส่งกลับ"]);
    //     $groups = JobList::query()
    //         ->where('is_code_key', Auth::user()->is_code_cust_id)
    //         ->where('status', 'send')
    //         ->select('print_at', 'group_job', 'print_updated_at', 'counter_print', 'created_at')
    //         ->groupBy('group_job', 'print_at', 'print_updated_at', 'counter_print', 'created_at')
    //         ->orderBy('created_at', 'desc')
    //         ->get();
    //     return Inertia::render('SendJobs/DocSendJobs', ['groups' => $groups]);
    // }

    // public function groupDetail($job_group): JsonResponse
    // {
    //     try {
    //         $job_group = JobList::query()
    //             ->where('group_job', $job_group)
    //             ->select('serial_id', 'job_id', 'pid', 'p_name', 'updated_at', 'status', 'ticket_code')
    //             ->get();
    //         return response()->json([
    //             'message' => 'success',
    //             'group' => $job_group
    //         ]);
    //     } catch (\Exception $exception) {
    //         return response()->json([
    //             'message' => $exception->getMessage(),
    //             'group' => []
    //         ], 400);
    //     }
    // }

    // public function printJobList($job_group): Response
    // {
    //     logStamp::query()->create(['description' => Auth::user()->user_code . " พิมพ์เอกสาร ออกเอกสารส่งกลับ $job_group"]);
    //     $job_groups = JobList::query()->where('group_job', $job_group)->get();
    //     if ($job_groups->isEmpty()) {
    //         $job_groups = [];
    //     } else {
    //         $now = Carbon::now();
    //         foreach ($job_groups as $job) {
    //             $job->counter_print = $job->counter_print + 1;
    //             if (!isset($job->print_at)) {
    //                 $job->print_at = $now;
    //             }
    //             $job->print_updated_at = $now;
    //             $job->save();
    //         }
    //     }
    //     return Inertia::render('SendJobs/PrintSendJob', ['group' => $job_groups, 'job_group' => $job_group]);
    // }

    // public function successJobList(Request $request): Response
    // {
    //     return Inertia::render('SendJobs/SuccessSendJobs');
    // }

    // public function searchSendJobs(Request $request): JsonResponse
    // {
    //     $jobId = $request->input('job_id');
    //     $serialId = $request->input('serial_id');
    //     $groupJob = $request->input('group_job');

    //     if (!empty($jobId) || !empty($serialId)) {
    //         if (empty($jobId) || empty($serialId)) {
    //             return response()->json([
    //                 'message' => 'โหมด "ซีเรียลและเลข Job" ต้องกรอกทั้ง เลขที่ Job และ เลขที่ Serial',
    //                 'jobs' => []
    //             ], 400);
    //         }
    //     } elseif (empty($groupJob)) {
    //         return response()->json([
    //             'message' => 'กรุณากรอก Job ID, Serial ID หรือ Group Job อย่างน้อยหนึ่งช่องเพื่อค้นหา',
    //             'jobs' => []
    //         ], 400);
    //     }

    //     try {
    //         $query = JobList::query()
    //             ->where('is_code_key', Auth::user()->is_code_cust_id)
    //             ->whereIn('status', [
    //                 'send',
    //                 'บัญชีรับงานแล้ว',
    //                 'ส่งของแล้ว',
    //                 'กำลังส่ง',
    //                 'เตรียมส่ง',
    //                 'พร้อมส่ง',
    //                 'แพ็คสินค้าเสร็จ',
    //                 'กำลังจัดสินค้า',
    //                 'เปิดออเดอร์แล้ว',
    //                 'รอเปิดSO',
    //                 'รอปิดงานซ่อม',
    //                 'กำลังซ่อม',
    //                 'พักงานซ่อม',
    //                 'รอรับงานซ่อม'
    //             ]);
    //         if (!empty($jobId) && !empty($serialId)) {
    //             $query->where('job_id', 'like', "%{$jobId}%")
    //                 ->where('serial_id', 'like', "%{$serialId}%");
    //         } elseif (!empty($groupJob)) {
    //             $query->where('group_job', 'like', "%{$groupJob}%");
    //         }

    //         $jobs = $query->get();

    //         if ($jobs->isEmpty()) {
    //             return response()->json([
    //                 'message' => 'ไม่พบรายการ Job ที่มีสถานะเป็น "ส่งซ่อมไปยังพัมคิน" ตามเงื่อนไขที่ระบุ',
    //                 'jobs' => []
    //             ]);
    //         }
    //         logStamp::query()->create(['description' => Auth::user()->user_code . " ค้นหางานสำหรับจบงาน (status: send) Job ID: $jobId, Serial ID: $serialId, Group Job: $groupJob"]);
    //         return response()->json([
    //             'message' => 'success',
    //             'jobs' => $jobs
    //         ]);
    //     } catch (\Exception $exception) {
    //         logStamp::query()->create(['description' => Auth::user()->user_code . " เกิดข้อผิดพลาดในการค้นหางานสำหรับจบงาน: " . $exception->getMessage()]);
    //         return response()->json([
    //             'message' => 'เกิดข้อผิดพลาดในการค้นหา: ' . $exception->getMessage(),
    //             'jobs' => []
    //         ], 500);
    //     }
    // }

    // // public function getAllSendJobs(Request $request): JsonResponse
    // // {
    // //     try {
    // //         $jobs = JobList::query()
    // //             ->where('is_code_key', Auth::user()->is_code_cust_id)
    // //             ->whereIn('status', ['send', 'อยู่ระหว่างการจัดส่ง', 'จัดส่งสำเร็จ'])
    // //             ->orderBy('created_at', 'asc')
    // //             ->get();
    // //         logStamp::query()->create(['description' => Auth::user()->user_code . " ดูรายการงานสำหรับจบงาน"]);
    // //         if ($jobs->isEmpty()) {
    // //             return response()->json([
    // //                 'message' => 'ไม่พบรายการ Job ที่มีสถานะเป็น "ส่งซ่อมไปยังพัมคิน"',
    // //                 'jobs' => []
    // //             ]);
    // //         }
    // //         return response()->json([
    // //             'message' => 'success',
    // //             'jobs' => $jobs
    // //         ]);
    // //     } catch (\Exception $exception) {
    // //         return response()->json([
    // //             'message' => $exception->getMessage(),
    // //             'jobs' => []
    // //         ], 500);
    // //     }
    // // }

    // public function getAllSendJobs(Request $request): JsonResponse
    // {
    //     try {
    //         $query = JobList::query()
    //             ->where('is_code_key', Auth::user()->is_code_cust_id)
    //             ->whereIn('status', [
    //                 'send',
    //                 'บัญชีรับงานแล้ว',
    //                 'ส่งของแล้ว',
    //                 'กำลังส่ง',
    //                 'เตรียมส่ง',
    //                 'พร้อมส่ง',
    //                 'แพ็คสินค้าเสร็จ',
    //                 'กำลังจัดสินค้า',
    //                 'เปิดออเดอร์แล้ว',
    //                 'รอเปิดSO',
    //                 'รอปิดงานซ่อม',
    //                 'กำลังซ่อม',
    //                 'พักงานซ่อม',
    //                 'รอรับงานซ่อม'
    //             ]);

    //         if ($request->filled('group_job')) {
    //             $query->where('group_job', 'like', '%' . $request->input('group_job') . '%');
    //         }
    //         if ($request->filled('job_id')) {
    //             $query->where('job_id', 'like', '%' . $request->input('job_id') . '%');
    //         }
    //         if ($request->filled('serial_id')) {
    //             $query->where('serial_id', 'like', '%' . $request->input('serial_id') . '%');
    //         }
    //         if ($request->filled('pid')) {
    //             $query->where('pid', 'like', '%' . $request->input('pid') . '%');
    //         }
    //         if ($request->filled('start_date') && $request->filled('end_date')) {
    //             $query->whereBetween('created_at', [$request->input('start_date'), $request->input('end_date')]);
    //         }

    //         //กรองสถานะ 
    //         if ($request->filled('status')) {
    //             $query->where('status', $request->input('status'));
    //         }
    //         // else {
    //         //     $query->whereIn('status', ['send', 'รับคำสั่งซื้อ', 'กำลังดำเนินการจัดเตรียมสินค้า', 'อยู่ระหว่างการจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิกคำสั่งซื้อ']);
    //         // }

    //         $jobs = $query->orderBy('created_at', 'asc')->get();

    //         logStamp::query()->create(['description' => Auth::user()->user_code . " ดูรายการงานสำหรับจบงาน (Filter)"]);

    //         return response()->json([
    //             'message' => 'success',
    //             'jobs' => $jobs
    //         ]);
    //     } catch (\Exception $exception) {
    //         return response()->json([
    //             'message' => $exception->getMessage(),
    //             'jobs' => []
    //         ], 500);
    //     }
    // }

    // // ใช้สถานะจาก DB ในการจบงาน
    // public function finishSendJob(Request $request): JsonResponse
    // {
    //     $jobsToFinish = $request->input('jobs_to_finish');

    //     if (empty($jobsToFinish) || !is_array($jobsToFinish)) {
    //         return response()->json(['message' => 'ไม่มี Job ID ที่เลือกสำหรับจบงาน'], 400);
    //     }

    //     $jobIds = array_column($jobsToFinish, 'job_id');

    //     try {
    //         DB::beginTransaction();
    //         $now = Carbon::now();
    //         $updatedCount = JobList::query()
    //             ->whereIn('job_id', $jobIds)
    //             ->where('is_code_key', Auth::user()->is_code_cust_id)
    //             ->whereIn('status', ['บัญชีรับงานแล้ว', 'ส่งของแล้ว'])
    //             ->update([
    //                 'status' => 'success',
    //                 'close_job_at' => $now,
    //                 'close_job_by' => Auth::user()->user_code,
    //                 'updated_at' => $now,
    //             ]);
    //         if ($updatedCount > 0) {
    //             logStamp::query()->create(['description' => Auth::user()->user_code . " จบงานส่งซ่อม (success) จำนวน $updatedCount รายการ: " . implode(', ', $jobIds)]);
    //             DB::commit();
    //             return response()->json(['message' => "อัปเดตสถานะเป็น 'success' สำเร็จ {$updatedCount} รายการ", 'success' => true]);
    //         } else {
    //             DB::rollBack();
    //             return response()->json(['message' => 'ไม่พบรายการ Job ที่สามารถอัปเดตได้ (สถานะอาจไม่ถูกต้องหรืออัปเดตไปแล้ว)', 'success' => false], 404);
    //         }
    //     } catch (\Exception $exception) {
    //         DB::rollBack();
    //         Log::error('❌ เกิดข้อผิดพลาดในการจบงานส่งซ่อม: ' . $exception->getMessage(), ['user' => Auth::user()->user_code]);
    //         return response()->json([
    //             'message' => 'เกิดข้อผิดพลาดในการจบงาน: ' . $exception->getMessage(),
    //             'success' => false
    //         ], 500);
    //     }
    // }

    // // Mock Up Test CheckJobStatus
    // public function checkJobStatus(Request $request): JsonResponse
    // {
    //     $jobId = $request->input('job_id');
    //     $serialId = $request->input('serial_id');
    //     $pid = $request->input('pid');
    //     $type = $request->input('type');

    //     if (empty($jobId) || empty($serialId) || empty($pid)) {
    //         return response()->json([
    //             'message' => 'กรุณากรอก Job ID, Serial ID และ PID',
    //             'status' => false
    //         ], 400);
    //     }

    //     try {
    //         // ส่วนตั้งค่า Mock Data (สำหรับการทดสอบ)
    //         $isMock = false;
    //         $mockTargetStatus = 'อยู่ระหว่างการจัดส่ง';
    //         $externalStatus = null;
    //         if ($isMock) {
    //             Log::info('🧪 MOCK MODE: กำลังจำลองการเช็คสถานะ', ['job_id' => $jobId]);
    //             sleep(1);

    //             // คุณอาจจะเขียนเงื่อนไขเพิ่มได้ เช่น ถ้า Job ID ลงท้ายด้วย 9 ให้จำลองว่าไม่พบข้อมูล
    //             if (str_ends_with($jobId, '9')) {
    //                 throw new \Exception("ไม่พบงานส่งซ่อม (Mock Error)");
    //             }

    //             // กำหนดค่าสถานะจำลอง
    //             $externalStatus = $mockTargetStatus;
    //         } else {
    //             $timeout = 10;
    //             $uri = "https://afterservice-sv.pumpkin.tools/sv/callpsc.php";

    //             Log::info('📦 เริ่มเช็คสถานะงานซ่อม PK (New API callpsc.php)', ['job_id' => $jobId]);

    //             // ดึง ticket_code จากฐานข้อมูล
    //             $job = JobList::where('job_id', $jobId)->first();
    //             $ticketCode = $job ? $job->ticket_code : null;

    //             if (!$ticketCode) {
    //                 throw new \Exception("ไม่พบ Ticket Code สำหรับ Job นี้ในระบบ ไม่สามารถเช็คสถานะได้");
    //             }

    //             // ส่งแบบ JSON ตามรูปแบบที่ระบุ
    //             $response = Http::timeout($timeout)->post($uri, [
    //                 'ticketcode' => $ticketCode
    //             ]);

    //             if (!$response->successful() || $response->status() !== 200) {
    //                 Log::error('❌ API callpsc.php ล้มเหลว', [
    //                     'status' => $response->status(),
    //                     'body' => $response->body()
    //                 ]);
    //                 throw new \Exception("API ภายนอกล้มเหลว (HTTP {$response->status()})");
    //             }

    //             $response_json = $response->json();

    //             if (!$response_json || !is_array($response_json)) {
    //                 throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่ใช่ JSON ที่ใช้งานได้");
    //             }

    //             // รับสถานะและเลข ASS จาก API
    //             $externalStatus = $response_json['status'] ?? null;
    //             $assNo = $response_json['assno'] ?? null;
    //         }

    //         if (!$externalStatus) {
    //             if (isset($response_json['exists']) && $response_json['exists'] === false) {
    //                 throw new \Exception("ไม่พบงานส่งซ่อมในระบบภายนอก");
    //             }
    //             throw new \Exception("ไม่ได้รับสถานะที่ถูกต้อง (Status is null)");
    //         }

    //         DB::beginTransaction();

    //         $updateData = [
    //             'status' => $externalStatus,
    //             'updated_at' => Carbon::now(),
    //         ];

    //         // ใช้ assno จาก API ถ้ามี ถ้าไม่มีให้ใช้ ticketCode เดิมที่ส่งไป
    //         if ($assNo) {
    //             $updateData['ticket_code'] = $assNo;
    //             $ticketCode = $assNo; // อัปเดตตัวแปรเพื่อส่งกลับไปยัง Frontend
    //         } elseif ($ticketCode) {
    //             $updateData['ticket_code'] = $ticketCode;
    //         }

    //         $updated = JobList::where('job_id', $jobId)->update($updateData);

    //         if ($updated) {
    //             DB::commit();
    //             Log::info('✅ สถานะงานซ่อมถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_new' => $externalStatus, 'assno' => $assNo, 'mode' => $isMock ? 'MOCK' : 'REAL']);
    //         } else {
    //             DB::rollBack();
    //             Log::warning('⚠️ สถานะงานซ่อมไม่ถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_api' => $externalStatus]);
    //         }

    //         return response()->json([
    //             'status' => 'success',
    //             'api_status' => $externalStatus,
    //             'ticket_code' => $ticketCode,
    //             'assno' => $assNo,
    //             'message' => $isMock ? 'ดึงสถานะสำเร็จ (จำลอง)' : 'ดึงสถานะสำเร็จ',
    //         ]);
    //     } catch (\Exception $e) {
    //         if (DB::transactionLevel() > 0) {
    //             DB::rollBack();
    //         }

    //         $errorMessage = $e->getMessage();
    //         $userFriendlyMessage = 'เช็คสถานะล้มเหลว: ';
    //         if (
    //             str_contains($errorMessage, 'cURL error 28') || str_contains($errorMessage, 'timed out') ||
    //             str_contains($errorMessage, 'API ตอบกลับมาในรูปแบบที่ไม่สามารถแยก JSON ได้')
    //         ) {
    //             $userFriendlyMessage .= 'เกิดข้อผิดพลาด กรุณาลองตรวจสอบสถานะใหม่ในภายหลัง';
    //         } elseif (str_contains($errorMessage, 'ไม่พบงานส่งซ่อม')) {
    //             $userFriendlyMessage .= 'ไม่พบงานส่งซ่อมที่ต้องการเช็คสถานะ';
    //         } elseif (str_contains($errorMessage, 'ไม่พบ Ticket Code')) {
    //             $userFriendlyMessage .= $errorMessage;
    //         } else {
    //             // $userFriendlyMessage .= $errorMessage;
    //             $userFriendlyMessage .= 'เกิดข้อผิดพลาด กรุณาลองตรวจสอบใหม่อีกครั้ง';
    //         }

    //         Log::error('❌ ตรวจสอบสถานะงานซ่อมล้มเหลว', ['job_id' => $jobId, 'error' => $errorMessage]);
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => $userFriendlyMessage,
    //             // 'message' => 'เช็คสถานะล้มเหลว: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // public function historySuccessJobs(Request $request): JsonResponse
    // {
    //     try {
    //         $query = JobList::query()
    //             ->where('is_code_key', Auth::user()->is_code_cust_id)
    //             ->where('status', 'success')
    //             ->whereNotNull('group_job');
    //         if ($request->filled('group_job')) {
    //             $query->where('group_job', 'like', '%' . $request->input('group_job') . '%');
    //         }
    //         if ($request->filled('job_id')) {
    //             $query->where('job_id', 'like', '%' . $request->input('job_id') . '%');
    //         }
    //         if ($request->filled('serial_id')) {
    //             $query->where('serial_id', 'like', '%' . $request->input('serial_id') . '%');
    //         }
    //         if ($request->filled('pid')) {
    //             $query->where('pid', 'like', '%' . $request->input('pid') . '%');
    //         }
    //         if ($request->filled('start_date') && $request->filled('end_date')) {
    //             $query->whereBetween('updated_at', [$request->input('start_date'), $request->input('end_date') . ' 23:59:59']);
    //         }

    //         $jobs = $query->orderBy('updated_at', 'desc')->get();

    //         logStamp::query()->create(['description' => Auth::user()->user_code . " ดูประวัติการจบงาน (Filter)"]);

    //         return response()->json([
    //             'message' => 'success',
    //             'jobs' => $jobs
    //         ]);
    //     } catch (\Exception $exception) {
    //         return response()->json([
    //             'message' => $exception->getMessage(),
    //             'jobs' => []
    //         ], 500);
    //     }
    // }

    public function sendJobList(Request $request): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ส่งซ่อมพิมคินฯ"]);
        $query = JobList::query();
        if (isset($request->searchSku) && isset($request->searchSn)) {
            $query->where('pid', 'like', "%{$request->searchSku}%")->where('serial_id', 'like', "%{$request->searchSn}%");
        } elseif (isset($request->searchSku)) {
            $query->where('pid', 'like', "%{$request->searchSku}%");
        } elseif (isset($request->searchSn)) {
            $query->where('serial_id', 'like', "%{$request->searchSn}%");
        }
        $jobs = $query->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'pending')->orderBy('id', 'desc')->get();
        return Inertia::render('SendJobs/SenJobList', ['jobs' => $jobs]);
    }

    public function updateJobSelect(Request $request): \Illuminate\Http\RedirectResponse
    {
        $selectedJob = $request->selectedJobs;
        try {
            $group_job = time() . rand(1000, 9999);
            $created_at = Carbon::now();
            DB::beginTransaction();
            if (count($selectedJob) > 0) {
                foreach ($selectedJob as $job) {
                    $findJob = JobList::query()->where('job_id', $job['job_id'])->first();
                    $findJob->status = 'send';
                    $findJob->group_job = $group_job;
                    $findJob->created_at = $created_at;
                    $findJob->updated_at = $created_at;
                    $findJob->save();
                }
            } else {
                throw new \Exception('ไม่มีจ็อบที่ต้องการส่ง');
            }
            DB::commit();
            logStamp::query()->create(['description' => Auth::user()->user_code . " กดส่งส่งซ่อมพิมคินฯ สำเร็จ $group_job"]);
            return Redirect::route('sendJobs.docJobList')->with('success', 'ส่งไปยัง PK สำเร็จ');
        } catch (\Exception $exception) {
            DB::rollBack();
            return Redirect::route('sendJobs.list')->with('error', $exception->getMessage());
        }
    }

    public function docJobList(): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ออกเอกสารส่งกลับ"]);
        $groups = JobList::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'send')
            ->select('print_at', 'group_job', 'print_updated_at', 'counter_print', 'created_at')
            ->groupBy('group_job', 'print_at', 'print_updated_at', 'counter_print', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('SendJobs/DocSendJobs', ['groups' => $groups]);
    }

    public function groupDetail($job_group): JsonResponse
    {
        try {
            $job_group = JobList::query()
                ->where('group_job', $job_group)
                ->select('serial_id', 'job_id', 'pid', 'p_name', 'updated_at', 'status', 'ticket_code')
                ->get();
            return response()->json([
                'message' => 'success',
                'group' => $job_group
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'group' => []
            ], 400);
        }
    }

    public function printJobList($job_group): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " พิมพ์เอกสาร ออกเอกสารส่งกลับ $job_group"]);
        $job_groups = JobList::query()->where('group_job', $job_group)->get();
        if ($job_groups->isEmpty()) {
            $job_groups = [];
        } else {
            $now = Carbon::now();
            foreach ($job_groups as $job) {
                $job->counter_print = $job->counter_print + 1;
                if (!isset($job->print_at)) {
                    $job->print_at = $now;
                }
                $job->print_updated_at = $now;
                $job->save();
            }
        }
        return Inertia::render('SendJobs/PrintSendJob', ['group' => $job_groups, 'job_group' => $job_group]);
    }

    public function successJobList(Request $request): Response
    {
        $user = Auth::user();
        $isAdmin = $user->role === 'admin';
        $shops = [];

        // โหลดข้อมูลร้านค้า เฉพาะ Admin และกรองร้านที่ไม่ต้องการออก
        if ($isAdmin) {
            $shops = StoreInformation::select('is_code_cust_id', 'shop_name')
                ->whereNotIn('is_code_cust_id', ['68263', '2760801005', '67132', 'How'])
                ->orderBy('shop_name')
                ->get();
        }

        return Inertia::render('SendJobs/SuccessSendJobs', [
            'isAdmin' => $isAdmin,
            'shops' => $shops
        ]);
    }

    public function searchSendJobs(Request $request): JsonResponse
    {
        $jobId = $request->input('job_id');
        $serialId = $request->input('serial_id');
        $groupJob = $request->input('group_job');
        $shop = $request->input('shop'); // รับค่า shop

        if (!empty($jobId) || !empty($serialId)) {
            if (empty($jobId) || empty($serialId)) {
                return response()->json([
                    'message' => 'โหมด "ซีเรียลและเลข Job" ต้องกรอกทั้ง เลขที่ Job และ เลขที่ Serial',
                    'jobs' => []
                ], 400);
            }
        } elseif (empty($groupJob)) {
            return response()->json([
                'message' => 'กรุณากรอก Job ID, Serial ID หรือ Group Job อย่างน้อยหนึ่งช่องเพื่อค้นหา',
                'jobs' => []
            ], 400);
        }

        try {
            $user = Auth::user();
            $query = JobList::query();

            // เช็คสิทธิ์
            if ($user->role === 'admin') {
                if (!empty($shop)) {
                    $query->where('is_code_key', $shop);
                }
            } else {
                $query->where('is_code_key', $user->is_code_cust_id);
            }

            $query->whereIn('status', [
                'send',
                'บัญชีรับงานแล้ว',
                'ส่งของแล้ว',
                'กำลังส่ง',
                'เตรียมส่ง',
                'พร้อมส่ง',
                'แพ็คสินค้าเสร็จ',
                'กำลังจัดสินค้า',
                'เปิดออเดอร์แล้ว',
                'รอเปิดSO',
                'รอปิดงานซ่อม',
                'กำลังซ่อม',
                'พักงานซ่อม',
                'รอรับงานซ่อม'
            ]);

            if (!empty($jobId) && !empty($serialId)) {
                $query->where('job_id', 'like', "%{$jobId}%")
                    ->where('serial_id', 'like', "%{$serialId}%");
            } elseif (!empty($groupJob)) {
                $query->where('group_job', 'like', "%{$groupJob}%");
            }

            $jobs = $query->get();

            if ($jobs->isEmpty()) {
                return response()->json([
                    'message' => 'ไม่พบรายการ Job ที่มีสถานะเป็น "ส่งซ่อมไปยังพัมคิน" ตามเงื่อนไขที่ระบุ',
                    'jobs' => []
                ]);
            }
            logStamp::query()->create(['description' => Auth::user()->user_code . " ค้นหางานสำหรับจบงาน (status: send) Job ID: $jobId, Serial ID: $serialId, Group Job: $groupJob"]);
            return response()->json([
                'message' => 'success',
                'jobs' => $jobs
            ]);
        } catch (\Exception $exception) {
            logStamp::query()->create(['description' => Auth::user()->user_code . " เกิดข้อผิดพลาดในการค้นหางานสำหรับจบงาน: " . $exception->getMessage()]);
            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการค้นหา: ' . $exception->getMessage(),
                'jobs' => []
            ], 500);
        }
    }

    public function getAllSendJobs(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = JobList::query();

            // เช็คสิทธิ์ Admin
            if ($user->role === 'admin') {
                if ($request->filled('shop')) {
                    $query->where('is_code_key', $request->input('shop'));
                }
            } else {
                $query->where('is_code_key', $user->is_code_cust_id);
            }

            $query->whereIn('status', [
                'send',
                'บัญชีรับงานแล้ว',
                'ส่งของแล้ว',
                'กำลังส่ง',
                'เตรียมส่ง',
                'พร้อมส่ง',
                'แพ็คสินค้าเสร็จ',
                'กำลังจัดสินค้า',
                'เปิดออเดอร์แล้ว',
                'รอเปิดSO',
                'รอปิดงานซ่อม',
                'กำลังซ่อม',
                'พักงานซ่อม',
                'รอรับงานซ่อม'
            ]);

            if ($request->filled('group_job')) {
                $query->where('group_job', 'like', '%' . $request->input('group_job') . '%');
            }
            if ($request->filled('job_id')) {
                $query->where('job_id', 'like', '%' . $request->input('job_id') . '%');
            }
            if ($request->filled('serial_id')) {
                $query->where('serial_id', 'like', '%' . $request->input('serial_id') . '%');
            }
            if ($request->filled('pid')) {
                $query->where('pid', 'like', '%' . $request->input('pid') . '%');
            }
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [$request->input('start_date'), $request->input('end_date')]);
            }

            //กรองสถานะ 
            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            $jobs = $query->orderBy('created_at', 'asc')->get();

            logStamp::query()->create(['description' => Auth::user()->user_code . " ดูรายการงานสำหรับจบงาน (Filter)"]);

            return response()->json([
                'message' => 'success',
                'jobs' => $jobs
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'jobs' => []
            ], 500);
        }
    }

    public function finishSendJob(Request $request): JsonResponse
    {
        $jobsToFinish = $request->input('jobs_to_finish');

        if (empty($jobsToFinish) || !is_array($jobsToFinish)) {
            return response()->json(['message' => 'ไม่มี Job ID ที่เลือกสำหรับจบงาน'], 400);
        }

        $jobIds = array_column($jobsToFinish, 'job_id');

        try {
            DB::beginTransaction();
            $now = Carbon::now();
            $updatedCount = JobList::query()
                ->whereIn('job_id', $jobIds)
                ->where('is_code_key', Auth::user()->is_code_cust_id)
                ->whereIn('status', ['บัญชีรับงานแล้ว', 'ส่งของแล้ว'])
                ->update([
                    'status' => 'success',
                    'close_job_at' => $now,
                    'close_job_by' => Auth::user()->user_code,
                    'updated_at' => $now,
                ]);
            if ($updatedCount > 0) {
                logStamp::query()->create(['description' => Auth::user()->user_code . " จบงานส่งซ่อม (success) จำนวน $updatedCount รายการ: " . implode(', ', $jobIds)]);
                DB::commit();
                return response()->json(['message' => "อัปเดตสถานะเป็น 'success' สำเร็จ {$updatedCount} รายการ", 'success' => true]);
            } else {
                DB::rollBack();
                return response()->json(['message' => 'ไม่พบรายการ Job ที่สามารถอัปเดตได้ (สถานะอาจไม่ถูกต้องหรืออัปเดตไปแล้ว)', 'success' => false], 404);
            }
        } catch (\Exception $exception) {
            DB::rollBack();
            Log::error('❌ เกิดข้อผิดพลาดในการจบงานส่งซ่อม: ' . $exception->getMessage(), ['user' => Auth::user()->user_code]);
            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการจบงาน: ' . $exception->getMessage(),
                'success' => false
            ], 500);
        }
    }

    // public function checkJobStatus(Request $request): JsonResponse
    // {
    //     $jobId = $request->input('job_id');
    //     $serialId = $request->input('serial_id');
    //     $pid = $request->input('pid');
    //     $type = $request->input('type');

    //     if (empty($jobId) || empty($serialId) || empty($pid)) {
    //         return response()->json([
    //             'message' => 'กรุณากรอก Job ID, Serial ID และ PID',
    //             'status' => false
    //         ], 400);
    //     }

    //     try {
    //         $isMock = false;
    //         $mockTargetStatus = 'อยู่ระหว่างการจัดส่ง';
    //         $externalStatus = null;
    //         if ($isMock) {
    //             Log::info('🧪 MOCK MODE: กำลังจำลองการเช็คสถานะ', ['job_id' => $jobId]);
    //             sleep(1);

    //             if (str_ends_with($jobId, '9')) {
    //                 throw new \Exception("ไม่พบงานส่งซ่อม (Mock Error)");
    //             }

    //             $externalStatus = $mockTargetStatus;
    //         } else {
    //             $timeout = 10;
    //             $uri = "https://afterservice-sv.pumpkin.tools/sv/callpsc.php";

    //             Log::info('📦 เริ่มเช็คสถานะงานซ่อม PK (New API callpsc.php)', ['job_id' => $jobId]);

    //             $job = JobList::where('job_id', $jobId)->first();
    //             $ticketCode = $job ? $job->ticket_code : null;

    //             if (!$ticketCode) {
    //                 throw new \Exception("ไม่พบ Ticket Code สำหรับ Job นี้ในระบบ ไม่สามารถเช็คสถานะได้");
    //             }

    //             $response = Http::timeout($timeout)->post($uri, [
    //                 'ticketcode' => $ticketCode
    //             ]);

    //             if (!$response->successful() || $response->status() !== 200) {
    //                 Log::error('❌ API callpsc.php ล้มเหลว', [
    //                     'status' => $response->status(),
    //                     'body' => $response->body()
    //                 ]);
    //                 throw new \Exception("API ภายนอกล้มเหลว (HTTP {$response->status()})");
    //             }

    //             $response_json = $response->json();

    //             if (!$response_json || !is_array($response_json)) {
    //                 throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่ใช่ JSON ที่ใช้งานได้");
    //             }

    //             $externalStatus = $response_json['status'] ?? null;
    //             $assNo = $response_json['assno'] ?? null;
    //         }

    //         if (!$externalStatus) {
    //             if (isset($response_json['exists']) && $response_json['exists'] === false) {
    //                 throw new \Exception("ไม่พบงานส่งซ่อมในระบบภายนอก");
    //             }
    //             throw new \Exception("ไม่ได้รับสถานะที่ถูกต้อง (Status is null)");
    //         }

    //         DB::beginTransaction();

    //         $updateData = [
    //             'status' => $externalStatus,
    //             'updated_at' => Carbon::now(),
    //         ];

    //         if ($assNo) {
    //             $updateData['ticket_code'] = $assNo;
    //             $ticketCode = $assNo;
    //         } elseif ($ticketCode) {
    //             $updateData['ticket_code'] = $ticketCode;
    //         }

    //         $updated = JobList::where('job_id', $jobId)->update($updateData);

    //         if ($updated) {
    //             DB::commit();
    //             Log::info('✅ สถานะงานซ่อมถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_new' => $externalStatus, 'assno' => $assNo, 'mode' => $isMock ? 'MOCK' : 'REAL']);
    //         } else {
    //             DB::rollBack();
    //             Log::warning('⚠️ สถานะงานซ่อมไม่ถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_api' => $externalStatus]);
    //         }

    //         return response()->json([
    //             'status' => 'success',
    //             'api_status' => $externalStatus,
    //             'ticket_code' => $ticketCode,
    //             'assno' => $assNo,
    //             'message' => $isMock ? 'ดึงสถานะสำเร็จ (จำลอง)' : 'ดึงสถานะสำเร็จ',
    //         ]);
    //     } catch (\Exception $e) {
    //         if (DB::transactionLevel() > 0) {
    //             DB::rollBack();
    //         }

    //         $errorMessage = $e->getMessage();
    //         $userFriendlyMessage = 'เช็คสถานะล้มเหลว: ';
    //         if (
    //             str_contains($errorMessage, 'cURL error 28') || str_contains($errorMessage, 'timed out') ||
    //             str_contains($errorMessage, 'API ตอบกลับมาในรูปแบบที่ไม่สามารถแยก JSON ได้')
    //         ) {
    //             $userFriendlyMessage .= 'เกิดข้อผิดพลาด กรุณาลองตรวจสอบสถานะใหม่ในภายหลัง';
    //         } elseif (str_contains($errorMessage, 'ไม่พบงานส่งซ่อม')) {
    //             $userFriendlyMessage .= 'ไม่พบงานส่งซ่อมที่ต้องการเช็คสถานะ';
    //         } elseif (str_contains($errorMessage, 'ไม่พบ Ticket Code')) {
    //             $userFriendlyMessage .= $errorMessage;
    //         } else {
    //             $userFriendlyMessage .= 'เกิดข้อผิดพลาด กรุณาลองตรวจสอบใหม่อีกครั้ง';
    //         }

    //         Log::error('❌ ตรวจสอบสถานะงานซ่อมล้มเหลว', ['job_id' => $jobId, 'error' => $errorMessage]);
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => $userFriendlyMessage,
    //         ], 500);
    //     }
    // }


    public function checkJobStatus(Request $request): JsonResponse
    {
        $jobId = $request->input('job_id');
        $serialId = $request->input('serial_id');
        $pid = $request->input('pid');
        $type = $request->input('type');

        if (empty($jobId) || empty($serialId) || empty($pid)) {
            return response()->json([
                'message' => 'กรุณากรอก Job ID, Serial ID และ PID',
                'status' => false
            ], 400);
        }

        try {
            $timeout = 10;
            $uri = "https://afterservice-sv.pumpkin.tools/sv/callpsc.php";

            Log::info('📦 เริ่มเช็คสถานะงานซ่อม PK (New API callpsc.php)', ['job_id' => $jobId]);

            $job = JobList::where('job_id', $jobId)->first();

            if (!$job) {
                throw new \Exception("ไม่พบข้อมูล Job ID นี้ในระบบ");
            }

            // ส่ง $jobId ไปเช็คกับ API ตรงๆ โดยไม่ต้องพึ่งพา ticket_code
            $response = Http::timeout($timeout)->post($uri, [
                'ticketcode' => $jobId
            ]);

            if (!$response->successful() || $response->status() !== 200) {
                Log::error('❌ API callpsc.php ล้มเหลว', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception("API ภายนอกล้มเหลว (HTTP {$response->status()})");
            }

            $response_json = $response->json();

            if (!$response_json || !is_array($response_json)) {
                throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่ใช่ JSON ที่ใช้งานได้");
            }

            $externalStatus = $response_json['status'] ?? null;
            $assNo = $response_json['assno'] ?? null;

            if (!$externalStatus) {
                if (isset($response_json['exists']) && $response_json['exists'] === false) {
                    throw new \Exception("ไม่พบงานส่งซ่อมในระบบภายนอก");
                }
                throw new \Exception("ไม่ได้รับสถานะที่ถูกต้อง (Status is null)");
            }

            DB::beginTransaction();

            // หาก API ตอบกลับว่า "ไม่พบข้อมูล" ให้ถือว่าเป็นสถานะเริ่มต้นคือ 'send' 
            if ($externalStatus === 'ไม่พบข้อมูล') {
                $externalStatus = 'send';
            }

            $updateData = [
                'status' => $externalStatus,
                'updated_at' => Carbon::now(),
            ];

            // ใช้ assno จาก API ถ้ามี
            $ticketCodeForResponse = $job->ticket_code;
            if ($assNo) {
                $updateData['ticket_code'] = $assNo;
                $ticketCodeForResponse = $assNo;
            }

            $updated = JobList::where('job_id', $jobId)->update($updateData);

            if ($updated) {
                DB::commit();
                Log::info('✅ สถานะงานซ่อมถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_new' => $externalStatus, 'assno' => $assNo]);
            } else {
                DB::rollBack();
                Log::warning('⚠️ สถานะงานซ่อมไม่ถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_api' => $externalStatus]);
            }

            return response()->json([
                'status' => 'success',
                'api_status' => $externalStatus,
                'ticket_code' => $ticketCodeForResponse,
                'assno' => $assNo,
                'message' => 'ดึงสถานะสำเร็จ',
            ]);
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            $errorMessage = $e->getMessage();
            $userFriendlyMessage = 'เช็คสถานะล้มเหลว: ';

            if (
                str_contains($errorMessage, 'cURL error 28') || str_contains($errorMessage, 'timed out') ||
                str_contains($errorMessage, 'API ตอบกลับมาในรูปแบบที่ไม่สามารถแยก JSON ได้')
            ) {
                $userFriendlyMessage .= 'เกิดข้อผิดพลาด กรุณาลองตรวจสอบสถานะใหม่ในภายหลัง';
            } elseif (str_contains($errorMessage, 'ไม่พบงานส่งซ่อม')) {
                $userFriendlyMessage .= 'ไม่พบงานส่งซ่อมที่ต้องการเช็คสถานะ';
            } else {
                // แสดง Error ที่แท้จริงออกมาเพื่อให้รู้ว่าติดปัญหาอะไร
                $userFriendlyMessage .= $errorMessage;
            }

            Log::error('❌ ตรวจสอบสถานะงานซ่อมล้มเหลว', ['job_id' => $jobId, 'error' => $errorMessage]);

            // เปลี่ยนจาก 500 เป็น 400 เพื่อให้ Axios จับ Error ปกติได้โดยไม่มองว่าเป็น Server Crash
            return response()->json([
                'status' => 'error',
                'message' => $userFriendlyMessage,
            ], 400);
        }
    }
    
    public function historySuccessJobs(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = JobList::query()
                ->where('status', 'success')
                ->whereNotNull('group_job');

            // เช็คสิทธิ์ Admin
            if ($user->role === 'admin') {
                if ($request->filled('shop')) {
                    $query->where('is_code_key', $request->input('shop'));
                }
            } else {
                $query->where('is_code_key', $user->is_code_cust_id);
            }

            if ($request->filled('group_job')) {
                $query->where('group_job', 'like', '%' . $request->input('group_job') . '%');
            }
            if ($request->filled('job_id')) {
                $query->where('job_id', 'like', '%' . $request->input('job_id') . '%');
            }
            if ($request->filled('serial_id')) {
                $query->where('serial_id', 'like', '%' . $request->input('serial_id') . '%');
            }
            if ($request->filled('pid')) {
                $query->where('pid', 'like', '%' . $request->input('pid') . '%');
            }
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('updated_at', [$request->input('start_date'), $request->input('end_date') . ' 23:59:59']);
            }

            $jobs = $query->orderBy('updated_at', 'desc')->get();

            logStamp::query()->create(['description' => Auth::user()->user_code . " ดูประวัติการจบงาน (Filter)"]);

            return response()->json([
                'message' => 'success',
                'jobs' => $jobs
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'jobs' => []
            ], 500);
        }
    }
}
