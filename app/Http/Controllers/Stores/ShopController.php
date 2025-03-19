<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShopRequest;
use App\Models\StoreInformation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class ShopController extends Controller
{
    public function store(ShopRequest $request)
    {
        $data = $request;

        try {
            DB::beginTransaction();
            $store = StoreInformation::query()->create([
                'is_code_cust_id' => $data['is_code_cust_id'],
                'shop_name' => $data['shop_name'],
                'phone' => $data['phone'],
                'address' => $data['full_address'],
                'address_sub' => $data['address'],
                'province' => $data['province'],
                'district' => $data['district'],
                'sub_district' => $data['subdistrict']
            ]);
            DB::commit();
            return Redirect::route('stockSp.shopList', [
                'store' => $store
            ])->with('success', 'บันทึกข้อมูลเสร็จสิ้น');
        } catch (\Exception $e) {
            DB::rollback();
            return Redirect::route('stockSp.shopList', [
                'store' => []
            ])->with('error', 'บันทึกข้อมูลไม่สำเร็จ');
        }
    }

    public function searchStoreById($is_code_cust_id){
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
