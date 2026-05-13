<?php

namespace App\Console\Commands;

use App\Models\Claim;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoCheckClaimStatus extends Command
{
    protected $signature = 'claim:check-status';
    protected $description = 'Auto check spare claim status from external API';

    private const FINAL_STATUSES = [
        'จัดส่งสำเร็จ',
        'บัญชีรับงานแล้ว',
        'ส่งของแล้ว',
        'rejected',
    ];

    private const API_URL = 'https://afterservice-sv.pumpkin.tools/sv/callpsc.php';

    public function handle(): void
    {
        $this->info('Starting Auto Check Claim Status...');
        Log::info('CronJob [claim:check-status]: Start');

        $claims = Claim::whereNotIn('status', self::FINAL_STATUSES)->get();
        $total = $claims->count();

        if ($total === 0) {
            $this->info('No pending claims to check.');
            Log::info('CronJob [claim:check-status]: No pending claims.');
            return;
        }

        $this->info("Found {$total} claims to check.");
        $updated = 0;

        foreach ($claims as $claim) {
            try {
                $response = Http::post(self::API_URL, [
                    'ticketcode' => $claim->claim_id,
                ]);

                if (!$response->successful()) {
                    continue;
                }

                $externalStatus = $response->json('status');

                if (empty($externalStatus)) {
                    continue;
                }

                $newStatus = $this->resolveStatus($externalStatus);

                if ($newStatus === $claim->status) {
                    continue;
                }

                DB::table('claims')
                    ->where('claim_id', $claim->claim_id)
                    ->update(['status' => $newStatus, 'updated_at' => now()]);

                $updated++;
                Log::info("CronJob [claim:check-status]: Updated {$claim->claim_id} → {$newStatus}");

            } catch (\Exception $e) {
                Log::error("CronJob [claim:check-status]: Error on {$claim->claim_id}: " . $e->getMessage());
            }

            usleep(200000); // 0.2 วินาที ป้องกัน API ล่ม
        }

        $this->info("Finished. Updated {$updated}/{$total} claims.");
        Log::info("CronJob [claim:check-status]: Finished. Updated {$updated}/{$total}");
    }

    private function resolveStatus(string $externalStatus): string
    {
        if (in_array($externalStatus, ['เปิดออเดอร์แล้ว', 'รอเปิดSO'])) {
            return 'approved';
        }

        if ($externalStatus === 'ไม่พบข้อมูล') {
            return 'pending';
        }

        return $externalStatus;
    }
}
