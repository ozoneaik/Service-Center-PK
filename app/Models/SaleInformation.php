<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleInformation extends Model
{
    protected $fillable = [
        'sale_code',
        'lark_token',
        'name',
    ];
}
