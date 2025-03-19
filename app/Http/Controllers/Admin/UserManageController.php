<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmpRequest;
use App\Models\StoreInformation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
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

    public function store(EmpRequest $request){
        $request->validate([
            'is_code_cust_id' => ['required'],
            'admin_that_branch' => ['required']
        ],[
            'is_code_cust_id.required' => "ไม่พบ รหัสร้านค้า",
            'admin_that_branch.required' => 'ไม่พบ สิทธ์ในร้าน'
        ]);
        $data = $request;
        $user = User::query()->create([
            'user_code' => 'A'.time().rand(1000,9999),
            'name' => $data['name'],
            'is_code_cust_id' => $data['is_code_cust_id'],
            'role' => $data['role'],
            'admin_that_branch' => $data['admin_that_branch'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'])
        ]);

        if ($user) {
            return Redirect::route('userManage.create', [
                'is_code_cust_id' => $data['is_code_cust_id']
            ])->with('success', 'บันทึกผู้ใช้สำเร็จ');
        }else{
            return Redirect::route('userManage.create', [
                'is_code_cust_id' => $data['is_code_cust_id']
            ])->with('error', 'บันทึกผู้ใช้ไม่สำเร็จ');
        }
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
