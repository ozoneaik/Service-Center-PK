<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SparePart extends Model
{
    protected $fillable = [
        'serial_id',
        'job_id',
        'sp_code',
        'sp_name',
        'price_per_unit',
        'qty',
        'sp_unit'
    ];
}
