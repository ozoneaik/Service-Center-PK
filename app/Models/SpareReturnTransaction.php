<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareReturnTransaction extends Model
{
    //
    use HasFactory;

    /**
     * ชื่อตารางในฐานข้อมูล
     */
    protected $table = 'spare_return_transactions';

    /**
     * ฟิลด์ที่อนุญาตให้บันทึกข้อมูลแบบ Mass Assignment (create/update)
     */
    protected $fillable = [
        'return_header_id', // ID ของใบรับคืนหลัก
        'return_detail_id', // ID ของรายการสินค้าย่อย
        'qty',              // จำนวนที่รับในครั้งนี้
        'recorded_by',      // รหัสพนักงาน/User ที่กดรับ
        'remark',           // หมายเหตุเพิ่มเติม
    ];

    /**
     * ความสัมพันธ์: Transaction นี้เป็นของ Header (ใบหลัก) ใบไหน
     */
    public function header()
    {
        return $this->belongsTo(SpareReturnHeader::class, 'return_header_id');
    }

    /**
     * ความสัมพันธ์: Transaction นี้เป็นของ Detail (รายการสินค้า) ตัวไหน
     */
    public function detail()
    {
        return $this->belongsTo(SpareReturnDetail::class, 'return_detail_id');
    }

    /**
     * (Optional) ถ้าต้องการดึงข้อมูล User จาก recorded_by
     * กรณี recorded_by เก็บเป็น user_code หรือ id ที่เชื่อมโยงกับตาราง users
     */
    /*
    public function user()
    {
        return $this->belongsTo(User::class, 'recorded_by', 'user_code');
    }
    */
}
