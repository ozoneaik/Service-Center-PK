<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessoriesNote extends Model
{
    protected $fillable = [
        'job_id',
        'serial_id',
        'note'
    ];

    public static function findByJobId($job_id){
        $accessory = AccessoriesNote::query()->where('job_id', $job_id)->first();
        return $accessory->note ?? null;
    }
}
