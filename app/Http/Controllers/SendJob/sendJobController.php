<?php

namespace App\Http\Controllers\SendJob;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\logStamp;
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
                ->select('serial_id', 'job_id', 'pid', 'p_name', 'updated_at', 'status')
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
                $job['counter_print'] = $job['counter_print'] + 1;
                if (!isset($job['print_at'])) {
                    $job['print_at'] = $now;
                }
                $job['print_updated_at'] = $now;
                $job->save();
            }
        }
        return Inertia::render('SendJobs/PrintSendJob', ['group' => $job_groups, 'job_group' => $job_group]);
    }

    public function successJobList(Request $request): Response
    {
        return Inertia::render('SendJobs/SuccessSendJobs');
    }

    public function searchSendJobs(Request $request): JsonResponse
    {
        $jobId = $request->input('job_id');
        $serialId = $request->input('serial_id');
        $groupJob = $request->input('group_job');

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
            $query = JobList::query()
                ->where('is_code_key', Auth::user()->is_code_cust_id)
                ->whereIn('status', ['send', 'อยู่ระหว่างการจัดส่ง', 'จัดส่งสำเร็จ']);
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

    // public function getAllSendJobs(Request $request): JsonResponse
    // {
    //     try {
    //         $jobs = JobList::query()
    //             ->where('is_code_key', Auth::user()->is_code_cust_id)
    //             ->whereIn('status', ['send', 'อยู่ระหว่างการจัดส่ง', 'จัดส่งสำเร็จ'])
    //             ->orderBy('created_at', 'asc')
    //             ->get();
    //         logStamp::query()->create(['description' => Auth::user()->user_code . " ดูรายการงานสำหรับจบงาน"]);
    //         if ($jobs->isEmpty()) {
    //             return response()->json([
    //                 'message' => 'ไม่พบรายการ Job ที่มีสถานะเป็น "ส่งซ่อมไปยังพัมคิน"',
    //                 'jobs' => []
    //             ]);
    //         }
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

    public function getAllSendJobs(Request $request): JsonResponse
    {
        try {
            $query = JobList::query()
                ->where('is_code_key', Auth::user()->is_code_cust_id)
                ->whereIn('status', ['send', 'รับคำสั่งซื้อ', 'กำลังดำเนินการจัดเตรียมสินค้า', 'อยู่ระหว่างการจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิกคำสั่งซื้อ']);

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
            } else {
                $query->whereIn('status', ['send', 'รับคำสั่งซื้อ', 'กำลังดำเนินการจัดเตรียมสินค้า', 'อยู่ระหว่างการจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิกคำสั่งซื้อ']);
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

    // ใช้สถานะจาก DB ในการจบงาน
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
                // ->where('status', 'จัดส่งสำเร็จ')
                ->where('status', 'send')
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

    // เช็ค API ซ้ำตอนกดจบงาน
    // public function finishSendJob(Request $request): JsonResponse
    // {
    //     $jobsToFinish = $request->input('jobs_to_finish');

    //     if (empty($jobsToFinish) || !is_array($jobsToFinish)) {
    //         return response()->json(['message' => 'ไม่มี Job ID ที่เลือกสำหรับจบงาน'], 400);
    //     }

    //     $REQUIRED_API_STATUS = 'อยู่ระหว่างการจัดส่ง';
    //     $jobIdsToUpdate = [];
    //     $jobsToFinishMap = collect($jobsToFinish)->keyBy('job_id');

    //     try {
    //         $requests = [];
    //         $uri = env('VITE_API_CHECK_ORDER');
    //         $timeout = 10;

    //         foreach ($jobsToFinishMap as $jobId => $jobData) {
    //             $body = ['jobno' => $jobData['job_id'], 'serialno' => $jobData['serial_id'], 'pid' => $jobData['pid']];
    //             $requests[$jobId] = Http::timeout($timeout)->async()->post($uri, $body);
    //         }

    //         if (empty($requests)) {
    //             return response()->json(['message' => 'ไม่สามารถเตรียมคำขอ API ได้ (Job List ว่างเปล่า)', 'success' => false], 500);
    //         }

    //         $responses = Utils::settle($requests)->wait();
    //         DB::beginTransaction();
    //         $now = Carbon::now();

    //         foreach ($jobsToFinishMap as $jobId => $jobData) {
    //             $externalStatus = null;
    //             if (isset($responses[$jobId]['value'])) {
    //                 $response = $responses[$jobId]['value'];
    //                 if (!($response instanceof Response)) {
    //                     throw new \Exception("Job ID: $jobId การตอบกลับ API ไม่ใช่รูปแบบ Response ที่คาดหวัง");
    //                 }

    //                 $rawBody = trim($response->body());
    //                 $jsonMatch = [];
    //                 if (preg_match('/{.*}$/s', $rawBody, $jsonMatch)) {
    //                     $response_json = json_decode($jsonMatch[0], true);
    //                     $externalStatus = $response_json['status'] ?? null;
    //                 }
    //             } elseif (isset($responses[$jobId]['reason'])) {
    //                 $exception = $responses[$jobId]['reason'];
    //                 $errorMessage = $exception->getMessage();
    //                 if ($exception instanceof ConnectionException) {
    //                     $errorMessage = "การเชื่อมต่อล้มเหลว/หมดเวลา";
    //                 }
    //                 throw new \Exception("Job ID: $jobId การเรียก API ล้มเหลว: " . $errorMessage);
    //             } else {
    //                 throw new \Exception("Job ID: $jobId ไม่พบผลลัพธ์การเรียก API ที่ชัดเจน");
    //             }
    //             $findJob = JobList::query()->where('job_id', $jobId)->first();
    //             if (!$findJob) {
    //                 throw new \Exception("ไม่พบ Job ID: $jobId ในระบบ");
    //             }
    //             if (!in_array($findJob->status, ['send', 'อยู่ระหว่างการจัดส่ง', 'จัดส่งสำเร็จ'])) {
    //                 throw new \Exception("Job ID: $jobId ไม่ได้อยู่ในสถานะที่พร้อมปิดงาน (ปัจจุบันสถานะคือ: {$findJob->status})");
    //             }
    //             if (!$externalStatus) {
    //                 throw new \Exception("Job ID: $jobId API ภายนอกไม่มีสถานะตอบกลับ หรือรูปแบบ Response ผิดพลาด");
    //             }
    //             if ($externalStatus === 'ไม่พบคำสั่งซื้อ') {
    //                 throw new \Exception("Job ID: $jobId ไม่พบงานส่งซ่อมในระบบภายนอก");
    //             }
    //             if ($externalStatus !== $REQUIRED_API_STATUS) {
    //                 throw new \Exception("Job ID: $jobId สถานะภายนอกคือ '$externalStatus'. ต้องเป็น '$REQUIRED_API_STATUS' จึงจะปิดงานได้");
    //             }
    //             $jobIdsToUpdate[] = $jobId;
    //         }
    //         if (count($jobIdsToUpdate) > 0) {
    //             $updatedCount = JobList::query()
    //                 ->whereIn('job_id', $jobIdsToUpdate)
    //                 ->where('is_code_key', Auth::user()->is_code_cust_id)
    //                 ->whereIn('status', ['send', 'อยู่ระหว่างการจัดส่ง'])
    //                 ->update([
    //                     'status' => 'success',
    //                     'close_job_at' => $now,
    //                     'close_job_by' => Auth::user()->user_code,
    //                     'updated_at' => $now,
    //                 ]);

    //             if ($updatedCount > 0) {
    //                 logStamp::query()->create(['description' => Auth::user()->user_code . " จบงานส่งซ่อม (success) จำนวน $updatedCount รายการ: " . implode(', ', $jobIdsToUpdate)]);
    //                 DB::commit();
    //                 return response()->json(['message' => "อัปเดตสถานะเป็น 'success' สำเร็จ {$updatedCount} รายการ", 'success' => true]);
    //             } else {
    //                 DB::rollBack();
    //                 return response()->json(['message' => 'ไม่พบรายการ Job ที่สามารถอัปเดตได้ (อาจถูกอัปเดตไปก่อนหน้านี้ หรือสถานะไม่ตรง)', 'success' => false], 404);
    //             }
    //         } else {
    //             DB::rollBack();
    //             return response()->json(['message' => 'ไม่พบรายการ Job ที่ผ่านเงื่อนไขการตรวจสอบสถานะภายนอกเพื่อทำการปิดงาน'], 400);
    //         }
    //     } catch (\Exception $exception) {
    //         DB::rollBack();
    //         $errorMessage = $exception->getMessage();
    //         $customMessage = 'ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ';
    //         if (
    //             str_contains($errorMessage, 'การตอบกลับ API ไม่ใช่รูปแบบ Response ที่คาดหวัง') ||
    //             str_contains($errorMessage, 'API ภายนอกไม่มีสถานะตอบกลับ')
    //         ) {

    //             $finalMessage = $customMessage;
    //         } elseif (str_contains($errorMessage, 'ไม่พบงานส่งซ่อมในระบบภายนอก')) {
    //             $finalMessage = $errorMessage;
    //         } else {
    //             $finalMessage = $errorMessage;
    //         }

    //         Log::error('❌ เกิดข้อผิดพลาดในการจบงานส่งซ่อม (Batch): ' . $errorMessage, ['user' => Auth::user()->user_code]);
    //         return response()->json([
    //             'message' => 'เกิดข้อผิดพลาดในการจบงาน: ' . $finalMessage,
    //             'success' => false
    //         ], 500);
    //     }
    // }

    // public function checkJobStatus(Request $request): JsonResponse
    // {
    //     $jobId = $request->input('job_id');
    //     $serialId = $request->input('serial_id');
    //     $pid = $request->input('pid');

    //     if (empty($jobId) || empty($serialId) || empty($pid)) {
    //         return response()->json([
    //             'message' => 'กรุณากรอก Job ID, Serial ID และ PID',
    //             'status' => false
    //         ], 400);
    //     }

    //     try {
    //         $timeout = 10;
    //         $uri = env('VITE_API_CHECK_ORDER');
    //         $body = ['jobno' => $jobId, 'serialno' => $serialId, 'pid' => $pid];

    //         Log::info('📦 เริ่มเช็คสถานะงานซ่อม PK', ['job_id' => $jobId, 'request_body' => $body, 'timeout' => $timeout]);
    //         $response = Http::timeout($timeout)->post($uri, $body);

    //         if (!$response->successful() || $response->status() !== 200) {
    //             $errorBody = $response->body();
    //             if (str_contains($errorBody, 'ไม่พบคำสั่งซื้อ') || str_contains($errorBody, 'not found')) {
    //                 throw new \Exception("ไม่พบงานส่งซ่อมในระบบภายนอก");
    //             }
    //             throw new \Exception("API ภายนอกล้มเหลว (HTTP {$response->status()})");
    //         }

    //         $rawBody = trim($response->body());
    //         $jsonMatch = [];

    //         if (!preg_match('/{.*}$/s', $rawBody, $jsonMatch)) {
    //             throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่สามารถแยก JSON ได้: " . $rawBody);
    //         }

    //         $jsonString = $jsonMatch[0];
    //         $response_json = json_decode($jsonString, true);

    //         if (!is_array($response_json)) {
    //             throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่ใช่ JSON ที่ใช้งานได้: " . $jsonString);
    //         }

    //         $externalStatus = $response_json['status'] ?? null;

    //         if (!$externalStatus) {
    //             throw new \Exception("API ตอบกลับมาแล้ว แต่ไม่พบคีย์ 'status' ใน Response JSON. JSON ที่ได้รับ: " . json_encode($response_json));
    //         }
    //         if ($externalStatus === 'ไม่พบคำสั่งซื้อ') {
    //             throw new \Exception("ไม่พบงานส่งซ่อม");
    //         }
    //         DB::beginTransaction();
    //         $updated = JobList::where('job_id', $jobId)->update([
    //             'status' => $externalStatus,
    //             'updated_at' => Carbon::now(),
    //         ]);

    //         if ($updated) {
    //             DB::commit();
    //             Log::info('✅ สถานะงานซ่อมถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_new' => $externalStatus]);
    //         } else {
    //             DB::rollBack();
    //             Log::warning('⚠️ สถานะงานซ่อมไม่ถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_api' => $externalStatus]);
    //         }

    //         return response()->json([
    //             'status' => 'success',
    //             'api_status' => $externalStatus,
    //             'message' => 'ดึงสถานะสำเร็จ',
    //         ]);
    //     } catch (\Exception $e) {
    //         if (DB::transactionLevel() > 0) {
    //             DB::rollBack();
    //         }
    //         $errorMessage = $e->getMessage();
    //         $userFriendlyMessage = 'เช็คสถานะล้มเหลว: ';
    //         if (
    //             str_contains($errorMessage, 'cURL error 28') ||
    //             str_contains($errorMessage, 'timed out') ||
    //             str_contains($errorMessage, 'API ตอบกลับมาในรูปแบบที่ไม่สามารถแยก JSON ได้')
    //         ) {

    //             $userFriendlyMessage .= 'เกิดข้อผิดพลาด กรุณาลองใหม่ในภายหลัง';
    //         } elseif (str_contains($errorMessage, 'ไม่พบงานส่งซ่อม')) {
    //             $userFriendlyMessage .= 'ไม่พบงานส่งซ่อมที่ต้องการเช็คสถานะในระบบภายนอก';
    //         } else {
    //             $userFriendlyMessage .= $errorMessage;
    //         }

    //         Log::error('❌ ตรวจสอบสถานะงานซ่อมล้มเหลว', ['job_id' => $jobId, 'error' => $errorMessage]);
    //         Log::error('❌ ตรวจสอบสถานะงานซ่อมล้มเหลว', ['job_id' => $jobId, 'error' => $e->getMessage()]);
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'เช็คสถานะล้มเหลว: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // Mock Up Test CheckJobStatus
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
            // ส่วนตั้งค่า Mock Data (สำหรับการทดสอบ)
            $isMock = false;
            $mockTargetStatus = 'อยู่ระหว่างการจัดส่ง';
            $externalStatus = null;
            if ($isMock) {
                Log::info('🧪 MOCK MODE: กำลังจำลองการเช็คสถานะ', ['job_id' => $jobId]);
                sleep(1);

                // คุณอาจจะเขียนเงื่อนไขเพิ่มได้ เช่น ถ้า Job ID ลงท้ายด้วย 9 ให้จำลองว่าไม่พบข้อมูล
                if (str_ends_with($jobId, '9')) {
                    throw new \Exception("ไม่พบงานส่งซ่อม (Mock Error)");
                }

                // กำหนดค่าสถานะจำลอง
                $externalStatus = $mockTargetStatus;
            } else {
                $timeout = 10;
                $uri = env('VITE_API_CHECK_ORDER');
                $body = ['jobno' => $jobId, 'serialno' => $serialId, 'pid' => $pid, 'type' => $type];

                Log::info('📦 เริ่มเช็คสถานะงานซ่อม PK', ['job_id' => $jobId, 'request_body' => $body, 'timeout' => $timeout]);
                $response = Http::timeout($timeout)->post($uri, $body);

                if (!$response->successful() || $response->status() !== 200) {
                    $errorBody = $response->body();
                    if (str_contains($errorBody, 'ไม่พบคำสั่งซื้อ') || str_contains($errorBody, 'not found')) {
                        throw new \Exception("ไม่พบงานส่งซ่อมในระบบภายนอก");
                    }
                    throw new \Exception("API ภายนอกล้มเหลว (HTTP {$response->status()})");
                }

                $rawBody = trim($response->body());
                $jsonMatch = [];

                if (!preg_match('/{.*}$/s', $rawBody, $jsonMatch)) {
                    throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่สามารถแยก JSON ได้: " . $rawBody);
                }

                $jsonString = $jsonMatch[0];
                $response_json = json_decode($jsonString, true);

                if (!is_array($response_json)) {
                    throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่ใช่ JSON ที่ใช้งานได้: " . $jsonString);
                }

                $externalStatus = $response_json['status'] ?? null;
            }

            if (!$externalStatus) {
                throw new \Exception("ไม่ได้รับสถานะที่ถูกต้อง (Status is null)");
            }

            if ($externalStatus === 'ไม่พบคำสั่งซื้อ') {
                throw new \Exception("ไม่พบงานส่งซ่อม");
            }

            DB::beginTransaction();
            $updated = JobList::where('job_id', $jobId)->update([
                'status' => $externalStatus,
                'updated_at' => Carbon::now(),
            ]);

            if ($updated) {
                DB::commit();
                Log::info('✅ สถานะงานซ่อมถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_new' => $externalStatus, 'mode' => $isMock ? 'MOCK' : 'REAL']);
            } else {
                DB::rollBack();
                Log::warning('⚠️ สถานะงานซ่อมไม่ถูกอัปเดตใน DB', ['job_id' => $jobId, 'status_api' => $externalStatus]);
            }

            return response()->json([
                'status' => 'success',
                'api_status' => $externalStatus,
                'message' => $isMock ? 'ดึงสถานะสำเร็จ (จำลอง)' : 'ดึงสถานะสำเร็จ',
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
                // $userFriendlyMessage .= $errorMessage;
                $userFriendlyMessage .= 'เกิดข้อผิดพลาด กรุณาลองตรวจสอบใหม่อีกครั้ง';
            }

            Log::error('❌ ตรวจสอบสถานะงานซ่อมล้มเหลว', ['job_id' => $jobId, 'error' => $errorMessage]);
            return response()->json([
                'status' => 'error',
                'message' => $userFriendlyMessage,
                // 'message' => 'เช็คสถานะล้มเหลว: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function historySuccessJobs(Request $request): JsonResponse
    {
        try {
            $query = JobList::query()
                ->where('is_code_key', Auth::user()->is_code_cust_id)
                ->where('status', 'success')
                ->whereNotNull('group_job');
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
