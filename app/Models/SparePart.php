<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SparePart extends Model
{
    protected $fillable = [
        'serial_id',
        'job_id',
        'sp_code',
        'sp_name',
        'price_per_unit',
        'qty',
        'sp_warranty',
        'sp_unit',
        'gp',
        'price_multiple_gp',
        'status',
        'approve',
        'approve_status',
        'remark',
        'claim',
        'claim_remark'
    ];


    public static function search($job_id)
    {
        $sps = SparePart::query()->where('job_id', $job_id)->first();
        return $sps ?? null;
    }

    public static function findByJobId($job_id)
    {
        $spare_parts = SparePart::query()->where('job_id', $job_id)
            ->select(
                'serial_id',
                'job_id',
                'sp_code as spcode',
                'sp_name as spname',
                'price_per_unit',
                'qty',
                'sp_warranty',
                'sp_unit as spunit',
                'gp',
                'price_multiple_gp',
                'status',
                'approve',
                'approve_status',
                'remark',
                'claim',
                'claim_remark'
            )
            ->get();

        foreach ($spare_parts as $key=>$spare_part){
            if ($spare_part['sp_warranty']){
                $spare_part['sp_warranty'] = 'Y';
            }else $spare_part['sp_warranty'] = 'N';
        }
        return $spare_parts ?? [];
    }
}
