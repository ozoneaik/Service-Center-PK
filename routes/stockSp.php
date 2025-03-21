<?php

use App\Http\Controllers\Stores\ShopController;
use App\Http\Controllers\Stores\StockSpController;
use Illuminate\Support\Facades\Route;

Route::prefix('/stock-sp')->group(function(){
    Route::get('/shopList',[StockSpController::class,'index'])->name('stockSp.shopList')->middleware('adminPermission');
    Route::post('/shopStore',[ShopController::class,'store'])->name('shop.store');
    Route::get('/store-search/{is_code_cust_id}',[ShopController::class,'searchStoreById'])->name('shop.search');
    Route::get('/shop/{is_code_cust_id}',[StockSpController::class,'StockSpList'])->name('stockSp.list');
    Route::post('/store-one-sp',[StockSpController::class,'storeOneSp'])->name('stockSp.storeOneSp');
    Route::get('/search/{sp_code}/{is_code_cust_id}',[StockSpController::class,'searchSku'])->name('stockSp.searchSku');
    Route::post('/store-many-sp',[StockSpController::class,'storeManySp'])->name('stockSp.storeManySp');
});