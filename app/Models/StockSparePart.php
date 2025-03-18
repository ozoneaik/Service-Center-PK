<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockSparePart extends Model
{
    protected $fillable = [
        'is_code_cust_id', // รหัสร้าน
        'sp_code',         // รหัสอะไหล่
        'sp_name',         // ชื่ออะไหล่
        'sku_code',        // รหัสสินค้า (มี typo ควรตรวจสอบ)
        'sku_name',        // ชื่อสินค้า
        'qty_sp',          // จำนวนอะไหล่
        'old_qty_sp',      // จำนวนอะไหล่ก่อนหน้า
    ];
    
}
