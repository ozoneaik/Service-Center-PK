<?php

namespace App\Http\Controllers\Stocks;

use App\Http\Controllers\Controller;
use App\Models\StockSparePart;
use App\Models\StoreInformation;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockSpController extends Controller
{
    public function index(){
        $shops = StoreInformation::query()->with('gp')
        ->leftJoin('users', 'users.is_code_cust_id', '=', 'store_information.is_code_cust_id')
        ->select('store_information.*', DB::raw('COUNT(users.id) as count_user'))
        ->groupBy('store_information.id') 
        ->get();
        return Inertia::render('Stores/Manage/StoreList',['shops' => $shops]);
    }

    public function StockSpList ($is_code_cust_id) {
        $stocks = StockSparePart::query()->where('is_code_cust_id',$is_code_cust_id)->get();
        $store = StoreInformation::query()->where('is_code_cust_id',$is_code_cust_id)->first();
        return Inertia::render('Stores/StockSpList',['stocks' => $stocks,'store'=>$store]);
    }

}
