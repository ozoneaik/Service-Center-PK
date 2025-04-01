<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkuScore extends Model
{
    protected $fillable = [
        'status',
        'sku',
        'sku_name',
        'group_product_ref',
        'range_value_ref'
    ];
}
