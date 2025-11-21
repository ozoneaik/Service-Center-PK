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
        'stdprice_per_unit',
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
        'claim_remark',
        'remark_noclaim',
        'fast_claim',
    ];


    public static function search($job_id)
    {
        $sps = SparePart::query()->where('job_id', $job_id)->first();
        return $sps ?? null;
    }

    // public static function findByJobId($job_id)
    // {
    //     $spare_parts = SparePart::query()->where('job_id', $job_id)
    //         ->select(
    //             'serial_id',
    //             'job_id',
    //             'sp_code as spcode',
    //             'sp_name as spname',
    //             'price_per_unit',
    //             'qty',
    //             'sp_warranty as warranty',
    //             'sp_unit as spunit',
    //             'gp',
    //             'price_multiple_gp',
    //             'status',
    //             'approve',
    //             'approve_status',
    //             'remark',
    //             'claim',
    //             'claim_remark',
    //             'remark_noclaim'
    //         )
    //         ->get();

    //     foreach ($spare_parts as $spare_part){
    //         if ($spare_part['warranty']){
    //             $spare_part['warranty'] = 'Y';
    //         }else $spare_part['warranty'] = 'N';
    //     }
    //     return $spare_parts ?? [];
    // }

    public static function findByJobId($job_id)
    {
        return SparePart::query()
            ->where('job_id', $job_id)
            ->get()
            ->map(function ($sp) {

                return [
                    'serial_id' => $sp->serial_id,
                    'job_id' => $sp->job_id,

                    // KEY ที่ React ใช้
                    'spcode' => $sp->sp_code,
                    'spname' => $sp->sp_name,
                    'spunit' => $sp->sp_unit,
                    'qty' => $sp->qty,

                    // ราคา
                    'price_per_unit' => floatval($sp->price_per_unit),
                    'stdprice_per_unit' => floatval($sp->stdprice_per_unit),
                    'gp' => $sp->gp,
                    'price_multiple_gp' => floatval($sp->price_multiple_gp),

                    // WARRANTY
                    'sp_warranty' => $sp->sp_warranty ? 'Yes' : 'No',
                    'warranty' => $sp->sp_warranty ? 'Yes' : 'No',

                    // CLAIM STATUS
                    'claim' => (bool) $sp->claim,
                    'fast_claim' => (bool) $sp->fast_claim,
                    'claim_remark' => $sp->claim_remark,
                    'remark' => $sp->remark,
                    'remark_noclaim' => $sp->remark_noclaim,

                    // OTHER
                    'status' => $sp->status,
                    'approve' => $sp->approve,
                    'approve_status' => $sp->approve_status,
                ];
            });
    }
}