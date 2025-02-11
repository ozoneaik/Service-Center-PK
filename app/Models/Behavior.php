<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Behavior extends Model
{
    protected $fillable = [
        'serial_id',
        'job_id',
        'catalog',
        'sub_catalog',
        'behavior_name',
        'cause_code',
        'cause_name'
    ];
}
