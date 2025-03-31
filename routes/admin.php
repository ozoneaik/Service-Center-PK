<?php

use App\Http\Controllers\Admin\SaleController;
use Illuminate\Support\Facades\Route;

Route::middleware('adminPermission')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::prefix('sales')->group(function () {
            Route::get('/index', [SaleController::class, 'index'])->name('Sales.index');
            Route::get('/create', [SaleController::class, 'create'])->name('Sales.create');
            Route::post('/store', [SaleController::class, 'store'])->name('Sales.store');
            Route::put('/update', [SaleController::class, 'update'])->name('Sales.update');
            Route::delete('/destroy/{sale_code}', [SaleController::class, 'destroy'])->name('Sales.destroy');
        });
    });
});
