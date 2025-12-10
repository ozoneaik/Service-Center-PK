<?php

use App\Http\Controllers\Orders\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('orders')->group(function () {
    Route::get('/list', [OrderController::class, 'index'])->name('orders.list');
    // Route::get('/search', [OrderController::class, 'search'])->name('orders.search');
    Route::get('/history', [OrderController::class, 'history'])->name('orders.history');
    Route::get('/history-detail/{order_id}', [OrderController::class, 'historyDetail'])->name('orders.historyDetail');
    Route::get('/success/{message}', [OrderController::class, 'orderSuccess'])->name('orders.success');

    // Route::get('/check-status/{order_id}', [OrderController::class,'checkStatusOrder'])->name('orders.checkStatusOrder');
    Route::post('/check-status', [OrderController::class, 'checkStatusOrder'])->name('orders.checkStatusOrder');
    // Route::get('/all-status-orders', [OrderController::class, 'getAllStatusOrders']);
    // Route::post('/update-status', [OrderController::class, 'updateOrderStatusFromNode']);

//    Cart Route
    Route::get('/carts',[OrderController::class,'cartList'])->name('orders.carts');
    Route::post('/carts/add-remove/{condition}',[OrderController::class,'AddOrRemoveQtySp'])->name('orders.AddOrRemoveQtySp');
    Route::post('/carts/add-cart',[OrderController::class,'addCart'])->name('orders.addCart');
    Route::post('/carts/store',[OrderController::class,'createOrder'])->name('orders.createOrder');
    Route::delete('/carts/delete/{id}',[OrderController::class,'deleteCart'])->name('orders.deleteCart');
    // Route::post('/export-pdf-cart', [OrderController::class, 'exportPdfFromCart'])->name('orders.exportPdfCart');
    Route::post('/orders/export-pdf-cart', [OrderController::class, 'exportPdfFromCart'])->name('orders.export.pdf');
});
