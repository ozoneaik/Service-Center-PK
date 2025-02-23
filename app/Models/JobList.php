<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobList extends Model
{
    protected $fillable = [
        'job_id',
        'pid',
        'p_name',
        'p_base_unit',
        'p_cat_id',
        'p_cat_name',
        'p_sub_cat_name',
        'fac_model',
        'serial_id',
        'image_sku',
        'status',
        'warranty',
        'user_id',
    ];
}
