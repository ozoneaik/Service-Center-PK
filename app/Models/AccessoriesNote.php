<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessoriesNote extends Model
{
    protected $fillable = [
        'job_id',
        'serial_id',
        'note'
    ];
}
