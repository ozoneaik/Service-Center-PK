<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\MenuAccess;
use App\Http\Requests\EmpRequest;
use App\Models\ListMenu;
use App\Models\StoreInformation;
use App\Models\User;
use App\Models\UserAccessMenu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class UserManageController extends Controller
{
    
    // public function list(): Response
    // {
    //     $list = [];
    //     $groups = StoreInformation::query()->select('is_code_cust_id', 'shop_name')->groupBy('is_code_cust_id', 'shop_name')->get();
    //     foreach ($groups as $key => $group) {
    //         $list[$key]['is_code_cust_id'] = $group->is_code_cust_id;
    //         $list[$key]['shop_name'] = $group->shop_name;
    //         $list[$key]['users'] = User::query()->where('is_code_cust_id', $group->is_code_cust_id)->get();
    //     }
    //     return Inertia::render('Admin/Users/UserList', ['list' => $list]);
    // }

    public function list(): Response
    {
        $list = [];
        $groups = StoreInformation::query()->select('is_code_cust_id', 'shop_name')->groupBy('is_code_cust_id', 'shop_name')->get();
        foreach ($groups as $key => $group) {
            $list[$key]['is_code_cust_id'] = $group->is_code_cust_id;
            $list[$key]['shop_name'] = $group->shop_name;
            $list[$key]['users'] = User::query()->where('is_code_cust_id', $group->is_code_cust_id)->get();
        }

        // เซลล์
        $sale_users = User::query()->where('role', 'sale')->whereNull('is_code_cust_id')->get();
        if ($sale_users->isNotEmpty()) {
            $list[] = [
                'is_code_cust_id' => 'SALE_USERS_GROUP',
                'shop_name' => 'พนักงานขาย (Sale)',
                'users' => $sale_users,
            ];
        }
        return Inertia::render('Admin/Users/UserList2', ['list' => $list]);
    }

    public function create(): Response
    {
        $menu_list = ListMenu::all();
        return Inertia::render('Admin/Users/UserCreate', ['menu_list' => $menu_list]);;
    }

    public function edit($user_code): Response
    {
        $user = User::query()->where('user_code', $user_code)->with('store_info')->first();
        $menu_access = UserAccessMenu::query()->where('user_code', $user_code)->get();
        $list_all_menu = ListMenu::all();
        return Inertia::render('Admin/Users/UserEdit', [
            'user' => $user, 'menu_access' => $menu_access, 'list_all_menu' => $list_all_menu
        ]);
    }

    public function store(EmpRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $request->validate([
                'is_code_cust_id' => ['required'],
                'admin_that_branch' => ['required']
            ], [
                'is_code_cust_id.required' => "ไม่พบ รหัสร้านค้า",
                'admin_that_branch.required' => 'ไม่พบ สิทธ์ในร้าน'
            ]);
            $data = $request;
            $user = User::query()->create([
                'user_code' => $data['user_code'],
                'name' => $data['name'],
                'is_code_cust_id' => $data['is_code_cust_id'],
                'role' => $data['role'],
                'admin_that_branch' => $data['admin_that_branch'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'])
            ]);

            UserAccessMenu::query()->where('user_code', $data['user_code'])->delete();
            foreach ($data['menu_access'] as $key => $value) {
                if ($value['is_checked']) {
                    UserAccessMenu::query()->create([
                        'user_code' => $data['user_code'],
                        'menu_code' => $value['menu_id']
                    ]);
                }
            }


            if ($user) {
                DB::commit();
                return Redirect::route('userManage.create', [
                    'is_code_cust_id' => $data['is_code_cust_id']
                ])->with('success', 'บันทึกผู้ใช้สำเร็จ');
            } else throw new \Exception('เกิดข้อผิดพลาด');
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getLine() . $e->getFile());
            return Redirect::route('userManage.create')->with('error', 'บันทึกผู้ใช้ไม่สำเร็จ');
        }
    }

    public function update(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $request->id,
                'role' => 'required|string',
                'admin_that_branch' => 'boolean',
            ]);
            DB::beginTransaction();
            $user = User::query()->findOrFail($request->id);
            $user->name = $request->name;
            $user->email = $request->email;
            $user->role = $request->role;
            $user->admin_that_branch = $request->admin_that_branch;
            $user->save();
            UserAccessMenu::query()->where('user_code', $user->user_code)->delete();
            foreach ($request->menu_access as $key => $value) {
                UserAccessMenu::query()->create([
                    'user_code' => $user->user_code,
                    'menu_code' => $value['menu_code']
                ]);
            }
            DB::commit();
            return redirect()->route('userManage.edit', ['user_code' => $request->user_code])
                ->with('success', 'อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getLine() . $e->getFile());
            DB::rollBack();
            return redirect()->route('userManage.edit', ['user_code' => $request->user_code])
                ->with('error', 'ไม่สามารถบันทึกข้อมูลได้');
        }
    }

    public function delete($user_code): JsonResponse
    {
        $user = User::query()->where('user_code', $user_code)->first();
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
