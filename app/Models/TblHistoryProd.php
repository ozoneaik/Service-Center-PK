<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TblHistoryProd extends Model
{
    protected $connection = 'warranty';
    protected $table = 'tbl_history_prod';
    public $timestamps = false;
    protected $fillable = [
        'lineid',
        'cust_tel',
        'serial_number',
        'model_code',
        'model_name',
        'product_name',
        'slip',
        'buy_date',
        'insurance_expire',
        'buy_from',
        'store_name',
        'receipt_no',
        'buy_where',
        'branch',
        'mall_code',
        'branch_code',
        'tax_invoice',
        'insurance',
        'approval',
        'approver',
        'dt_approve',
        'notation',
        'edit_approver',
        'edit_dt_approve',
        'status_34year',
        'last_change_approval_at',
        'last_change_approval_by',
        'round',
        'ref_approveID',
        'updated_appr_at',
        'updated_appr_by',
        'status',
        'status_rocket',
        'create_at',
        'updated_at',
        'updated_by',
        'timestamp',
        'reward',
        'price',
        'warranty_from',
        'customer_code',
        'customer_name',
    ];
}
