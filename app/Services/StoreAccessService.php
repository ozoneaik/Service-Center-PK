<?php

namespace App\Services;

use App\Models\StoreInformation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class StoreAccessService
{
    private const EXCLUDED_STORES = ['68263', '2760801005', '67132', 'How'];

    /**
     * คืน is_code_cust_id ทั้งหมดที่ user มีสิทธิ์เข้าถึง
     * - admin  → [] (หมายถึงทุกร้าน ไม่กรอง)
     * - sale   → ร้านที่ตัวเองดูแล (ผ่าน StoreInformation.sale_id)
     * - อื่นๆ → ร้านของตัวเอง (is_code_cust_id เดียว)
     */
    public function getManagedStoreIds($user): array
    {
        if ($user->role === 'admin') {
            return [];
        }

        if ($user->role === 'sale') {
            $saleCode = optional($user->sale_info)->sale_code;
            if (empty($saleCode)) {
                return [];
            }
            $ids = StoreInformation::whereNotNull('sale_id')
                ->where('sale_id', '!=', '')
                ->where('sale_id', $saleCode)
                ->pluck('is_code_cust_id')
                ->toArray();

            return $ids; // ถ้าไม่มีร้านไหนผูกอยู่ → คืน [] → applyStoreScope จะ block ทุก query
        }

        return [$user->is_code_cust_id];
    }

    /**
     * Apply scope ตาม role ลงบน query (column ที่ใช้ join อาจต่างกันในแต่ละตาราง)
     *
     * @param Builder $query
     * @param mixed   $user          Auth user
     * @param string  $column        ชื่อ column ใน query ที่เก็บ is_code_cust_id เช่น 'is_code_key'
     * @param array   $selectedShops admin เลือก filter เฉพาะบางร้าน (ถ้ามี)
     */
    public function applyStoreScope(Builder $query, $user, string $column = 'is_code_key', array $selectedShops = []): Builder
    {
        if ($user->role === 'admin') {
            if (!empty($selectedShops)) {
                $query->whereIn($column, $selectedShops);
            }
            return $query;
        }

        $storeIds = $this->getManagedStoreIds($user);

        if (empty($storeIds)) {
            return $query->whereRaw('1 = 0');
        }

        if (!empty($selectedShops)) {
            $storeIds = array_values(array_intersect($storeIds, $selectedShops));
            if (empty($storeIds)) {
                return $query->whereRaw('1 = 0');
            }
        }

        if (count($storeIds) === 1) {
            return $query->where($column, $storeIds[0]);
        }

        return $query->whereIn($column, $storeIds);
    }

    /**
     * คืน Collection ของร้านค้าที่ user มองเห็นได้ (ใช้ใน dropdown / ตัวกรอง)
     * - admin → ทุกร้าน (ยกเว้น excluded)
     * - sale  → ร้านที่ตัวเองดูแล
     * - อื่นๆ → ร้านตัวเอง
     */
    public function getAccessibleShops($user): Collection
    {
        if ($user->role === 'admin') {
            return StoreInformation::select('is_code_cust_id', 'shop_name')
                ->whereNotIn('is_code_cust_id', self::EXCLUDED_STORES)
                ->orderBy('shop_name')
                ->get();
        }

        // sale และ role อื่นๆ: ดึง storeIds จาก getManagedStoreIds เป็น single source of truth
        $storeIds = $this->getManagedStoreIds($user);

        if (empty($storeIds)) {
            return collect();
        }

        return StoreInformation::select('is_code_cust_id', 'shop_name')
            ->whereIn('is_code_cust_id', $storeIds)
            ->orderBy('shop_name')
            ->get();
    }

    /**
     * ตรวจว่า user มีสิทธิ์เข้าถึงร้านนี้หรือไม่
     */
    public function canAccessStore($user, string $storeId): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return in_array($storeId, $this->getManagedStoreIds($user), true);
    }
}
