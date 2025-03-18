<?php

use App\Http\Controllers\Stocks\StockSpController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('/stock-sp')->group(function(){
    Route::get('/shopList',[StockSpController::class,'index'])->name('stockSp.shopList')->middleware('adminPermission');
    Route::get('/shop/{is_code_cust_id}',[StockSpController::class,'StockSpList'])->name('stockSp.list');
});