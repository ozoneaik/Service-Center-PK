<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoCheckOrderStatus extends Command
{
    protected $signature = 'order:check-status';
    protected $description = 'Auto check order status from external API';

    private const FINAL_STATUSES = [
        'จัดส่งสำเร็จ',
        'บัญชีรับงานแล้ว',
        'ส่งของแล้ว',
        'canceled',
        'completed',
        'rejected',
    ];

    private const API_URL = 'https://afterservice-sv.pumpkin.tools/sv/callpsc.php';

    public function handle(): void
    {
        $this->info('Starting Auto Check Order Status...');
        Log::info('CronJob [order:check-status]: Start');

        $orders = Order::whereNotIn('status', self::FINAL_STATUSES)->get();
        $total = $orders->count();

        if ($total === 0) {
            $this->info('No pending orders to check.');
            Log::info('CronJob [order:check-status]: No pending orders.');
            return;
        }

        $this->info("Found {$total} orders to check.");
        $updated = 0;

        foreach ($orders as $order) {
            try {
                $response = Http::post(self::API_URL, [
                    'ticketcode' => $order->order_id,
                ]);

                if (!$response->successful()) {
                    continue;
                }

                $externalStatus = $response->json('status');

                if (empty($externalStatus)) {
                    continue;
                }

                $newStatus = $this->resolveStatus($externalStatus);

                if ($newStatus === $order->status) {
                    continue;
                }

                DB::table('orders')
                    ->where('order_id', $order->order_id)
                    ->update(['status' => $newStatus, 'updated_at' => now()]);

                $updated++;
                Log::info("CronJob [order:check-status]: Updated {$order->order_id} → {$newStatus}");

            } catch (\Exception $e) {
                Log::error("CronJob [order:check-status]: Error on {$order->order_id}: " . $e->getMessage());
            }

            usleep(200000);
        }

        $this->info("Finished. Updated {$updated}/{$total} orders.");
        Log::info("CronJob [order:check-status]: Finished. Updated {$updated}/{$total}");
    }

    private function resolveStatus(string $externalStatus): string
    {
        if ($externalStatus === 'ไม่พบข้อมูล') {
            return 'pending';
        }

        return $externalStatus;
    }
}
