<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Qu extends Model
{
    protected $fillable = [
        'job_id',
        'path_file',
    ];


    protected function fullFilePath(): Attribute
    {
        return Attribute::get(function () {
            return asset('storage/' . $this->path_file);
        });
    }


}
