<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Remark extends Model
{
    protected $fillable = [
        'serial_id',
        'remark',
        'job_id'
    ];
}
