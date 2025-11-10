<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WithdrawOrderSpList extends Model
{
    use HasFactory;

    protected $table = 'withdraw_order_sp_lists';

    protected $fillable = [
        'withdraw_id',
        'sp_code',
        'sp_name',
        'sku_code',
        'qty',
        'stdprice_per_unit',
        'sell_price',
        'discount_percent',
        'discount_amount',
        'sp_unit',
        'path_file',
    ];

    public $timestamps = true;

    public function order()
    {
        return $this->belongsTo(WithdrawOrder::class, 'withdraw_id', 'withdraw_id');
    }
}
