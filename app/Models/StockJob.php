<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockJob extends Model
{
    protected $fillable = [
        'stock_job_id',
        'is_code_cust_id',
        'user_code_key',
        'job_status',
        'user_code_close_job',
        'closeJobAt'
    ];
}
