<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Claim extends Model
{
    protected $fillable = [
        'claim_id',
        'user_id',
        'status',
        'receive_status',
        'receive_by'
    ];

    public function files(): HasMany
    {
        // เชื่อมไปยัง ClaimFileUpload โดยใช้ claim_id เป็นคีย์ในการเชื่อม
        return $this->hasMany(ClaimFileUpload::class, 'claim_id', 'claim_id');
    }

    public function returnHeaders()
    {
        return $this->hasMany(SpareReturnHeader::class, 'claim_id', 'claim_id');
    }
}
