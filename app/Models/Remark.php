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
        $remark = Remark::query()->where('job_id', $job_id)->select('remark')->first();
//        $symptom = Symptom::query()->where('job_id', $job_id)->select('symptom')->first();
//        $accessory = AccessoriesNote::query()->where('job_id', $job_id)->select('note')->first();

        return $remark->remark ?? null;

//        return [
//            'remark' => $remark ? $remark->remark : null,
//            'symptom' => $symptom ? $symptom->symptom : null,
//            'accessory' => $accessory ? $accessory->note : null,
//        ];
    }
}
