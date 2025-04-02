<?php

use App\Http\Controllers\Stocks\StockJobController;
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

Route::prefix('/stock-job')->group(function(){
    Route::get('/index', [StockJobController::class,'index'])->name('stockJob.index');
    Route::post('/store', [StockJobController::class,'store'])->name('stockJob.store');
    Route::get('/add-sp/{stock_job_id}', [StockJobController::class,'addSp'])->name('stockJob.addSp');
    Route::delete('/delete-sp/{stock_job_id}/{sp_code}', [StockJobController::class,'deleteSp'])->name('stockJob.deleteSp');
    Route::post('/end-job/{stock_job_id}',[StockJobController::class,'endSpInJob'])->name('stockJob.endSpInJob');
    Route::post('/store-sp/{stock_job_id}', [StockJobController::class,'addSpInJob'])->name('stockJob.addSpInJob');
    Route::delete('/delete/{stock_job_id}',[StockJobController::class,'delete'])->name('stockJob.delete');
});


Route::get('/get-sp/{barcode}',[StockJobController::class,'bill'])->name('getSp');
