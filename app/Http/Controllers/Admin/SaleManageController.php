<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\MenuAccess;
use App\Http\Requests\EmpRequest;
use App\Models\ListMenu;
use App\Models\SaleInformation;
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

class SaleManageController extends Controller
{
    public function edit($user_code): Response
    {
        $user = User::query()->where('user_code', $user_code)->with('store_info')->firstOrFail(); // ใช้ firstOrFail เพื่อจัดการกรณีไม่พบ
        $menu_access = UserAccessMenu::query()->where('user_code', $user_code)->get();
        $list_all_menu = ListMenu::all();

        if ($user->role === 'sale') {
            return Inertia::render('Admin/Users/UserEditSale', [
                'user' => $user,
                'menu_access' => $menu_access,
                'list_all_menu' => $list_all_menu,
                'sale_info' => SaleInformation::query()->where('sale_code', $user->user_code)->first(), // ดึงข้อมูล Sale เพิ่มเติม
            ]);
        }

        // สำหรับ Admin, Service, Dealer (ผู้ใช้ร้านค้า)
        return Inertia::render('Admin/Users/UserEdit', [
            'user' => $user,
            'menu_access' => $menu_access,
            'list_all_menu' => $list_all_menu
        ]);
    }

    //create sale
    public function createSale(): Response
    {
        $menu_list = ListMenu::all();
        return Inertia::render('Admin/Users/UserCreateSale', ['menu_list' => $menu_list]);
    }

    public function search(Request $request)
    {
        $sale = SaleInformation::query()->where('sale_code', $request->sale_code)->first();
        return response()->json([
            'sale' => $sale
        ]);
    }

    public function storeSale(Request $request): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'user_code' => ['required', 'string', 'max:255', 'unique:users,user_code'],
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'confirmed', 'min:6'],
            ], [
                'user_code.unique' => "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว",
                'name.required' => "กรุณากรอกชื่อ-สกุล",
                'email.required' => "กรุณากรอกอีเมล", 
                'email.unique' => "อีเมลนี้ถูกใช้งานแล้ว",
                'email.email' => "รูปแบบอีเมลไม่ถูกต้อง",
                'password.confirmed' => "รหัสผ่านไม่ตรงกัน",
                'password.required' => "กรุณากรอกรหัสผ่าน",
                'password.min' => "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
            ]);

            $data = $request;
            $user = User::query()->create([
                'user_code' => $data['user_code'],
                'name' => $data['name'],
                'is_code_cust_id' => null,
                'role' => 'sale',
                'admin_that_branch' => false,
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
                return Redirect::route('userManage.list')->with('success', 'บันทึกผู้ใช้ Sale สำเร็จ');
            } else {
                throw new \Exception('ไม่สามารถสร้างผู้ใช้ได้');
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error in storeSale (General Exception): " . $e->getMessage());
            return Redirect::route('saleManage.createSale')->with('error', 'บันทึกผู้ใช้ Sale ไม่สำเร็จ: ' . $e->getMessage());
        }
    }

    public function updateSale(Request $request): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $request->id,
                'password' => 'nullable|confirmed|min:6',
            ]);

            $user = User::query()->findOrFail($request->id);
            $user->name = $request->name;
            $user->email = $request->email;
            $user->role = 'sale';

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }
            $user->save();

            UserAccessMenu::query()->where('user_code', $user->user_code)->delete();
            foreach ($request->menu_access as $value) {
                if (isset($value['is_checked']) && $value['is_checked']) {
                    UserAccessMenu::query()->create([
                        'user_code' => $user->user_code,
                        'menu_code' => $value['menu_id']
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('userManage.list', ['user_code' => $user->user_code])
                ->with('success', 'อัพเดทข้อมูลผู้ใช้ Sale เรียบร้อยแล้ว');
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getLine() . $e->getFile());
            DB::rollBack();
            return redirect()->route('saleManage.edit', ['user_code' => $request->user_code])
                ->with('error', 'ไม่สามารถบันทึกข้อมูลได้');
        }
    }
}
