<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerInJob extends Model
{
    //

    protected $fillable = [
        'job_id',
        'serial_id',
        'name',
        'phone',
        'address',
        'remark',
        'subremark1',
        'subremark2',
    ];

    public static function findByJobId($job_id): array
    {
        $customer = CustomerInJob::query()->where('job_id', $job_id)->first();
        return $customer ? $customer->toArray() : [];
    }

}
