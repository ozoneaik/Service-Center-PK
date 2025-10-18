<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShopRequest;
use App\Models\SaleInformation;
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
        $store->subdistrict = $store->sub_district;

        $sales = SaleInformation::query()
            ->select('id', 'sale_code', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Stores/Manage/EditStore', [
            'store' => $store,
            'sales' => $sales
        ]);
    }

    public function searchStoreById($is_code_cust_id): JsonResponse
    {
        $store = StoreInformation::query()->where('is_code_cust_id', $is_code_cust_id)->first();
        if ($store) {
            return response()->json([
                'message' => 'เจอข้อมูลร้าน',
                'store' => $store
            ]);
        } else {
            return response()->json([
                'message' => 'ไม่เจอข้อมูลร้าน',
                'store' => []
            ], 404);
        }
    }

    public function create(): Response
    {
        $sales = SaleInformation::query()
            ->select('id', 'sale_code', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Stores/Manage/AddStore', [
            'sales' => $sales
        ]);
    }

    public function update(ShopRequest $request, $id): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $store = StoreInformation::query()->findOrFail($id);

            $store->update([
                // 'is_code_cust_id' => $request['is_code_cust_id'],
                'shop_name'       => $request['shop_name'],
                'phone'           => $request['phone'],
                'address'         => $request['full_address'],
                'address_sub'     => $request['address_sub'],
                'province'        => $request['province'],
                'district'        => $request['district'],
                'subdistrict'    => $request['subdistrict'],
                'sale_id'         => $request['sale_id'],
                'line_id'         => $request->line_id ?? null,
            ]);

            DB::commit();
            return Redirect::route('stockSp.shopList')
                ->with('success', 'อัพเดทข้อมูลร้านเรียบร้อยแล้ว');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()->with('error', $e->getMessage());
        }
    }
}