<?php

namespace App\Http\Controllers\DealerRepair;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StoreInformation;
use App\Traits\FetchesPkApi;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DealerSendJobController extends Controller
{
    use FetchesPkApi;
    public function sendJobList(Request $request): Response
    {
        $user   = Auth::user();
        $isSale = $user->role === 'sale';

        if ($isSale) {
            $dealerList    = $this->getManagedDealerList($user->user_code);
            $dealerCodes   = $dealerList->pluck('is_code_cust_id')->toArray();
            $dealerNameMap = $dealerList->pluck('shop_name', 'is_code_cust_id')->toArray();
            $selectedDealer = $request->dealer_code;

            $query = JobList::query()
                ->whereIn('dealer_code', $dealerCodes)
                ->where('status', 'pending')
                ->whereNull('group_job')
                ->when($selectedDealer, fn($q) => $q->where('dealer_code', $selectedDealer));

            if ($request->searchSku) {
                $query->where('pid', 'like', "%{$request->searchSku}%");
            }
            if ($request->searchSn) {
                $query->where('serial_id', 'like', "%{$request->searchSn}%");
            }

            $jobs = $query->orderBy('dealer_code')
                ->orderBy('id', 'desc')
                ->get()
                ->map(function ($job) use ($dealerNameMap) {
                    $job->dealer_shop_name = $dealerNameMap[$job->dealer_code] ?? $job->dealer_code;
                    return $job;
                });

            $completeIds = $this->getFormCompleteJobIds($jobs->pluck('job_id')->toArray());
            $jobs = $jobs->map(function ($job) use ($completeIds) {
                $job->before_form_complete = in_array($job->job_id, $completeIds);
                return $job;
            });

            return Inertia::render('DealerRepair/SendJob/DealerSendJobList', [
                'jobs'            => $jobs,
                'dealer_list'     => $dealerList,
                'selected_dealer' => $selectedDealer,
                'is_sale'         => true,
            ]);
        }

        $dealerCode = $user->is_code_cust_id;
        $query      = JobList::query()
            ->where('dealer_code', $dealerCode)
            ->where('status', 'pending')
            ->whereNull('group_job');

        if ($request->searchSku) {
            $query->where('pid', 'like', "%{$request->searchSku}%");
        }
        if ($request->searchSn) {
            $query->where('serial_id', 'like', "%{$request->searchSn}%");
        }

        $jobs = $query->orderBy('id', 'desc')->get();

        $completeIds = $this->getFormCompleteJobIds($jobs->pluck('job_id')->toArray());
        $jobs = $jobs->map(function ($job) use ($completeIds) {
            $job->before_form_complete = in_array($job->job_id, $completeIds);
            return $job;
        });

        return Inertia::render('DealerRepair/SendJob/DealerSendJobList', [
            'jobs' => $jobs,
        ]);
    }

    public function updateJobSelect(Request $request): RedirectResponse
    {
        $selected = $request->selectedJobs;

        try {
            if (empty($selected)) {
                throw new \Exception('ไม่มีจ็อบที่ต้องการส่ง');
            }

            $selectedJobIds  = array_column($selected, 'job_id');
            $completeJobIds  = $this->getFormCompleteJobIds($selectedJobIds);
            $incompleteJobIds = array_diff($selectedJobIds, $completeJobIds);

            if (!empty($incompleteJobIds)) {
                throw new \Exception(
                    'กรุณาบันทึกข้อมูลแจ้งซ่อม (ข้อมูลลูกค้า + อาการ + รูปภาพ) ก่อนส่งซ่อม: ' .
                    implode(', ', $incompleteJobIds)
                );
            }

            [$dealerCodes, $isSale] = $this->getAuthorizedDealerCodes();

            DB::beginTransaction();

            $group_job  = time() . rand(1000, 9999);
            $now        = Carbon::now();
            $jobIds     = array_column($selected, 'job_id');

            $allowedJobs = JobList::whereIn('job_id', $jobIds)
                ->whereIn('dealer_code', $dealerCodes)
                ->get(['job_id', 'serial_id', 'dealer_code']);

            if ($isSale && $allowedJobs->pluck('dealer_code')->unique()->count() > 1) {
                throw new \Exception('ไม่สามารถส่งซ่อมข้ามร้านค้าได้ กรุณาเลือก Job ของร้านค้าเดียวกัน');
            }

            $allowedIds = $allowedJobs->pluck('job_id')->toArray();

            if (empty($allowedIds)) {
                throw new \Exception('ไม่มีจ็อบที่มีสิทธิ์ส่ง');
            }

            JobList::whereIn('job_id', $allowedIds)->update([
                'status'     => 'send',
                'group_job'  => $group_job,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::commit();

            // แจ้ง Lark ของ sale แยกตาม dealer_code
            try {
                $authResp = Http::post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', [
                    'app_id'     => env('VITE_LARK_APP_ID'),
                    'app_secret' => env('VITE_LARK_APP_SECRET'),
                ]);
                $larkToken = $authResp->successful() ? $authResp->json()['tenant_access_token'] : null;

                $jobsByDealer = $allowedJobs->groupBy('dealer_code');

                foreach ($jobsByDealer as $dc => $dealerJobs) {
                    $larkInfo = StoreInformation::query()
                        ->leftJoin('sale_information', 'sale_information.sale_code', '=', 'store_information.sale_id')
                        ->where('store_information.is_code_cust_id', $dc)
                        ->select('store_information.shop_name', 'sale_information.lark_token', 'store_information.is_code_cust_id')
                        ->first();

                    if (!$larkInfo || empty($larkInfo->lark_token) || !$larkToken) continue;

                    $jobCount = $dealerJobs->count();
                    $jobLines = $dealerJobs->map(fn($j) => "job_id: {$j->job_id}  serial: {$j->serial_id}")->implode("\n");
                    $pdfUrl   = route('dom-pdf.index', $group_job);
                    $text     = "ร้านค้าส่งซ่อม PK\n"
                        . "ร้าน : {$larkInfo->shop_name}\n"
                        . "รหัสร้าน: {$larkInfo->is_code_cust_id}\n"
                        . "เลขกลุ่มงาน : {$group_job}\n"
                        . "จำนวน : {$jobCount} รายการ\n"
                        . "รหัส Job และ Serial :\n{$jobLines}\n"
                        . "ใบรายงานส่ง : {$pdfUrl}";

                    Http::withHeaders(['Authorization' => 'Bearer ' . $larkToken])
                        ->post('https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id', [
                            'receive_id' => $larkInfo->lark_token,
                            'msg_type'   => 'text',
                            'content'    => json_encode(['text' => $text], JSON_UNESCAPED_UNICODE),
                        ]);
                }
            } catch (\Exception $larkException) {
                Log::error("Lark Notify SendJob Exception - " . $larkException->getMessage());
            }

            return redirect()->route('dealerRepair.send.doc')->with('success', 'ส่งไปยัง PK สำเร็จ');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('dealerRepair.send.list')->with('error', $e->getMessage());
        }
    }

    public function docJobList(): Response
    {
        [$dealerCodes, $isSale] = $this->getAuthorizedDealerCodes();

        if ($isSale) {
            $groups = JobList::query()
                ->leftJoin('store_information as si', 'si.is_code_cust_id', '=', 'job_lists.dealer_code')
                ->whereIn('job_lists.dealer_code', $dealerCodes)
                ->where('job_lists.status', 'send')
                ->select('job_lists.print_at', 'job_lists.group_job', 'job_lists.print_updated_at',
                    'job_lists.counter_print', 'job_lists.created_at',
                    'job_lists.dealer_code', 'si.shop_name as dealer_shop_name')
                ->groupBy('job_lists.group_job', 'job_lists.print_at', 'job_lists.print_updated_at',
                    'job_lists.counter_print', 'job_lists.created_at',
                    'job_lists.dealer_code', 'si.shop_name')
                ->orderBy('job_lists.created_at', 'desc')
                ->get();
        } else {
            $groups = JobList::query()
                ->whereIn('dealer_code', $dealerCodes)
                ->where('status', 'send')
                ->select('print_at', 'group_job', 'print_updated_at', 'counter_print', 'created_at')
                ->groupBy('group_job', 'print_at', 'print_updated_at', 'counter_print', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('DealerRepair/SendJob/DealerDocSendJob', [
            'groups'  => $groups,
            'is_sale' => $isSale,
        ]);
    }

    public function groupDetail(string $job_group): JsonResponse
    {
        try {
            [$dealerCodes] = $this->getAuthorizedDealerCodes();

            $result = JobList::query()
                ->where('group_job', $job_group)
                ->whereIn('dealer_code', $dealerCodes)
                ->select('serial_id', 'job_id', 'pid', 'p_name', 'updated_at', 'status', 'ticket_code')
                ->get();

            return response()->json(['message' => 'success', 'group' => $result]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'group' => []], 400);
        }
    }

    public function trackPage(): Response
    {
        return Inertia::render('DealerRepair/SendJob/DealerSuccessSendJobs', [
            'is_sale' => Auth::user()->role === 'sale',
        ]);
    }

    public function getAllSendJobs(Request $request): JsonResponse
    {
        try {
            [$dealerCodes, $isSale] = $this->getAuthorizedDealerCodes();

            $query = JobList::query()
                ->when($isSale, fn($q) => $q->leftJoin('store_information as si', 'si.is_code_cust_id', '=', 'job_lists.dealer_code'))
                ->whereIn('job_lists.dealer_code', $dealerCodes)
                ->whereIn('job_lists.status', ['send', 'pending'])
                ->whereNotNull('job_lists.group_job')
                ->where('job_lists.group_job', '!=', '');

            if ($request->filled('group_job')) {
                $query->where('job_lists.group_job', 'like', '%' . $request->input('group_job') . '%');
            }
            if ($request->filled('job_id')) {
                $query->where('job_lists.job_id', 'like', '%' . $request->input('job_id') . '%');
            }
            if ($request->filled('serial_id')) {
                $query->where('job_lists.serial_id', 'like', '%' . $request->input('serial_id') . '%');
            }
            if ($request->filled('pid')) {
                $query->where('job_lists.pid', 'like', '%' . $request->input('pid') . '%');
            }
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('job_lists.created_at', [$request->input('start_date'), $request->input('end_date')]);
            }
            if ($request->filled('status')) {
                $query->where('job_lists.status', $request->input('status'));
            }

            $select = $isSale
                ? ['job_lists.*', 'si.shop_name as dealer_shop_name']
                : ['job_lists.*'];

            $jobs = $query->select($select)->orderBy('job_lists.created_at', 'asc')->get();

            return response()->json(['message' => 'success', 'jobs' => $jobs]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'jobs' => []], 500);
        }
    }

    public function historySuccessJobs(Request $request): JsonResponse
    {
        try {
            [$dealerCodes, $isSale] = $this->getAuthorizedDealerCodes();

            $query = JobList::query()
                ->when($isSale, fn($q) => $q->leftJoin('store_information as si', 'si.is_code_cust_id', '=', 'job_lists.dealer_code'))
                ->whereIn('job_lists.dealer_code', $dealerCodes)
                ->where('job_lists.status', 'success')
                ->whereNotNull('job_lists.group_job');

            if ($request->filled('group_job')) {
                $query->where('job_lists.group_job', 'like', '%' . $request->input('group_job') . '%');
            }
            if ($request->filled('job_id')) {
                $query->where('job_lists.job_id', 'like', '%' . $request->input('job_id') . '%');
            }
            if ($request->filled('serial_id')) {
                $query->where('job_lists.serial_id', 'like', '%' . $request->input('serial_id') . '%');
            }
            if ($request->filled('pid')) {
                $query->where('job_lists.pid', 'like', '%' . $request->input('pid') . '%');
            }
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('job_lists.updated_at', [$request->input('start_date'), $request->input('end_date') . ' 23:59:59']);
            }

            $select = $isSale
                ? ['job_lists.*', 'si.shop_name as dealer_shop_name']
                : ['job_lists.*'];

            $jobs = $query->select($select)->orderBy('job_lists.updated_at', 'desc')->get();

            return response()->json(['message' => 'success', 'jobs' => $jobs]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'jobs' => []], 500);
        }
    }

    public function finishSendJob(Request $request): JsonResponse
    {
        $jobsToFinish = $request->input('jobs_to_finish');

        if (empty($jobsToFinish) || !is_array($jobsToFinish)) {
            return response()->json(['message' => 'ไม่มี Job ID ที่เลือก'], 400);
        }

        [$dealerCodes] = $this->getAuthorizedDealerCodes();
        $jobIds        = array_column($jobsToFinish, 'job_id');

        try {
            DB::beginTransaction();
            $now = Carbon::now();

            $updated = JobList::whereIn('job_id', $jobIds)
                ->whereIn('dealer_code', $dealerCodes)
                ->whereIn('status', ['send', 'pending'])
                ->update([
                    'status'       => 'success',
                    'close_job_at' => $now,
                    'close_job_by' => Auth::user()->user_code,
                    'updated_at'   => $now,
                ]);

            if ($updated > 0) {
                DB::commit();
                return response()->json(['message' => "ปิดงานสำเร็จ {$updated} รายการ", 'success' => true]);
            }

            DB::rollBack();
            return response()->json(['message' => 'ไม่พบรายการที่สามารถปิดได้', 'success' => false], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage(), 'success' => false], 500);
        }
    }

    public function checkJobStatus(Request $request): JsonResponse
    {
        $jobId         = $request->input('job_id');
        [$dealerCodes] = $this->getAuthorizedDealerCodes();

        if (empty($jobId)) {
            return response()->json(['message' => 'กรุณากรอก Job ID', 'status' => false], 400);
        }

        try {
            $job = JobList::where('job_id', $jobId)
                ->whereIn('dealer_code', $dealerCodes)
                ->first();

            if (!$job) {
                throw new \Exception("ไม่พบข้อมูล Job ID นี้ในระบบ");
            }

            $ticketCode = $job->ticket_code ?: $jobId;

            $response = Http::timeout(10)->post('http://192.168.9.13:1000/laststatus', [
                'ticketcode' => $ticketCode,
            ]);

            if (!$response->successful()) {
                throw new \Exception("API ภายนอกล้มเหลว (HTTP {$response->status()})");
            }

            $json = $response->json();
            if (!$json || !is_array($json)) {
                throw new \Exception("API ตอบกลับมาในรูปแบบที่ไม่ใช่ JSON");
            }

            $externalStatus = $json['status']  ?? null;
            $assQu          = $json['linequ']  ?? null;

            if (!$externalStatus) {
                throw new \Exception("ไม่ได้รับสถานะที่ถูกต้อง");
            }

            $mappedStatus = $this->mapApiStatus($externalStatus);
            $now          = Carbon::now();
            $updateData   = [
                'ass_status' => $externalStatus,
                'ass_qu'     => $assQu,
                'updated_at' => $now,
            ];

            if ($mappedStatus === 'success') {
                $updateData['status']       = 'success';
                $updateData['close_job_at'] = $now;
                $updateData['close_job_by'] = 'API';
            } elseif ($mappedStatus === 'canceled') {
                $updateData['status'] = 'canceled';
            }

            DB::beginTransaction();
            JobList::where('job_id', $jobId)->update($updateData);
            DB::commit();

            return response()->json([
                'status'      => 'success',
                'api_status'  => $mappedStatus,
                'ass_status'  => $externalStatus,
                'ass_qu'      => $assQu,
                'ticket_code' => $ticketCode,
                'message'     => 'ดึงสถานะสำเร็จ',
            ]);
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) DB::rollBack();
            Log::error('DealerSendJob checkJobStatus: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'เช็คสถานะล้มเหลว: ' . $e->getMessage()], 400);
        }
    }

    public function batchCheckJobStatus(Request $request): JsonResponse
    {
        $jobIds        = $request->input('job_ids', []);
        [$dealerCodes] = $this->getAuthorizedDealerCodes();

        if (empty($jobIds) || !is_array($jobIds)) {
            return response()->json(['message' => 'ไม่มี Job ID ที่ต้องการเช็คสถานะ'], 400);
        }

        $jobIds = array_slice($jobIds, 0, 50);
        $jobIds = JobList::whereIn('job_id', $jobIds)
            ->whereIn('dealer_code', $dealerCodes)
            ->pluck('job_id')
            ->toArray();

        $total   = count($jobIds);
        $updated = 0;
        $failed  = 0;

        $jobRecords = JobList::whereIn('job_id', $jobIds)
            ->whereIn('dealer_code', $dealerCodes)
            ->get(['job_id', 'ticket_code'])
            ->keyBy('job_id');

        foreach ($jobIds as $jobId) {
            try {
                $ticketCode = $jobRecords[$jobId]->ticket_code ?? $jobId;

                $response = Http::timeout(10)->post('http://192.168.9.13:1000/laststatus', [
                    'ticketcode' => $ticketCode,
                ]);

                if (!$response->successful()) { $failed++; continue; }

                $json = $response->json();
                if (!$json || !is_array($json)) { $failed++; continue; }

                $externalStatus = $json['status'] ?? null;
                $assQu          = $json['linequ'] ?? null;
                if (empty($externalStatus)) { $failed++; continue; }

                $mappedStatus = $this->mapApiStatus($externalStatus);
                $now          = Carbon::now();
                $updateData   = [
                    'ass_status' => $externalStatus,
                    'ass_qu'     => $assQu,
                    'updated_at' => $now,
                ];

                if ($mappedStatus === 'success') {
                    $updateData['status']       = 'success';
                    $updateData['close_job_at'] = $now;
                    $updateData['close_job_by'] = 'API';
                } elseif ($mappedStatus === 'canceled') {
                    $updateData['status'] = 'canceled';
                }

                JobList::where('job_id', $jobId)->update($updateData);
                $updated++;
            } catch (\Exception $e) {
                $failed++;
            }
            usleep(100_000);
        }

        $msg = "เช็คสถานะสำเร็จ {$updated}/{$total} รายการ";
        if ($failed > 0) $msg .= " (ไม่สำเร็จ {$failed} รายการ)";

        return response()->json(['message' => $msg, 'updated' => $updated, 'failed' => $failed, 'total' => $total]);
    }

    private function getAuthorizedDealerCodes(): array
    {
        $user   = Auth::user();
        $isSale = $user->role === 'sale';

        $dealerCodes = $isSale
            ? $this->fetchCustIds($user->user_code)
            : [$user->is_code_cust_id];

        return [$dealerCodes, $isSale];
    }

    private function mapApiStatus(string $apiStatus): string
    {
        if (in_array($apiStatus, ['ไม่พบข้อมูล', 'send'], true)) return 'send';
        if (in_array($apiStatus, ['canceled', 'ยกเลิกคำสั่งซื้อ', 'ยกเลิก'], true)) return 'canceled';
        if (in_array($apiStatus, ['บัญชีรับงานแล้ว', 'ส่งของแล้ว', 'จัดส่งสำเร็จ', 'ส่งสำเร็จ', 'จบงาน', 'ซ่อมเสร็จ'], true)) return 'success';
        // สถานะ in-progress จาก laststatus API (ยังไม่จบงาน)
        if (in_array($apiStatus, ['รอรับงานซ่อม', 'รับงานซ่อมแล้ว', 'อยู่ระหว่างซ่อม', 'รอตรวจสอบ', 'รอชิ้นส่วน'], true)) return 'send';
        return 'send';
    }
}
