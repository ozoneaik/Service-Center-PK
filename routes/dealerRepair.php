<?php

use App\Http\Controllers\DealerRepair\DealerJobController;
use App\Http\Controllers\DealerRepair\DealerSearchController;
use App\Http\Controllers\DealerRepair\DealerSendJobController;
use App\Http\Controllers\NewRepair\After\RpAfBehaviourController;
use App\Http\Controllers\NewRepair\After\RpAfController;
use App\Http\Controllers\NewRepair\After\RpAfFileUploadController;
use App\Http\Controllers\NewRepair\After\RpAfQuController;
use App\Http\Controllers\NewRepair\After\RpAfSpSparePartController;
use App\Http\Controllers\NewRepair\After\RpAfSummaryController;
use App\Http\Controllers\NewRepair\Before\RpBfController;
use App\Http\Controllers\NewRepair\SearchController;
use Illuminate\Support\Facades\Route;

Route::prefix('dealer-repair')->middleware(['dealerAccess'])->group(function () {

    // หน้าหลัก + ประวัติ — ต้องผ่าน menuAccess ด้วย (เป็น menu item จริง)
    Route::get('/', [DealerSearchController::class, 'index'])->name('dealerRepair.index');
    Route::get('/history', [DealerSearchController::class, 'history'])->name('dealerRepair.history');

    // ทุก endpoint ที่เหลือข้าม menuAccess (dealerAccess ยังทำงานอยู่)
    Route::withoutMiddleware('menuAccess')->group(function () {

        // dealer-list ข้าม dealerAccess ด้วย (controller จัดการ role เอง)
        Route::get('/dealer-list', [DealerSearchController::class, 'dealerList'])
            ->name('dealerRepair.dealer.list')
            ->withoutMiddleware('dealerAccess');

        // ค้นหาสินค้า
        Route::post('/search', [SearchController::class, 'search'])->name('dealerRepair.search');

        // ค้นหา job ที่มีอยู่แล้ว (กรองตาม dealer_code)
        Route::post('/search-job', [DealerJobController::class, 'searchJob'])->name('dealerRepair.search.job');

        // ส่งซ่อมไปยังพัมคิน
        Route::prefix('/send-job')->group(function () {
            Route::get('/', [DealerSendJobController::class, 'sendJobList'])->name('dealerRepair.send.list');
            Route::post('/update', [DealerSendJobController::class, 'updateJobSelect'])->name('dealerRepair.send.update');
            Route::get('/doc', [DealerSendJobController::class, 'docJobList'])->name('dealerRepair.send.doc');
            Route::get('/group-detail/{job_group}', [DealerSendJobController::class, 'groupDetail'])->name('dealerRepair.send.group.detail');
            Route::get('/track', [DealerSendJobController::class, 'trackPage'])->name('dealerRepair.send.track');
            Route::post('/all', [DealerSendJobController::class, 'getAllSendJobs'])->name('dealerRepair.send.all');
            Route::post('/history', [DealerSendJobController::class, 'historySuccessJobs'])->name('dealerRepair.send.history');
            Route::post('/finish', [DealerSendJobController::class, 'finishSendJob'])->name('dealerRepair.send.finish');
            Route::post('/check-status', [DealerSendJobController::class, 'checkJobStatus'])->name('dealerRepair.send.check.status');
            Route::post('/batch-check', [DealerSendJobController::class, 'batchCheckJobStatus'])->name('dealerRepair.send.batch.check');
        });

        Route::prefix('/job')->group(function () {
            Route::post('/store', [DealerJobController::class, 'storeJob'])->name('dealerRepair.store');
            Route::post('/store-from-pid', [DealerJobController::class, 'storeJobFromPid'])->name('dealerRepair.store.from.pid');
            Route::post('/cancel', [DealerJobController::class, 'cancelJob'])->name('dealerRepair.cancel');

            // before-repair
            Route::prefix('/before-repair')->group(function () {
                Route::get('/', [RpBfController::class, 'index'])->name('dealerRepair.before.index');
                Route::post('/', [RpBfController::class, 'store'])->name('dealerRepair.before.store');
                Route::post('/work-receipt', [RpBfController::class, 'WorkReceipt'])->name('dealerRepair.before.work.receipt');
                Route::get('/check-phone', [RpBfController::class, 'checkPhone'])->name('dealerRepair.check.phone');
            });

            // after-repair
            Route::prefix('/after-repair')->group(function () {
                Route::get('/', [RpAfController::class, 'index'])->name('dealerRepair.after');

                Route::prefix('/behaviour')->group(function () {
                    Route::get('/', [RpAfBehaviourController::class, 'index'])->name('dealerRepair.after.behaviour.index');
                    Route::post('/', [RpAfBehaviourController::class, 'store'])->name('dealerRepair.after.behaviour.store');
                });

                Route::prefix('/spare-part')->group(function () {
                    Route::get('/', [RpAfSpSparePartController::class, 'index'])->name('dealerRepair.after.spare-part.index');
                    Route::post('/', [RpAfSpSparePartController::class, 'store'])->name('dealerRepair.after.spare-part.store');
                });

                Route::prefix('/qu')->group(function () {
                    Route::get('/', [RpAfQuController::class, 'index'])->name('dealerRepair.after.qu.index');
                    Route::post('/', [RpAfQuController::class, 'store'])->name('dealerRepair.after.qu.store');
                });

                Route::prefix('/file-upload')->group(function () {
                    Route::get('/', [RpAfFileUploadController::class, 'index'])->name('dealerRepair.after.file-upload.index');
                    Route::post('/', [RpAfFileUploadController::class, 'store'])->name('dealerRepair.after.file-upload.store');
                });

                Route::prefix('/summary')->group(function () {
                    Route::get('/', [RpAfSummaryController::class, 'index'])->name('dealerRepair.after.summary.index');
                });
            });
        });

    });
});
