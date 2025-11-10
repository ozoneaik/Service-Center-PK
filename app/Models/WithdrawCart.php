<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class WithdrawCart extends Model
{
    protected $table = 'withdraw_carts';

    public $timestamps = true; // ให้ Eloquent อัปเดต created_at / updated_at

    protected $fillable = [
        'is_code_cust_id',
        'user_code_key',
        'sku_code',
        'sku_name',
        'sp_code',
        'sp_name',
        'price_per_unit',
        'stdprice_per_unit',
        'sp_unit',
        'qty',
        'is_active',
        'remark',
    ];

    protected $casts = [
        'price_per_unit' => 'decimal:2',
        'qty'            => 'integer',
        'is_active'      => 'boolean',
    ];

    /** scope: เฉพาะในตะกร้า (ยังไม่ active) */
    public function scopeInCart($q)
    {
        return $q->where('is_active', false);
    }

    /** กันรายการซ้ำต่อผู้ใช้ (เฉพาะในตะกร้า) */
    public static function existsInCart($userCode, $spCode)
    {
        return self::query()
            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('user_code_key', $userCode)
            ->where('sp_code', $spCode)
            ->where('is_active', false)
            ->exists();
    }
}
