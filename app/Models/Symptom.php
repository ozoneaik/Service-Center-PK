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

    public static function findByJobId($job_id){
        $symptom = Symptom::query()->where('job_id', $job_id)->first();
        return $symptom->symptom ?? null;
    }
}
