<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ListMenu;
                                                                                                                                                                                                                                                                 use App\Models\SaleInformation;
use App\Models\StoreInformation;
use App\Models\User;
use App\Models\UserAccessMenu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DealerShopController extends Controller
{
    public function index(): Response
    {
        $shops = StoreInformation::where('shop_type', 'dealer')
            ->get()
            ->map(function ($shop) {
                $shop->dealer_users = User::where('is_code_cust_id', $shop->is_code_cust_id)
                    ->where('role', 'dealer')
                    ->get(['id', 'user_code', 'name', 'email']);
                return $shop;
            });

        return Inertia::render('Admin/DealerShops/DealerShopList', [
            'shops' => $shops,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/DealerShops/DealerShopCreate', [
            'sale_list' => SaleInformation::orderBy('name')->get(['sale_code', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'is_code_cust_id' => 'required|string|max:50|unique:store_information,is_code_cust_id',
            'shop_name'        => 'required|string|max:255',
            'phone'            => 'required|string|max:20',
            'address'          => 'required|string',
            'sale_id'          => 'nullable|string|exists:sale_information,sale_code',
            'user_code'        => 'required|string|max:100|unique:users,user_code',
            'name'             => 'required|string|max:255',
            'email'            => 'required|string|max:255|unique:users,email',
            'password'         => 'required|string|min:6|confirmed',
        ], [
            'is_code_cust_id.unique' => 'รหัสร้านค้านี้มีในระบบแล้ว',
            'user_code.unique'       => 'ชื่อผู้ใช้นี้มีในระบบแล้ว',
            'email.unique'           => 'อีเมลนี้มีในระบบแล้ว',
            'password.confirmed'     => 'รหัสผ่านไม่ตรงกัน',
            'password.min'           => 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        ]);

        try {
            DB::beginTransaction();

            StoreInformation::create([
                'is_code_cust_id' => $request->is_code_cust_id,
                'shop_name'       => $request->shop_name,
                'phone'           => $request->phone,
                'address'         => $request->address,
                'sale_id'         => $request->sale_id ?: null,
                'digit_code'      => $this->generateDigitCode(),
                'shop_type'       => 'dealer',
            ]);

            User::create([
                'user_code'        => $request->user_code,
                'name'             => $request->name,
                'email'            => $request->email,
                'password'         => Hash::make($request->password),
                'role'             => 'dealer',
                'is_code_cust_id'  => $request->is_code_cust_id,
                'admin_that_branch' => false,
            ]);

            // กำหนดสิทธิ์เมนู dealer repair ให้อัตโนมัติ
            $dealerMenuIds = ListMenu::where('group', 10)->pluck('id');
            foreach ($dealerMenuIds as $menuId) {
                UserAccessMenu::create([
                    'user_code'  => $request->user_code,
                    'menu_code'  => $menuId,
                ]);
            }

            DB::commit();
            return redirect()->route('admin.dealer-shops.index')
                ->with('success', "สร้างร้านค้า \"{$request->shop_name}\" และผู้ใช้สำเร็จ");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('DealerShopController::store - ' . $e->getMessage());
            return back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()])->withInput();
        }
    }

    public function lookupCust(string $custId): JsonResponse
    {
        try {
            $cust = DB::connection('dbctl')
                ->table('cust_master')
                ->where('CustID', $custId)
                ->first();

            if (!$cust) {
                return response()->json(['found' => false]);
            }

            return response()->json([
                'found'     => true,
                'shop_name' => $cust->CustName ?? '',
                'phone'     => $cust->ContactPhone ?? '',
                'address'   => trim(
                    collect([
                        $cust->InvAddr1 ?? '',
                        $cust->InvAddr2 ?? '',
                        $cust->InvAddr3 ?? '',
                        $cust->InvAddr4 ?? '',
                    ])->filter()->implode(' ')
                ),
            ]);
        } catch (\Exception $e) {
            Log::error('DealerShopController::lookupCust - ' . $e->getMessage());
            return response()->json(['found' => false, 'error' => 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้'], 500);
        }
    }

    private function generateDigitCode(): int
    {
        do {
            $code = rand(1000, 9999);
        } while (StoreInformation::where('digit_code', $code)->exists());
        return $code;
    }
}
