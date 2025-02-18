<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerInJob extends Model
{
    //

    protected $fillable = [
        'job_id',
        'name' ,
        'phone' ,
        'address',
        'remark',
    ];
}
