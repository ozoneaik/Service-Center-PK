<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    //
    protected $fillable = ['is_code_cust_id','bill_no', 'status'];
}
