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
        'subremark3',
        'shop_under_sale',
        'is_code_cust_id',
        'delivery_type',
        'shop_under_sale_id',
        'dealer_contact_name',
        'dealer_contact_phone',
    ];

    public static function findByJobId($job_id): array
    {
        $customer = CustomerInJob::query()->where('job_id', $job_id)->first();
        return $customer ? $customer->toArray() : [];
    }

}
