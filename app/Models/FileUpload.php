<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;


/**
 * @property mixed $file_path
 */
class FileUpload extends Model
{
    protected $fillable = [
        'serial_id',
        'menu_id',
        'file_path',
        'job_id'
    ];
    protected $appends = ['full_file_path'];

    public static function search($job_id, $menu_id)
    {
        $upload_file = FileUpload::query()
            ->where('job_id', $job_id)
            ->where('menu_id', $menu_id)
            ->first();
        return $upload_file ?? null;
    }

    public static function findByJobIdBefore($job_id)
    {
        $file_befores = FileUpload::query()
            ->where('job_id', $job_id)
            ->where('menu_id', 1)
            ->get();

        return $file_befores ?? [];
    }

    protected function fullFilePath(): Attribute
    {
        return Attribute::get(function () {
            return asset('storage/' . $this->file_path);
        });
    }

}
