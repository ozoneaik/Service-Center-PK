<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScoreMaster extends Model
{
    protected $fillable = [
        'range_value',
        'range_name',
        'condition',
        'group_product',
    ];
}
