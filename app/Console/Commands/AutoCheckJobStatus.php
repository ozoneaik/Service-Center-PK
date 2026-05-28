<?php

namespace App\Console\Commands;

use App\Models\JobList;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoCheckJobStatus extends Command
{
    protected $signature = 'job:check-status';
    protected $description = 'Auto check job status from PK external API (runs every 30 min)';

    /**
     * สถานะที่ยังต้องติดตามกับ PK API
     * send    = ส่งซ่อมไปแล้ว แต่ PK ยังไม่รับ
     * pending = PK รับแล้ว กำลังดำเนินการ / รอส่งคืน
     */
    private const ACTIVE_STATUSES = [
        'send',
        'pending',
    ];

    private const API_URL     = 'https://afterservice-sv.pumpkin.tools/sv/callpsc.php';
    private const API_TIMEOUT = 10; // seconds
    private const SLEEP_US    = 200_000; // 200ms ระหว่าง request

    public function handle(): void
    {
        if (!config('cron.auto_check_enabled', true)) {
            $this->info('⏸ AutoCheckJobStatus is disabled (CRON_AUTO_CHECK_ENABLED=false).');
            Log::info('CronJob [job:check-status]: Skipped — disabled via CRON_AUTO_CHECK_ENABLED.');
            return;
        }

        $this->info('🚀 Starting Auto Check Job Status...');
        Log::info('CronJob [job:check-status]: Start');

        $jobs = JobList::whereIn('status', self::ACTIVE_STATUSES)
            ->whereNotNull('group_job')
            ->get(['job_id', 'status', 'ticket_code', 'ass_status']);

        $total = $jobs->count();

        if ($total === 0) {
            $this->info('✅ No active jobs to check.');
            Log::info('CronJob [job:check-status]: No active jobs. Done.');
            return;
        }

        $this->info("📦 Found {$total} jobs to check.");
        $updated = 0;
        $failed  = 0;

        foreach ($jobs as $job) {
            try {
                $response = Http::timeout(self::API_TIMEOUT)
                    ->post(self::API_URL, ['ticketcode' => $job->job_id]);

                if (!$response->successful()) {
                    $failed++;
                    Log::warning("CronJob [job:check-status]: HTTP {$response->status()} for job_id={$job->job_id}");
                    continue;
                }

                $json = $response->json();

                if (!$json || !is_array($json)) {
                    $failed++;
                    continue;
                }

                $externalStatus = $json['status'] ?? null;
                $assNo          = $json['assno']  ?? null;

                if (empty($externalStatus)) {
                    $failed++;
                    continue;
                }

                $newStatus  = $this->resolveStatus($externalStatus);
                $cronNow    = now();
                $updateData = ['updated_at' => $cronNow];

                if ($newStatus !== $job->status) {
                    $updateData['status'] = $newStatus;

                    // ถ้า PK ส่งคืนแล้ว → บันทึกว่าปิดโดย Cron อัตโนมัติ
                    if ($newStatus === 'success') {
                        $updateData['close_job_at'] = $cronNow;
                        $updateData['close_job_by'] = 'CRON';
                    }
                }

                if ($assNo && $assNo !== $job->ticket_code) {
                    $updateData['ticket_code'] = $assNo;
                }

                if ($externalStatus !== $job->ass_status) {
                    $updateData['ass_status'] = $externalStatus;
                }

                // อัปเดตเฉพาะเมื่อมีการเปลี่ยนแปลง
                if (isset($updateData['status']) || isset($updateData['ticket_code']) || isset($updateData['ass_status'])) {
                    JobList::where('job_id', $job->job_id)->update($updateData);
                    $updated++;
                    Log::info("CronJob [job:check-status]: Updated {$job->job_id} → {$newStatus}" . ($assNo ? " (assno={$assNo})" : ''));
                }

            } catch (\Exception $e) {
                $failed++;
                Log::error("CronJob [job:check-status]: Exception on job_id={$job->job_id}: " . $e->getMessage());
            }

            usleep(self::SLEEP_US);
        }

        $summary = "Updated {$updated}/{$total} | Failed: {$failed}";
        $this->info("✅ Finished. {$summary}");
        Log::info("CronJob [job:check-status]: Done. {$summary}");
    }

    /**
     * Map สถานะจาก PK API → internal status (เหมือนกับ mapApiStatus ใน Controller)
     *
     * send     = PK ยังไม่รับ / ไม่พบในระบบ PK
     * pending  = PK รับแล้ว กำลังดำเนินการ / ยังไม่ส่งคืน
     * success  = PK ส่งคืนเสร็จแล้ว (ปิดอัตโนมัติ)
     * canceled = ยกเลิก
     */
    private function resolveStatus(string $externalStatus): string
    {
        // PK ยังไม่รับ → send
        if (in_array($externalStatus, ['ไม่พบข้อมูล', 'send'], true)) {
            return 'send';
        }

        // PK ยกเลิก → canceled
        if (in_array($externalStatus, ['canceled', 'ยกเลิกคำสั่งซื้อ', 'ยกเลิก'], true)) {
            return 'canceled';
        }

        // PK ส่งคืนเสร็จแล้ว → success (ปิดอัตโนมัติ ไม่ต้อง manual)
        if (in_array($externalStatus, [
            'บัญชีรับงานแล้ว', 'ส่งของแล้ว',
            'จัดส่งสำเร็จ', 'ส่งสำเร็จ', 'จบงาน',
        ], true)) {
            return 'success';
        }

        // PK กำลังดำเนินการ / ยังไม่ส่งคืน → pending
        if (in_array($externalStatus, [
            'เปิดออเดอร์แล้ว', 'รอเปิดSO',  'พร้อมส่ง',
            'แพ็คสินค้าเสร็จ', 'กำลังจัดสินค้า', 'กำลังส่ง',
            'เตรียมส่ง',       'รอปิดงานซ่อม',  'กำลังซ่อม',
            'พักงานซ่อม',      'รอรับงานซ่อม',   'pending',
        ], true)) {
            return 'pending';
        }

        // กรณีอื่นๆ ที่ไม่รู้จัก → pending (safe fallback) + log เพื่อติดตาม
        Log::warning('CronJob [job:check-status]: unknown status from PK API', [
            'external_status' => $externalStatus,
        ]);
        return 'pending';
    }
}
