<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationNew extends Model
{
    use HasFactory;

    protected $table = 'notifications_new';

    protected $fillable = [
        'title',
        'message',
        'status',
        'start_at',
        'end_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    // ความสัมพันธ์กับผู้สร้าง
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ความสัมพันธ์กับผู้แก้ไขล่าสุด
    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ความสัมพันธ์กับกลุ่มร้านค้า (many-to-many)
    public function groups()
    {
        return $this->belongsToMany(
            GroupStore::class,
            'notification_group_new',
            'notification_id',
            'group_id'
        );
    }
}
