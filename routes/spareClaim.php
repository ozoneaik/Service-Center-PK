<?php

use App\Http\Controllers\ClaimSpManage\ClaimSpController;
use App\Http\Controllers\SpareClaimController;
use Illuminate\Support\Facades\Route;

Route::prefix('spare-claim')->group(function () {
    Route::get('/index', [SpareClaimController::class, 'index'])->name('spareClaim.index');
    Route::get('/history', [SpareClaimController::class, 'historyShow'])->name('spareClaim.history');
    Route::get('/pending', [SpareClaimController::class, 'pendingShow'])->name('spareClaim.pending');
    Route::post('/store', [SpareClaimController::class, 'store'])->name('spareClaim.store');
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