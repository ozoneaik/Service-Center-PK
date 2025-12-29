<?php

use App\Http\Controllers\Api\GeneralController;
use App\Http\Controllers\ApiSpareClaimController;
use Illuminate\Http\Request;
use App\Http\Controllers\ClosedController;
use App\Http\Controllers\Orders\OrderController;
use App\Http\Controllers\SpareClaimController;
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

Route::get('/claims-list', [ApiSpareClaimController::class, 'apiList']);
Route::post('/receive-claim', [ApiSpareClaimController::class, 'apiReceiveUpdate']);
Route::get('/claim-detail/{claim_id}', [ApiSpareClaimController::class, 'apiGetClaimDetail']);
Route::get('/sales-shops', [ApiSpareClaimController::class, 'apiGetShops']);