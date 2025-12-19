<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClaimDetail extends Model
{
    protected $fillable = [
        'claim_id',
        'serial_id',
        'job_id',
        'sp_code',
        'sp_name',
        'claim_submit_date',
        'qty',
        'unit',
        'claim_date',
        'claim_qty',
        'claim_unit',
        'status',
        'rc_qty',
    ];
}
