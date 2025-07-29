<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmpRequest;
use App\Models\ListMenu;
use App\Models\User;
use App\Models\UserAccessMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->leftJoin('store_information', 'users.is_code_cust_id', '=', 'store_information.is_code_cust_id')
            ->where('users.is_code_cust_id', Auth::user()->is_code_cust_id)
            ->select('users.*', 'store_information.shop_name')
            ->orderBy('users.id', 'desc')
            ->get();
        return Inertia::render('Stores/Users/UserList', ['users' => $users]);
    }

    public function create() {
        $list_menu = ListMenu::all();
        return Inertia::render('Stores/Users/UserStore',[
            'list_menu' => $list_menu
        ]);
    }

    public function store(EmpRequest $request){
        try{
            DB::beginTransaction();
            $data = $request;
            $user = User::query()->create([
                'user_code' => $data['user_code'],
                'name' => $data['name'],
                'is_code_cust_id' => Auth::user()->is_code_cust_id,
                'role' => 'service',
                'admin_that_branch' => $data['admin_that_branch'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'])
            ]);
            if ($user) {
                $access_menu = $data['access_menu'];
                UserAccessMenu::query()->where('user_code', $data['user_code'])->delete();
                foreach ($access_menu as $key => $value) {
                    if ($value['is_checked']) {
                        $found = UserAccessMenu::query()->where('user_code', $data['user_code'])->where('menu_code', $value['menu_id'])->first();
                        if ($found) {
                            $found->delete();
                        }
                        UserAccessMenu::query()->create([
                            'user_code' => $data['user_code'],
                            'menu_code' => $value['menu_id']
                        ]);
                    }
                }
                DB::commit();
                return redirect()->route('storeUsers.index')->with('success', "บันทึกผู้ใช้สำเร็จ");
            }else throw new \Exception("บันทึกผู้ใช้ไม่สำเร็จ");
        }catch(\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error',$e->getMessage());
        }
        
    }


    public function update(Request $request) {
        try{
            $user = User::query()->where('user_code', $request->user_code)->first();
            if ($user) {
                $user->update([
                    'name' => $request->name,
                    'email' => $request->email,
                    'admin_that_branch' => $request->admin_that_branch,
                ]);
                if ($request->password) {
                    $user->update(['password' => Hash::make($request->password)]);
                }
                return redirect()->back()->with('success', "อัพเดทข้อมูลผู้ใช้ $user->name สำเร็จ");
            } else {
                return redirect()->back()->with('error', "ไม่พบข้อมูลผู้ใช้ $request->user_code");
            }
        }catch(\Exception $e) {
            return redirect()->back()->with('error',$e->getMessage());
        }
    }

    public function delete($user_code)
    {
        try {
            $user = User::query()->where('user_code', $user_code)->first();
            if ($user) {
                $user->delete();
                return redirect()->back()->with('success', "ลบข้อมูลผู้ใช้ $user->name สำเร็จ");
            } else {
                return redirect()->back()->with('error', "ไม่พบข้อมูลผู้ใช้ $user_code");
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
