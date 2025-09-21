<?php

use App\Http\Controllers\GroupStoreController;
use App\Http\Controllers\Stocks\StockJobController;
use App\Http\Controllers\StocksNew\StSpController;
use App\Http\Controllers\Stores\ShopController;
use App\Http\Controllers\Stores\StockSpController;
use App\Models\StockJob;
use Illuminate\Support\Facades\Route;

Route::prefix('/stock-sp')->group(function () {
    Route::get('/shopList', [StockSpController::class, 'index'])->name('stockSp.shopList')->middleware('adminPermission');
    Route::get('/groupList', [GroupStoreController::class, 'index'])->name('stockSp.groupList')->middleware('adminPermission');
    Route::post('/groupStore', [GroupStoreController::class, 'storeGroupStore'])->name('groupStore.store');
    Route::get('/getGroup', [GroupStoreController::class, 'getGroup'])->name('groupStore.getGroup');
    Route::put('/groupStore/{id}', [GroupStoreController::class, 'update']);
    Route::delete('groupStoreDestroy/{id}', [GroupStoreController::class, 'destroy']);
    Route::get('/shopEdit/{id}', [ShopController::class, 'edit'])->name('stockSp.shopEdit')->middleware('adminPermission');
    Route::post('/shopStore', [ShopController::class, 'store'])->name('shop.store');
    Route::get('/store-search/{is_code_cust_id}', [ShopController::class, 'searchStoreById'])->name('shop.search');

    //ดึงข้อมูลสต็อกสินค้าของร้านนั้นๆ
    Route::get('/shop/{is_code_cust_id}', [StockSpController::class, 'StockSpList'])->name('stockSp.list');
    //    Route::get('/shop/{is_code_cust_id}', [StSpController::class, 'index'])->name('stockSp.list');
    Route::get('/search/{sp_code}/{is_code_cust_id}', [StockSpController::class, 'searchSku'])->name('stockSp.searchSku');
    Route::post('/store-many-sp', [StockSpController::class, 'storeManySp'])->name('stockSp.storeManySp');
    Route::get('/count-sp/{sp_code}', [StockSpController::class, 'countSp'])->name('stockSp.countSp');
});

Route::prefix('/stock-job')->group(function () {
    Route::get('/index', [StockJobController::class, 'index'])->name('stockJob.index');
    Route::get('/create/{is_code_cust_id}', [StockJobController::class, 'create'])->name('stockJob.create');
    Route::get('/detail-readonly/{stock_job_id}', [StockJobController::class, 'detailReadonly'])->name('stockJob.detailReadonly');
    Route::post('/store', [StockJobController::class, 'store'])->name('stockJob.store');
    Route::delete('/delete/{stock_job_id}', [StockJobController::class, 'delete'])->name('stockJob.delete');
    Route::delete('/delete/{stock_job_id}', [StockJobController::class, 'destroy'])->name('stockJob.destroy');
});


Route::get('/get-sp/{barcode}', [StockJobController::class, 'bill'])->name('getSp');

Route::post('search-sp/{sp_code}', [StockJobController::class, 'searchSp'])->name('search-sp');
