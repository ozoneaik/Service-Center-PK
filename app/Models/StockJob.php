<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockJob extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'stock_job_id',
        'is_code_cust_id',
        'user_code_key',
        'job_status',
        'user_code_close_job',
        'closeJobAt',
        'type',
        'doctype',
        'ref_doc',
    ];
}
