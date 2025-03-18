<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreInformation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManageController extends Controller
{
    public function list()
    {
        $list = [];
        $groups = StoreInformation::query()->select('is_code_cust_id', 'shop_name')->groupBy('is_code_cust_id', 'shop_name')->get();
        foreach ($groups as $key => $group) {
            $list[$key]['is_code_cust_id'] = $group->is_code_cust_id;
            $list[$key]['shop_name'] = $group->shop_name;
            $list[$key]['users'] = User::query()->where('is_code_cust_id', $group->is_code_cust_id)->get();
        }
        return Inertia::render('Admin/Users/UserList', ['list' => $list]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/UserCreate');
    }

    public function edit($user_code)
    {
        $user = User::query()->where('user_code', $user_code)->with('store_info')->first();
        return Inertia::render('Admin/Users/UserEdit', ['user' => $user]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$request->id,
            'role' => 'required|string',
            'admin_that_branch' => 'boolean',
        ]);
        $user = User::findOrFail($request->id);
        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;
        $user->admin_that_branch = $request->admin_that_branch;
        $user->save();
        return redirect()->route('userManage.edit',['user_code' => $request->user_code])
            ->with('success', 'อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว');
    }

    public function delete($user_code)
    {
        $user = User::where('user_code', $user_code)->first();
        if (!$user) {
            return response()->json([
                'message' => 'ไม่พบผู้ใช้รายนี้',
                'user_deleted' => false
            ], 400);
        }
        $user->delete();
        return response()->json([
            'message' => 'ลบผู้ใช้สำเร็จ',
            'user_deleted' => true
        ]);
    }
}
