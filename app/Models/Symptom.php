<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Symptom extends Model
{
    protected $fillable = [
        'job_id',
        'serial_id',
        'symptom',
    ];
}
