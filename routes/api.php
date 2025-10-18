<?php

use App\Http\Controllers\Api\GeneralController;
use Illuminate\Http\Request;
use App\Http\Controllers\ClosedController;
use App\Http\Controllers\Orders\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/test',function(){
    return response()->json(['test' => 'ok']);
});

Route::post('/job_detail', [GeneralController::class,'index'])->name('api.get-job');

Route::get('/getgroup', [ClosedController::class, 'getGroups'])->name('api.get-group');

Route::get('/orders/all-status-orders', [OrderController::class, 'getAllStatusOrders']);
Route::post('/orders/update-status', [OrderController::class, 'updateOrderStatusFromNode']);