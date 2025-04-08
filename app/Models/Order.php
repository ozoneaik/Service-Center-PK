<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

/**
 * @property mixed $status
 */
class Order extends Model
{
    protected $fillable = [
        'order_id',
        'is_code_key',
        'user_key',
        'status',
        'buy_at',
        'process_at',
        'process_user_key',
        'success_at',
        'cancel_user_key',
        'address',
        'pay_at',
        'pay_by',
        'phone',
        'status_send_order'
    ];

    protected $appends = ['status_text'];

    protected function statusText(): Attribute
    {
        return Attribute::get(function () {
            if ($this->status === 'pending') {
                $status_text = 'กำลังรอรับคำสั่งซื้อ';
            } elseif ($this->status === 'progress') {
                $status_text = 'กำลังดำเนินการจัดเตรียมสินค้า';
            } elseif ($this->status === 'success') {
                $status_text = 'คำสั่งซื้อเสร็จสิ้น';
            } elseif ($this->status === 'canceled') {
                $status_text = 'คำสั่งซื้อถูกยกเลิก';
            } else {
                $status_text = 'ไม่ทราบสถานะคำสั่งซื้อ';
            }
            return $status_text;
//            return asset('storage/'.$this->file_path);
        });
    }
}
