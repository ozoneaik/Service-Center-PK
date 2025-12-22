<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\JobList;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoCheckStartUpCost extends Command
{
    /**
     * ชื่อคำสั่งที่จะใช้เรียก (เช่น php artisan stuc:check-status)
     */
    protected $signature = 'stuc:check-status';

    /**
     * คำอธิบายคำสั่ง
     */
    protected $description = 'Auto check CN status and Payment status from external API';

    public function handle()
    {
        $this->info('Starting Auto Check StartUp Cost Status...');
        Log::info('CronJob: Start checking StartUp Cost Status...');

        $apiUrl = env('API_CHECK_CN_URL');
        $apiKey = env('API_KEY_CKECK_CN');

        // 1. ดึงรายการที่ต้องเช็ค
        // เงื่อนไข: สถานะเป็น Y (ยังไม่ตัดจ่าย) และมีเลข CT แล้ว (stuc_doc_no)
        $jobs = JobList::where('stuc_status', 'Y')
            ->whereNotNull('stuc_doc_no')
            ->get();

        $count = $jobs->count();
        $this->info("Found {$count} jobs to check.");

        if ($count === 0) {
            return;
        }

        // 2. วนลูปเช็คทีละรายการ
        foreach ($jobs as $job) {
            $doc_no = $job->stuc_doc_no;
            $shop_code = $job->is_code_key;

            try {
                $response = Http::withHeaders([
                    'X-Api-Key' => $apiKey
                ])->get($apiUrl, [
                    'ct' => $doc_no,
                    'cust_code' => $shop_code
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    if (isset($data['exists']) && $data['exists'] === true) {
                        $cn_no = $data['data']['cn_no'] ?? null;
                        $rema_amnt = $data['data']['rema_amnt'] ?? null;

                        // เตรียมข้อมูลอัปเดต
                        $updateData = ['updated_at' => now()];
                        $shouldUpdate = false;
                        $logMsg = "Job {$job->job_id} ($doc_no): ";

                        // เช็คเลข CN
                        if ($cn_no && $job->cn_doc !== $cn_no) {
                            $updateData['cn_doc'] = $cn_no;
                            $shouldUpdate = true;
                            $logMsg .= "Updated CN to $cn_no. ";
                        }

                        // เช็คยอดเงินตัดจ่าย (เปลี่ยนสถานะเป็น P)
                        if (!is_null($rema_amnt) && floatval($rema_amnt) == 0) {
                            $updateData['stuc_status'] = 'P';
                            $shouldUpdate = true;
                            $logMsg .= "Updated Status to P (Paid). ";
                        }

                        if ($shouldUpdate) {
                            JobList::where('id', $job->id)->update($updateData);
                            $this->info($logMsg);
                            Log::info("CronJob: " . $logMsg);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error("CronJob Error on Job {$job->job_id}: " . $e->getMessage());
                $this->error("Error on {$job->job_id}");
            }

            usleep(200000); // 0.2 วินาที
        }

        $this->info('Auto Check Finished.');
        Log::info('CronJob: Finished checking.');
    }
}
