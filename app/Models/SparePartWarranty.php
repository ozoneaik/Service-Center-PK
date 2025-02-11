<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SparePartWarranty extends Model
{
    protected $fillable = [
        'serial_id',
        'job_id',
        'status',
        'sp_code',
        'sp_name',
        'price_per_unit',
        'qty',
        'sp_unit'
    ];
}
