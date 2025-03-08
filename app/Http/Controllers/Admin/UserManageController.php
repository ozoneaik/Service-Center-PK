<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserManageController extends Controller
{
    public function list()
    {
        $list = [];
        $groups = User::query()->select('is_code_cust_id', 'shop_name')->groupBy('is_code_cust_id', 'shop_name')->get();
        foreach ($groups as $key => $group) {
            $list[$key]['is_code_cust_id'] = $group->is_code_cust_id;
            $list[$key]['shop_name'] = $group->shop_name;
            $list[$key]['users'] = User::query()->where('is_code_cust_id', $group->is_code_cust_id)->get();
        }
        return Inertia::render('Admin/Users/UserList', ['list' => $list]);
    }
}
