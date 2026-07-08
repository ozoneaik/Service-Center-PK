<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait FetchesPkApi
{
    private function fetchCustIds(string $saleCode): array
    {
        $token    = $this->getPkApiToken();
        $response = Http::withToken($token)
            ->asJson()
            ->withoutVerifying()
            ->timeout(15)
            ->post(config('services.pk_api.base_url') . '/getCustInSales', [
                'sale_code' => $saleCode,
            ]);

        if ($response->status() === 404 || $response->status() === 204) {
            return [];
        }

        if (!$response->successful()) {
            throw new \Exception('ดึงข้อมูลร้านค้าจาก PK API ไม่สำเร็จ (HTTP ' . $response->status() . ')');
        }

        $data = $response->json('data') ?? [];
        return array_column($data, 'cust_id');
    }

    private function getPkApiToken(): string
    {
        return Cache::remember('pk_api_access_token', 3500, function () {
            $response = Http::asJson()
                ->withoutVerifying()
                ->timeout(10)
                ->post(config('services.pk_api.base_url') . '/auth/login', [
                    'username' => config('services.pk_api.username'),
                    'password' => config('services.pk_api.password'),
                ]);

            if (!$response->successful()) {
                Log::error('PK API login failed: status=' . $response->status() . ' body=' . $response->body());
                throw new \Exception('Login PK API ไม่สำเร็จ (HTTP ' . $response->status() . ')');
            }

            $token = $response->json('access_token');
            if (empty($token)) {
                throw new \Exception('ไม่ได้รับ access_token จาก PK API');
            }

            return $token;
        });
    }
}
