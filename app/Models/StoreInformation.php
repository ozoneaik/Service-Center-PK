<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StoreInformation extends Model
{
    protected $fillable = [
        'shop_name',
        'is_code_cust_id',
        'phone',
        'address',
        'address_sub',
        'province',
        'district',
        'sub_district',
        'sale_id',
        'digit_code',
        'line_id',
        'footer_text',
        'footer_description',
        'is_active',
        'use_disc_40p',
        'use_disc_20p',
        'use_std_price'
    ];

    public function gp(): HasOne
    {
        return $this->hasOne(Gp::class, 'is_code_cust_id', 'is_code_cust_id');
    }
}
