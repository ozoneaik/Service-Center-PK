<?php

namespace App\Console\Commands;

use App\Models\JobList;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoCloseSuccessJob extends Command
{
    protected $signature = 'job:auto-close {--days=3 : จำนวนวันที่ค้างในสถานะก่อนจะปิดอัตโนมัติ}';
    protected $description = 'Auto close jobs that stuck in "บัญชีรับงานแล้ว / ส่งของแล้ว" for more than N days (default 3 days)';

    /** สถานะที่ถือว่า "PK รับงานและส่งกลับแล้ว" → รอให้ system ปิด */
    private const CLOSE_TARGET_STATUSES = [
        'บัญชีรับงานแล้ว',
        'ส่งของแล้ว',
    ];

    private const CLOSE_BY_SYSTEM = 'SYSTEM';

    public function handle(): void
    {
        $days = (int) $this->option('days');
        $cutoff = Carbon::now()->subDays($days);

        $this->info("🚀 Starting Auto Close Jobs (threshold: {$days} days, cutoff: {$cutoff})...");
        Log::info("CronJob [job:auto-close]: Start — threshold={$days} days, cutoff={$cutoff}");

        // หางานที่:
        // 1. status IN ('บัญชีรับงานแล้ว', 'ส่งของแล้ว')  → PK รับและส่งคืนแล้ว รอปิด
        // 2. group_job IS NOT NULL                          → เป็น send-job จริงๆ
        // 3. updated_at <= 3 วันที่แล้ว                    → ค้างนานเกินกำหนด
        $jobs = JobList::query()
            ->whereIn('status', self::CLOSE_TARGET_STATUSES)
            ->whereNotNull('group_job')
            ->where('updated_at', '<=', $cutoff)
            ->get(['job_id', 'status', 'updated_at']);

        $total = $jobs->count();

        if ($total === 0) {
            $this->info('✅ No jobs to auto-close.');
            Log::info('CronJob [job:auto-close]: No jobs to auto-close. Done.');
            return;
        }

        $this->info("📦 Found {$total} jobs to auto-close.");

        $closed = 0;
        $failed = 0;
        $now    = Carbon::now();

        foreach ($jobs as $job) {
            try {
                DB::beginTransaction();

                JobList::where('job_id', $job->job_id)->update([
                    'status'       => 'success',
                    'close_job_at' => $now,
                    'close_job_by' => self::CLOSE_BY_SYSTEM,
                    'updated_at'   => $now,
                ]);

                DB::commit();
                $closed++;

                Log::info(
                    "CronJob [job:auto-close]: Closed job_id={$job->job_id}"
                    . " status={$job->status} updated_at={$job->updated_at}"
                );

            } catch (\Exception $e) {
                DB::rollBack();
                $failed++;
                Log::error("CronJob [job:auto-close]: Failed job_id={$job->job_id}: " . $e->getMessage());
            }
        }

        $summary = "Closed {$closed}/{$total} | Failed: {$failed}";
        $this->info("✅ Finished. {$summary}");
        Log::info("CronJob [job:auto-close]: Done. {$summary}");
    }
}
