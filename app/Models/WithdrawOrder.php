<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WithdrawOrder extends Model
{
    use HasFactory;

    protected $table = 'withdraw_orders';

    protected $fillable = [
        'withdraw_id',
        'is_code_key',
        'user_key',
        'status',
        'request_at',
        'address',
        'phone',
        'pay_by',
        'pay_at',
        'process_at',
        'process_user_key',
        'completed_at',
        'cancel_user_key',
        'discount_total',
        'remark',
        'total_price',
        'status_send',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'request_at' => 'datetime',
        'pay_at' => 'datetime',
        'process_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'total_price' => 'decimal:2',
        'status_send' => 'boolean',
    ];

    public $timestamps = true;

    // ความสัมพันธ์: 1 ใบเบิก มีหลายอะไหล่
    public function items()
    {
        return $this->hasMany(WithdrawOrderSpList::class, 'withdraw_id', 'withdraw_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_key', 'user_code');
    }
}
