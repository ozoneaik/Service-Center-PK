<?php

use App\Http\Controllers\Orders\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('orders')->group(function () {
    Route::get('/list', [OrderController::class, 'index'])->name('orders.list');
    Route::get('/search/{sku}', [OrderController::class, 'search'])->name('orders.search');
    Route::get('/history', [OrderController::class, 'history'])->name('orders.history');
    Route::get('/history-detail/{order_id}', [OrderController::class, 'historyDetail'])->name('orders.historyDetail');
    Route::get('/success', [OrderController::class, 'orderSuccess'])->name('orders.success');


//    Cart Route
    Route::get('/carts',[OrderController::class,'cartList'])->name('orders.carts');
    Route::post('/carts/add-remove/{condition}',[OrderController::class,'AddOrRemoveQtySp'])->name('orders.AddOrRemoveQtySp');
    Route::post('/carts/add-cart',[OrderController::class,'addCart'])->name('orders.addCart');
    Route::post('/carts/store',[OrderController::class,'createOrder'])->name('orders.createOrder');
    Route::delete('/carts/delete/{id}',[OrderController::class,'deleteCart'])->name('orders.deleteCart');
});
