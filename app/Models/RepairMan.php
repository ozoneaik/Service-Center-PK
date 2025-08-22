<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RepairMan extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'is_code_cust_id',
        'technician_name',
        'technician_nickname',
        'technician_phone',
    ];
}
