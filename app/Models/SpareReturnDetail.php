<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareReturnDetail extends Model
{
    //
    use HasFactory;

    protected $table = 'spare_return_details';

    protected $fillable = [
        'return_header_id',
        'claim_detail_id',
        'sp_code',
        'sp_name',
        'qty',
        'unit',
        'account_rc_qty'
    ];

    /**
     * ความสัมพันธ์กลับไปยัง Header
     */
    public function header()
    {
        return $this->belongsTo(SpareReturnHeader::class, 'return_header_id');
    }

    /**
     * (Optional) ความสัมพันธ์กลับไปยัง ClaimDetail เดิม (เผื่อดึง Serial Number ฯลฯ)
     */
    public function originalClaimDetail()
    {
        return $this->belongsTo(ClaimDetail::class, 'claim_detail_id');
    }

    public function transactions()
    {
        return $this->hasMany(SpareReturnTransaction::class, 'return_detail_id');
    }
}
