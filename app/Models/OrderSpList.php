<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderSpList extends Model
{
    protected $fillable = [
        'order_id',
        'sp_code',
        'sp_name',
        'sku_code',
        'price_per_unit',
        'qty',
        'sp_unit',
        'path_file'
    ];
}
