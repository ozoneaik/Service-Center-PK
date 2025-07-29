<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAccessMenu extends Model
{
    protected $fillable = [
        'user_code',
        'menu_code'
    ];
}
