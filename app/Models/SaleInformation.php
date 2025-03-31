<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleInformation extends Model
{
    protected $fillable = [
        'is_code_cust_id',
        'sale_code',
        'lark_token',
        'name',
    ];
}
