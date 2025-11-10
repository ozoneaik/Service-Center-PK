<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockJobDetail extends Model
{
    use SoftDeletes;
    protected $table = 'stock_job_details';
    protected $fillable = [
        'stock_job_id',
        'is_code_cust_id',
        'user_code_key',
        'sku_code',
        'sku_name',
        'sp_code',
        'sp_name',
        'sp_qty',
        'sp_unit',
        'stdprice_per_unit', 
        'sell_price',       
        'discount_percent',
        'discount_amount', 
        'total_after_total_if_add',
        'total_after_total_if_remove'
    ];
}
