<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagram extends Model
{
    protected $fillable = [
        'sku_fg_code',
        'sku_fg_name',
        'sku_model_fg',
        'type_dm',
        'layout',
        'file_part_image',
        'file_part_manual',
    ];
}
