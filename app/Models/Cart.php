<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'is_code_cust_id',
        'user_code_key',
        'sku_code',
        'sku_name',
        'sp_code',
        'sp_name',
        'is_active',
        'price_per_unit',
        'remark',
        'qty',
        'sp_unit',
    ];
}
