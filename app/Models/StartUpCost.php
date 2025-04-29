<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StartUpCost extends Model
{
    protected $fillable = [
        'image',
        'barcode',
        'sku_id',
        'sku_name',
        'unit',
        'amount',
        'price_per_unit',
        'discount',
        'p_cat_name',
        'startup_cost',
    ];
}
