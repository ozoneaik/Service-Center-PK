<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterSp extends Model
{
    protected $fillable = [
        'sp_code',
        'sp_name',
        'sp_unit',
        'cat',
        'sub_cat',
        'group'
    ];
}
