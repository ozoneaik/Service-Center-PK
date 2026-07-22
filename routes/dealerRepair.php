<?php

use App\Http\Controllers\DealerRepair\DealerJobController;
use App\Http\Controllers\DealerRepair\DealerOrderController;
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
use App\Http\Controllers\Orders\OrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('dealer-repair')->middleware(['dealerAccess'])->group(function () {

    // หน้าหลัก + ประวัติ
    Route::get('/', [DealerSearchController::class, 'index'])->name('dealerRepair.index');
    Route::get('/history', [DealerSearchController::class, 'history'])->name('dealerRepair.history');
    Route::get('/dealer-list', [DealerSearchController::class, 'dealerList'])->name('dealerRepair.dealer.list')->withoutMiddleware(['dealerAccess', 'menuAccess']);

    Route::withoutMiddleware('menuAccess')->group(function () {

        // สั่งซื้ออะไหล่สำหรับ dealer (ใช้ราคา disc40p)
        Route::prefix('/orders')->group(function () {
            Route::get('/', [DealerOrderController::class, 'index'])->name('dealerRepair.orders.diagram');
            Route::get('/search-sp', [DealerOrderController::class, 'searchSpJson'])->name('dealerRepair.orders.searchSp');
            Route::get('/carts/json', [DealerOrderController::class, 'cartListJson'])->name('dealerRepair.orders.carts.json');
            Route::post('/carts/add-cart', [OrderController::class, 'addCart'])->name('dealerRepair.orders.addCart');
            Route::post('/carts/add-remove/{condition}', [OrderController::class, 'AddOrRemoveQtySp'])->name('dealerRepair.orders.AddOrRemoveQtySp');
            Route::delete('/carts/delete/{id}', [OrderController::class, 'deleteCart'])->name('dealerRepair.orders.deleteCart');
            Route::post('/carts/store', [DealerOrderController::class, 'createOrder'])->name('dealerRepair.orders.createOrder');
            Route::post('/carts/export-pdf', [OrderController::class, 'exportPdfFromCart'])->name('dealerRepair.orders.exportPdf');
            Route::get('/history', [DealerOrderController::class, 'history'])->name('dealerRepair.orders.history');
            Route::get('/history/{order_id}', [DealerOrderController::class, 'historyDetail'])->name('dealerRepair.orders.historyDetail');
        });

        // ตรวจสอบไดอะแกรม (ดูได้อย่างเดียว ไม่มีการสั่งซื้อ)
        Route::get('/check-diagram', fn() => Inertia::render('Orders/CheckDiagram'))->name('dealerRepair.orders.checkDiagram');

        // ค้นหาสินค้า — ใช้ endpoint เดิมได้เลย (logic เหมือนกัน)
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

            // before-repair — reuse ของเดิม
            Route::prefix('/before-repair')->group(function () {
                Route::get('/', [RpBfController::class, 'index'])->name('dealerRepair.before.index');
                Route::post('/', [RpBfController::class, 'store'])->name('dealerRepair.before.store');
                Route::post('/work-receipt', [RpBfController::class, 'WorkReceipt'])->name('dealerRepair.before.work.receipt');
                Route::get('/check-phone', [RpBfController::class, 'checkPhone'])->name('dealerRepair.check.phone');
            });

            // after-repair — reuse ของเดิม
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
