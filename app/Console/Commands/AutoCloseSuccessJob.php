<?php

namespace App\Console\Commands;

use App\Models\JobList;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoCloseSuccessJob extends Command
{
    protected $signature = 'job:auto-close {--days=3 : จำนวนวันที่ค้างในสถานะ pending ก่อนจะเช็ค API และปิดอัตโนมัติ}';
    protected $description = 'Auto close jobs stuck in "pending" for N+ days — verifies with PK API before closing';

    private const CLOSE_BY_SYSTEM = 'SYSTEM';
    private const API_URL         = 'https://afterservice-sv.pumpkin.tools/sv/callpsc.php';
    private const API_TIMEOUT     = 10;
    private const SLEEP_US        = 200_000; // 200ms ระหว่าง request

    /**
     * สถานะจาก PK API ที่ถือว่า "ส่งคืนเสร็จแล้ว" → ปิดงานได้
     * (PK ส่งของกลับ หรือบัญชีรับงานแล้ว)
     */
    private const CLOSEABLE_API_STATUSES = [
        'จัดส่งสำเร็จ',
        'ส่งสำเร็จ',
        'จบงาน',
        'ส่งของแล้ว',
        'บัญชีรับงานแล้ว',
    ];

    /**
     * สถานะจาก PK API ที่หมายความว่า "ยกเลิก"
     */
    private const CANCELED_API_STATUSES = [
        'canceled',
        'ยกเลิกคำสั่งซื้อ',
        'ยกเลิก',
    ];

    public function handle(): void
    {
        if (!config('cron.auto_close_enabled', true)) {
            $this->info('⏸ AutoCloseSuccessJob is disabled (CRON_AUTO_CLOSE_ENABLED=false).');
            Log::info('CronJob [job:auto-close]: Skipped — disabled via CRON_AUTO_CLOSE_ENABLED.');
            return;
        }

        $days   = (int) $this->option('days');
        $cutoff = Carbon::now()->subDays($days);

        $this->info("🚀 Starting Auto Close Jobs (pending > {$days} days, cutoff: {$cutoff})...");
        Log::info("CronJob [job:auto-close]: Start — days={$days}, cutoff={$cutoff}");

        /**
         * ดึงงานที่:
         * 1. status = 'pending'         → PK รับแล้ว กำลังดำเนินการ
         * 2. group_job IS NOT NULL      → มาจาก flow ส่งซ่อม PK จริงๆ
         * 3. updated_at <= N วันที่แล้ว → ค้างนานเกินไป ต้องเช็คใหม่
         */
        $jobs = JobList::query()
            ->where('status', 'pending')
            ->whereNotNull('group_job')
            ->where('updated_at', '<=', $cutoff)
            ->get(['job_id', 'status', 'updated_at', 'ass_status']);

        $total = $jobs->count();

        if ($total === 0) {
            $this->info('✅ No pending jobs to process.');
            Log::info('CronJob [job:auto-close]: No jobs found. Done.');
            return;
        }

        $this->info("📦 Found {$total} pending jobs — checking ass_status / PK API before closing...");

        $closed    = 0;
        $canceled  = 0;
        $skipped   = 0;
        $failed    = 0;
        $fromCache = 0;
        $now       = Carbon::now();

        foreach ($jobs as $job) {
            try {
                $apiStatus  = null;
                $assNo      = null;
                $usedCache  = false;

                // ── 1. เช็ค ass_status ก่อน (ถ้ามีสถานะ final อยู่แล้ว ไม่ต้องเรียก API) ──
                $cachedStatus = $job->ass_status ?? null;

                if (!empty($cachedStatus) && (
                    in_array($cachedStatus, self::CLOSEABLE_API_STATUSES, true) ||
                    in_array($cachedStatus, self::CANCELED_API_STATUSES, true)
                )) {
                    $apiStatus = $cachedStatus;
                    $usedCache = true;
                } else {
                    // ass_status ว่าง หรือยังไม่ final → เรียก API
                    $response = Http::timeout(self::API_TIMEOUT)
                        ->post(self::API_URL, ['ticketcode' => $job->job_id]);

                    if (!$response->successful()) {
                        $failed++;
                        Log::warning("CronJob [job:auto-close]: API HTTP {$response->status()} for job_id={$job->job_id} — skip");
                        usleep(self::SLEEP_US);
                        continue;
                    }

                    $json = $response->json();

                    if (!$json || !is_array($json)) {
                        $failed++;
                        usleep(self::SLEEP_US);
                        continue;
                    }

                    $apiStatus = $json['status'] ?? null;
                    $assNo     = $json['assno']  ?? null;

                    if (empty($apiStatus)) {
                        $failed++;
                        usleep(self::SLEEP_US);
                        continue;
                    }
                }

                // ── 2. ตัดสินใจจาก Status ────────────────────────────────
                $source = $usedCache ? 'cache' : 'api';

                if (in_array($apiStatus, self::CLOSEABLE_API_STATUSES, true)) {
                    // ✅ PK ส่งคืนเสร็จแล้ว → ปิดงาน
                    DB::beginTransaction();

                    $updateData = [
                        'status'       => 'success',
                        'ass_status'   => $apiStatus,
                        'close_job_at' => $now,
                        'close_job_by' => self::CLOSE_BY_SYSTEM,
                        'updated_at'   => $now,
                    ];
                    if ($assNo) {
                        $updateData['ticket_code'] = $assNo;
                    }

                    JobList::where('job_id', $job->job_id)->update($updateData);
                    DB::commit();

                    $closed++;
                    if ($usedCache) $fromCache++;
                    Log::info("CronJob [job:auto-close]: ✅ Closed job_id={$job->job_id} ({$source}={$apiStatus})");

                } elseif (in_array($apiStatus, self::CANCELED_API_STATUSES, true)) {
                    // ❌ PK ยกเลิก → อัปเดตเป็น canceled
                    DB::beginTransaction();
                    JobList::where('job_id', $job->job_id)->update([
                        'status'     => 'canceled',
                        'ass_status' => $apiStatus,
                        'updated_at' => $now,
                    ]);
                    DB::commit();

                    $canceled++;
                    if ($usedCache) $fromCache++;
                    Log::info("CronJob [job:auto-close]: ❌ Canceled job_id={$job->job_id} ({$source}={$apiStatus})");

                } else {
                    // 🔄 PK ยังดำเนินการอยู่ → ไม่ปิด แค่ update updated_at และ ass_status ใหม่
                    // (เฉพาะกรณีที่เพิ่งเรียก API — ถ้า cache ก็ไม่ต้องอัปเดต ass_status ซ้ำ)
                    $updateData = ['updated_at' => $now];
                    if (!$usedCache) {
                        $updateData['ass_status'] = $apiStatus;
                    }
                    JobList::where('job_id', $job->job_id)->update($updateData);

                    $skipped++;
                    Log::info("CronJob [job:auto-close]: 🔄 Skip job_id={$job->job_id} ({$source}={$apiStatus} — still in progress)");
                }

            } catch (\Exception $e) {
                if (DB::transactionLevel() > 0) {
                    DB::rollBack();
                }
                $failed++;
                Log::error("CronJob [job:auto-close]: Exception on job_id={$job->job_id}: " . $e->getMessage());
            }

            usleep(self::SLEEP_US);
        }

        $summary = "Total={$total} | Closed={$closed} | Canceled={$canceled} | StillInProgress={$skipped} | Failed={$failed} | FromCache={$fromCache}";
        $this->info("✅ Finished. {$summary}");
        Log::info("CronJob [job:auto-close]: Done. {$summary}");
    }
}
