<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobSaleList extends Model
{
    use HasFactory;

    /**
     * ระบุชื่อตารางให้ชัดเจน
     */
    protected $table = 'job_sale_lists';

    protected $fillable = [
        'job_id',
        'pid',
        'p_name',
        'p_base_unit',
        'p_cat_id',
        'p_cat_name',
        'p_sub_cat_name',
        'fac_model',
        'warranty_condition',
        'warranty_note',
        'warranty_period',
        'serial_id',
        'image_sku',
        'status',
        'warranty',
        'auth_key',
        'is_code_key',
        'user_key',
        'close_job_by',
        'close_job_at',
        'group_job',
        'print_at',
        'print_updated_at',
        'counter_print',
        'repair_man_id',
        'insurance_expire',
        'stuc_status',
        'stuc_doc_no',
        'created_ct_doc_by',
        'created_ct_doc_at',
        'updated_ct_doc_by',
        'updated_ct_doc_at',
        'cn_doc',
        'stuc_cover_doc_no',
        'status_mj',
        'shop_under_sale_id',
        'shop_under_sale_name',
        'shop_under_sale_phone'
    ];
}
