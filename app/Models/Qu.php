<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Qu extends Model
{
    protected $fillable = [
        'job_id',
        'file_name',
        'file_path',
        'counter_print'
    ];

    protected $appends = ['full_file_path'];


    protected function fullFilePath(): Attribute
    {
        return Attribute::get(function () {
            return asset('storage/' . $this->file_path);
        });
    }

    public static function findByJobId($job_id){
        $qu = Qu::query()->where('job_id', $job_id)->orderBy('created_at', 'desc')->get();;
        return $qu ?? [];
    }


}
