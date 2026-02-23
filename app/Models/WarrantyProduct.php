<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WarrantyProduct extends Model
{
    protected $fillable = [
        'serial_id',
        'pid',
        'p_name',
        'date_warranty',
        'user_id',
        'user_is_code_id',
        'expire_date',
        'warranty_period',
        'path_file',
        'skumain',
        'accessory_sku'
    ];
}
