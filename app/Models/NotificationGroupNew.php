<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationGroupNew extends Model
{
    use HasFactory;

    protected $table = 'notification_group_new';

    protected $fillable = [
        'notification_id',
        'group_id',
    ];

    public function notification()
    {
        return $this->belongsTo(NotificationNew::class, 'notification_id');
    }

    public function group()
    {
        return $this->belongsTo(GroupStore::class, 'group_id');
    }
}
