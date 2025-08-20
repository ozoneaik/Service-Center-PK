<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShopRequest;
use App\Models\StoreInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function store(ShopRequest $request): RedirectResponse
    {
        $data = $request;
        try {
            DB::beginTransaction();
            $store_all = StoreInformation::all();
            $random_digit = 0000;
            foreach ($store_all as $key => $store) {
                $random_digit = rand(1000, 9999);
                // เช็คว่า มี digit นี้ใน database รึยัง
                if (!StoreInformation::query()->where('digit_code', $random_digit)->exists()) {
                    break;
                }
            }
            $store = StoreInformation::query()->create([
                'is_code_cust_id' => $data['is_code_cust_id'],
                'shop_name' => $data['shop_name'],
                'phone' => $data['phone'],
                'address' => $data['full_address'],
                'address_sub' => $data['address'],
                'province' => $data['province'],
                'district' => $data['district'],
                'sub_district' => $data['subdistrict'],
                'sale_id' => $data['sale_id'],
                'line_id' => $data['line_id'] ?? null,
                'digit_code' => $random_digit
            ]);
            DB::commit();
            return Redirect::route('stockSp.shopList', [
                'store' => $store
            ])->with('success', 'บันทึกข้อมูลเสร็จสิ้น');
        } catch (\Exception $e) {
            DB::rollback();
            return Redirect::route('stockSp.shopList', [
                'store' => []
            ])->with('error', $e->getMessage());
        }
    }

    public function edit($id): Response
    {
        $store = StoreInformation::query()->findOrFail($id);
        return Inertia::render('Stores/Manage/EditStore',[
            'store' => $store
        ]);
    }

    public function searchStoreById($is_code_cust_id): JsonResponse
    {
        $store = StoreInformation::query()->where('is_code_cust_id',$is_code_cust_id)->first();
        if ($store) {
            return response()->json([
                'message' => 'เจอข้อมูลร้าน',
                'store' => $store
            ]);
        }else{
            return response()->json([
                'message' => 'ไม่เจอข้อมูลร้าน',
                'store' => []
            ],404);
        }
    }
}
