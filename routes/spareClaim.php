<?php

use App\Http\Controllers\AccountingReturnController;
use App\Http\Controllers\ClaimSpManage\ClaimSpController;
use App\Http\Controllers\SpareClaimController;
use Illuminate\Support\Facades\Route;

Route::prefix('spare-claim')->group(function () {
    Route::get('/index', [SpareClaimController::class, 'index'])->name('spareClaim.index');
    Route::get('/history', [SpareClaimController::class, 'historyShow'])->name('spareClaim.history');
    Route::get('/history/detail/{claim_id}', [SpareClaimController::class, 'historyDetail'])->name('spareClaim.historyDetail');
    Route::get('/pending', [SpareClaimController::class, 'pendingShow'])->name('spareClaim.pending');
    Route::post('/store', [SpareClaimController::class, 'store'])->name('spareClaim.store');
    Route::post('/receive-update', [SpareClaimController::class, 'updateReceiveStatus'])->name('spareClaim.updateReceiveStatus');
});

Route::prefix('accounting/spare-return')->name('accounting.return.')->group(function () {
    Route::get('/', [AccountingReturnController::class, 'index'])->name('index');
    Route::post('/confirm', [AccountingReturnController::class, 'confirm'])->name('confirm');
});

Route::middleware('adminPermission')->group(function(){
    Route::prefix('admin')->group(function(){
        Route::prefix('claimSP')->group(function(){
            Route::get('/index/{status}',[ClaimSpController::class,'index'])->name('claimSP.index');
            Route::get('/detail/{claim_id}',[ClaimSpController::class,'detail'])->name('claimSP.detail');
            Route::put('/update-by-sp-id/{claimDetail_id}/{status}',[ClaimSpController::class,'updateByIdSp'])->name('claimSP.updateByIdSp');
            Route::put('/update-all/{claim_id}/{status}',[ClaimSpController::class,'updateAll'])->name('claimSP.updateAll');
        });
    });
});
