<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrinterIp extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'is_code_cust_id',
        'printer_ip',
        'pc_ip',
        'pc_port',
        'created_by',
        'updated_by',
        'deleted_by'
    ];
}
