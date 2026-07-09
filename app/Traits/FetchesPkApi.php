<?php

namespace App\Traits;

use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\StoreInformation;
use App\Models\Symptom;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait FetchesPkApi
{
    protected function getManagedDealerList(string $saleCode): Collection
    {
        $response = $this->callPkApi('/getCustInSales', ['sale_code' => $saleCode]);

        if (!$response->successful()) {
            Log::warning("getManagedDealerList: API ไม่สำเร็จ sale_code={$saleCode} status={$response->status()}");
            return collect();
        }

        $apiData = collect($response->json('data') ?? []);
        $custIds = $apiData->pluck('cust_id')->toArray();

        $localStores = StoreInformation::whereIn('is_code_cust_id', $custIds)
            ->get(['is_code_cust_id', 'shop_name', 'phone', 'address'])
            ->keyBy('is_code_cust_id');

        return $apiData->map(function ($d) use ($localStores) {
            $local = $localStores->get($d['cust_id']);

            $apiAddress = '';
            if (!$local?->address) {
                $parts = array_filter([
                    $d['shipaddress'] ?? '',
                    ($d['district'] ?? '') ? 'ต.' . $d['district'] : '',
                    ($d['amphoe']   ?? '') ? 'อ.' . $d['amphoe']   : '',
                    ($d['province'] ?? '') ? 'จ.' . $d['province'] : '',
                    $d['zipcode'] ?? '',
                ]);
                $apiAddress = implode(' ', $parts);
            }

            return [
                'is_code_cust_id' => $d['cust_id'],
                'shop_name'       => $local?->shop_name ?? ($d['cust_name'] ?? ''),
                'phone'           => $local?->phone     ?? ($d['contact_phone'] ?? ''),
                'address'         => $local?->address   ?? $apiAddress,
            ];
        })->sortBy('shop_name')->values();
    }

    protected function getFormCompleteJobIds(array $jobIds): array
    {
        if (empty($jobIds)) return [];

        $withCustomer = CustomerInJob::whereIn('job_id', $jobIds)
            ->whereNotNull('name')->where('name', '!=', '')
            ->whereNotNull('phone')->where('phone', '!=', '')
            ->pluck('job_id')->toArray();

        $withSymptom = Symptom::whereIn('job_id', $jobIds)
            ->whereNotNull('symptom')->where('symptom', '!=', '')
            ->pluck('job_id')->toArray();

        $withFile = FileUpload::whereIn('job_id', $jobIds)
            ->where('menu_id', 1)
            ->pluck('job_id')->unique()->toArray();

        return array_values(array_intersect($withCustomer, $withSymptom, $withFile));
    }

    private function fetchCustIds(string $saleCode): array
    {
        $response = $this->callPkApi('/getCustInSales', ['sale_code' => $saleCode]);

        if ($response->status() === 404 || $response->status() === 204) {
            return [];
        }

        if (!$response->successful()) {
            throw new \Exception('ดึงข้อมูลร้านค้าจาก PK API ไม่สำเร็จ (HTTP ' . $response->status() . ')');
        }

        $data = $response->json('data') ?? [];
        return array_column($data, 'cust_id');
    }

    private function getPkApiToken(bool $forceRefresh = false): string
    {
        if ($forceRefresh) {
            Cache::forget('pk_api_access_token');
        }

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

    private function callPkApi(string $endpoint, array $body): \Illuminate\Http\Client\Response
    {
        $token    = $this->getPkApiToken();
        $response = Http::withToken($token)
            ->asJson()
            ->withoutVerifying()
            ->timeout(15)
            ->post(config('services.pk_api.base_url') . $endpoint, $body);

        if ($response->status() === 401) {
            Log::warning('PK API 401 — refreshing token and retrying: ' . $endpoint);
            $token    = $this->getPkApiToken(forceRefresh: true);
            $response = Http::withToken($token)
                ->asJson()
                ->withoutVerifying()
                ->timeout(15)
                ->post(config('services.pk_api.base_url') . $endpoint, $body);
        }

        if (!$response->successful()) {
            Log::error("PK API error [{$endpoint}]: status={$response->status()} body={$response->body()}");
        }

        return $response;
    }
}
