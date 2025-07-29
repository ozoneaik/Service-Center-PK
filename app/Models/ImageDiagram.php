<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class  ImageDiagram extends Model
{
    protected $connection = 'diagram_list';
    protected $table = 'diagram_list';
    protected $fillable = [
        'sku_code',
        'fac_model',
        'dm_type',
        'layer',
        'created_at',
        'updated_at'
    ];
}
