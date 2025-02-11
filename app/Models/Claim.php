<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    protected $fillable = [
        'claim_id',
        'serial_id',
        'job_id',
        'sp_code',
        'claim_submit_date',
        'qty',
        'unit',
        'claim_date',
        'claim_qty',
        'claim_unit',
        'status'
    ];
}
