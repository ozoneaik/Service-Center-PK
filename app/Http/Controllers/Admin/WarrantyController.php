<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WarrantyProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarrantyController extends Controller
{
    public function index(Request $request){
        $query = WarrantyProduct::query()->leftJoin('store_information as store','store.is_code_cust_id','=','warranty_products.user_is_code_id');
        $warranties = $query->select('warranty_products.*','store.shop_name')->paginate(100);
        return Inertia::render('Admin/Warranties/WrList',[
            'warranties' => $warranties,
        ]);
    }
}
