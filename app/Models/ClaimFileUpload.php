<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ClaimFileUpload extends Model
{
    // กำหนดชื่อ Table (Optional ถ้าชื่อตรงตาม convention)
    protected $table = 'claim_file_uploads';

    protected $fillable = [
        'claim_id',
        'file_path',
        'file_name',
        'remark',
    ];

    protected $appends = ['full_file_path'];

    /**
     * ค้นหารูปภาพตาม claim_id
     */
    public static function findByClaimId($claim_id)
    {
        return self::query()
            ->where('claim_id', $claim_id)
            ->get(); // คืนค่าเป็น Collection เผื่อมีหลายรูป
    }

    /**
     * Attribute สำหรับดึง Path เต็มพร้อม URL
     */
    protected function fullFilePath(): Attribute
    {
        return Attribute::get(function () {
            // ตรวจสอบว่ามี path หรือไม่ เพื่อป้องกัน error
            if (empty($this->file_path)) {
                return null;
            }
            return asset('storage/' . $this->file_path);
        });
    }
}
