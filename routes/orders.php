<?php

use App\Http\Controllers\Orders\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('orders')->group(function () {
    Route::get('/list', [OrderController::class, 'index'])->name('orders.list');
    Route::get('/search/{sku}', [OrderController::class, 'search'])->name('orders.search');
    Route::post('/store', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/history', [OrderController::class, 'history'])->name('orders.history');
    Route::get('/history-detail/{order_id}', [OrderController::class, 'historyDetail'])->name('orders.historyDetail');
    Route::get('/success', [OrderController::class, 'orderSuccess'])->name('orders.success');
});