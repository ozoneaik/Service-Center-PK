<?php

namespace App\Http\Controllers\Stocks;

use App\Http\Controllers\Controller;
use App\Models\StoreInformation;
use Inertia\Inertia;

class StockSpController extends Controller
{
    public function index(){
        $shops = StoreInformation::all();
        return Inertia::render('StockSpPage/Manage/StockSpByShop',['shops' => $shops]);
    }
}
