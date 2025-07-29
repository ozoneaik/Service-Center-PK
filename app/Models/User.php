<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_code_cust_id',
        'admin_that_branch',
        'user_code',
    ];

    public function username(): string
    {
        return 'user_code';
    }


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function store_info()
    {

        return $this->hasOne(StoreInformation::class, 'is_code_cust_id', 'is_code_cust_id');
    }

    public function sale_info()
    {
        $user = $this->hasOne(StoreInformation::class, 'is_code_cust_id', 'is_code_cust_id')->where('id', Auth::user()->id)->first();
        $sale = SaleInformation::query()->where('sale_code', $user->sale_id)->select('sale_code', 'name as sale_name')->first();
        $access_menu = UserAccessMenu::query()->where('user_code', Auth::user()->user_code)->get();
        return $this->hasOne(SaleInformation::class, 'is_code_cust_id', 'is_code_cust_id');
    }
}
