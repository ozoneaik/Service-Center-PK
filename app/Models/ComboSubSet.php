<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboSubSet extends Model
{
    protected $fillable = [
        'sub_sku_code',
        'main_combo_id',
    ];
}
