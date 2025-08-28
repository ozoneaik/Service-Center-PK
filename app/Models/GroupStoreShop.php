<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupStoreShop extends Model
{
    use HasFactory;

    protected $table = 'group_stores_dt';
    protected $fillable = ['group_ids', 'store_ids'];

    // Relation กับร้าน
    public function store()
    {
        return $this->belongsTo(StoreInformation::class, 'store_ids', 'id');
    }
}
