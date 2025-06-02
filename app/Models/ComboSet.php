<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboSet extends Model
{
    protected $fillable = [
        'sku_code',
        'sku_name',
    ];
}
