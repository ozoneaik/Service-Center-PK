<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareReturnFile extends Model
{
    //
    use HasFactory;

    protected $table = 'spare_return_files';

    protected $fillable = [
        'return_header_id',
        'file_path',
        'file_name',
        'file_type'
    ];

    /**
     * ความสัมพันธ์กลับไปยัง Header
     */
    public function header()
    {
        return $this->belongsTo(SpareReturnHeader::class, 'return_header_id');
    }

    protected $appends = ['full_url']; // เพิ่มตัวนี้
    /**
     * Accessor เพื่อให้ได้ URL เต็มของรูปภาพอัตโนมัติ (Optional)
     * เรียกใช้ด้วย $file->full_url
     */
    public function getFullUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}
