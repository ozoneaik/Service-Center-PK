<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;


/**
 * @property mixed $file_path
 */
class FileUpload extends Model
{
    protected $fillable = ['serial_id','menu_id','file_path'];
    protected $appends = ['full_file_path'];

    protected function fullFilePath(): Attribute
    {
        return Attribute::get(function (){
            return asset('storage/'.$this->file_path);
        });
    }

}
