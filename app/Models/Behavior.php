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

    public static function search($job_id){
        $behaviors = Behavior::query()->where('job_id', $job_id)->first();
        return $behaviors ?? null;
    }
    public static function findByJob($job_id){
        $behaviors = Behavior::query()->where('job_id', $job_id)->get();
        return $behaviors ?? [];
    }
}
