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

    public static function findByJobId($job_id){
        $remark = Remark::query()->where('job_id', $job_id)->first();
        $symptom = Symptom::query()->where('job_id', $job_id)->first();

        return [
            'remark' => $remark ?? null,
            'symptom' => $symptom ?? null
        ];
    }
}
