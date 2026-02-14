<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareReturnHeader extends Model
{
    //
    use HasFactory;

    protected $table = 'spare_return_headers';

    protected $fillable = [
        'return_job_no',
        'claim_id',
        'receive_by_sale',
        'receive_by_account',
        'account_receive_date',
        'status',
        'remark'
    ];

    /**
     * ความสัมพันธ์ไปยังรายการสินค้า (Details)
     */
    public function details()
    {
        return $this->hasMany(SpareReturnDetail::class, 'return_header_id');
    }

    /**
     * ความสัมพันธ์ไปยังไฟล์รูปภาพ (Files)
     */
    public function files()
    {
        return $this->hasMany(SpareReturnFile::class, 'return_header_id');
    }

    /**
     * ความสัมพันธ์กลับไปยังใบเคลมหลัก (Claim)
     * เชื่อมด้วย claim_id (string) ไม่ใช่ id (int)
     */
    public function claim()
    {
        return $this->belongsTo(Claim::class, 'claim_id', 'claim_id');
    }

    /**
     * (Optional) ถ้าต้องการดึงข้อมูล User ที่เป็น Sales คนสร้าง
     */
    public function salesUser()
    {
        // สมมติว่าเชื่อมด้วย user_code กับตาราง users
        return $this->belongsTo(User::class, 'receive_by_sale', 'user_code');
    }
    public function salesFiles()
    {
        return $this->hasMany(ClaimFileUpload::class, 'return_job_no', 'return_job_no');
    }
}
