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

    /** สถานะที่ไม่ต้องเช็คแล้ว (Final) */
    private const FINAL_STATUSES = [
        'success',
        'canceled',
        'pending',
    ];

    /** สถานะที่ยังต้องติดตาม (Active) */
    private const ACTIVE_STATUSES = [
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
        'รอรับงานซ่อม',
    ];

    private const API_URL     = 'https://afterservice-sv.pumpkin.tools/sv/callpsc.php';
    private const API_TIMEOUT = 10; // seconds
    private const SLEEP_US    = 200_000; // 200ms ระหว่าง request

    public function handle(): void
    {
        $this->info('🚀 Starting Auto Check Job Status...');
        Log::info('CronJob [job:check-status]: Start');

        $jobs = JobList::whereIn('status', self::ACTIVE_STATUSES)
            ->whereNotNull('group_job')
            ->get(['job_id', 'status', 'ticket_code']);

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
                $updateData = ['updated_at' => now()];

                if ($newStatus !== $job->status) {
                    $updateData['status'] = $newStatus;
                }

                if ($assNo && $assNo !== $job->ticket_code) {
                    $updateData['ticket_code'] = $assNo;
                }

                // อัปเดตเฉพาะเมื่อมีการเปลี่ยนแปลง
                if (isset($updateData['status']) || isset($updateData['ticket_code'])) {
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
     * แปลงสถานะจาก API ให้ตรงกับ internal status
     */
    private function resolveStatus(string $externalStatus): string
    {
        // ถ้า API บอกว่าไม่พบ → ถือว่ายังอยู่ในสถานะ send
        if ($externalStatus === 'ไม่พบข้อมูล') {
            return 'send';
        }

        return $externalStatus;
    }
}
