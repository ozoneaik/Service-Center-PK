<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockJobDetail extends Model
{
    protected $table = 'stock_job_details';
    protected $fillable = [
        'stock_job_id',
        'is_code_cust_id',
        'user_code_key',
        'sku_code',
        'sku_name',
        'sp_code',
        'sp_name',
        'sp_qty'
    ];
}
