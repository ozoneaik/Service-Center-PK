<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ListMenu extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'menu_name',
        'group',
        'main_menu',
        'redirect_route',
    ];
}
