<?php

use App\Http\Controllers\Admin\JobFromServiceController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\Skus\SkuController;
use App\Http\Controllers\Admin\StartUpCostController;
use App\Http\Controllers\Admin\WarrantyController;
use App\Http\Controllers\ScoreMasterController;
use Illuminate\Support\Facades\Route;

Route::middleware('adminPermission')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::prefix('sales')->group(function () {
            Route::get('/index', [SaleController::class, 'index'])->name('Sales.index');
            Route::get('/create', [SaleController::class, 'create'])->name('Sales.create');
            Route::post('/store', [SaleController::class, 'store'])->name('Sales.store');
            Route::put('/update/{id}', [SaleController::class, 'update'])->name('Sales.update');
            Route::delete('/destroy/{sale_code}', [SaleController::class, 'destroy'])->name('Sales.destroy');
        });
        Route::prefix('scores')->group(function () {
            Route::prefix('master')->group(function () {
                Route::get('/list', [ScoreMasterController::class, 'index'])->name('ScoreMaster.index');
                Route::get('/create', [ScoreMasterController::class, 'create'])->name('ScoreMaster.create');
                Route::post('/store', [ScoreMasterController::class, 'store'])->name('ScoreMaster.store');
                Route::put('/update/{id}', [ScoreMasterController::class, 'update'])->name('ScoreMaster.update');
                Route::delete('/delete/{id}', [ScoreMasterController::class, 'delete'])->name('ScoreMaster.delete');
            });
            Route::get('/list',[ScoreMasterController::class,'indexSku'])->name('ScoreSku.index');
            Route::get('/create',[ScoreMasterController::class,'createSku'])->name('ScoreSku.create');
            Route::get('/store',[ScoreMasterController::class,'storeSku'])->name('ScoreSku.store');
            Route::put('/update/{id}',[ScoreMasterController::class,'updateSku'])->name('ScoreSku.update');
            Route::delete('/delete/{id}',[ScoreMasterController::class,'deleteSku'])->name('ScoreSku.delete');
        });
        Route::prefix('job-form-service')->group(function () {
           Route::get('/list',[JobFromServiceController::class,'index'])->name('JobFormService.index');
           Route::get('/detail/{job_id}',[JobFromServiceController::class,'detail'])->name('JobFormService.detail');
           Route::put('/update/{job_id}',[JobFromServiceController::class,'update'])->name('JobFormService.update');
        });

        Route::prefix('start-up-cost')->group(function(){
            Route::get('/',[StartUpCostController::class,'index'])->name('startUpCost.index');
            Route::get('/create',[StartUpCostController::class,'create'])->name('startUpCost.create');
            Route::post('/store',[StartUpCostController::class,'store'])->name('startUpCost.store');
            Route::delete('/delete/{id}',[StartUpCostController::class,'delete'])->name('startUpCost.delete');
        });

        Route::prefix('warranties')->group(function () {
            Route::get('/',[WarrantyController::class,'index'])->name('admin.warranties.index');
        });

        Route::prefix('skus')->group(function () {
           Route::get('/',[SkuController::class,'productList'])->name('admin.skus.product.list');
           Route::get('/detail/{sku_fg}/{model_fg}', [SkuController::class,'productDetail'])->name('admin.skus.detail');
        });
    });
});
