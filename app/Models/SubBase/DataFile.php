<?php

namespace App\Models\SubBase;

use Illuminate\Database\Eloquent\Model;

class DataFile extends Model
{
    protected $connection = 'diagram_list';
    protected $table = 'data_file';
    protected $fillable = [
        'skusp',
        'skuspname',
        'skuspunit'
    ];
}
