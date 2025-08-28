<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupStore extends Model
{
    use HasFactory;

    protected $table = 'group_stores';
    protected $fillable = ['name'];

    // Relation รายละเอียด group → store
    public function details()
    {
        return $this->hasMany(GroupStoreShop::class, 'group_ids', 'id')
            ->with('store');
    }
}
