<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboSubSet extends Model
{
    protected $fillable = [
        'sub_sku_code',
        'sub_sku_name',
        'main_combo_id',
    ];
}
