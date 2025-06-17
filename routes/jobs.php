<?php

use App\Http\Controllers\genQuPdfController;
use App\Http\Controllers\NewRepair\After\RpAfBehaviourController;
use App\Http\Controllers\NewRepair\After\RpAfController;
use App\Http\Controllers\NewRepair\After\RpAfFileUploadController;
use App\Http\Controllers\NewRepair\After\RpAfQuController;
use App\Http\Controllers\NewRepair\After\RpAfSpSparePartController;
use App\Http\Controllers\NewRepair\After\RpAfSummaryController;
use App\Http\Controllers\NewRepair\Before\RpBfController;
use App\Http\Controllers\NewRepair\JobController;
use App\Http\Controllers\NewRepair\SearchController;
use App\Http\Controllers\SendJob\sendJobController;
use Illuminate\Support\Facades\Route;

// route การแจ้งซ่อมแบบใหม่
Route::prefix('repair')->group(function () {
    Route::get('/', [SearchController::class, 'index'])->name('repair.index');
    Route::post('/search', [SearchController::class, 'search'])->name('repair.search');

    // ค้นหา job สร้าง job
    Route::post('/search-job', [JobController::class, 'searchJob'])->name('repair.search.job');

    Route::prefix('job')->group(function () {
        Route::post('/store', [JobController::class, 'storeJob'])->name('repair.store');
        Route::post('/close-repair',[JobController::class, 'closeJob'])->name('close-repair');
        Route::post('/cancel-repair',[JobController::class, 'cancelJob'])->name('cancel-repair');

        Route::prefix('before-repair')->group(function () {
           Route::get('/',[RpBfController::class,'index'])->name('repair.before.index');
           Route::post('/',[RpBfController::class,'store'])->name('repair.before.store');
           Route::post('/work-receipt',[RpBfController::class,'WorkReceipt'])->name('repair.before.work.receipt');
        });

        Route::prefix('after-repair')->group(function () {
            Route::get('/',[RpAfController::class,'index'])->name('repair.after');
            Route::prefix('/behaviour')->group(function () {
                Route::get('/',[RpAfBehaviourController::class,'index'])->name('repair.after.behaviour.index');
                Route::post('/',[RpAfBehaviourController::class,'store'])->name('repair.after.behaviour.store');
            });
            Route::prefix('/spare-part')->group(function () {
               Route::get('/',[RpAfSpSparePartController::class,'index'])->name('repair.after.spare-part.index');
               Route::post('/',[RpAfSpSparePartController::class,'store'])->name('repair.after.spare-part.store');
            });

            Route::prefix('/qu')->group(function() {
//               Route::get('/',[RpAfQuController::class,'index'])->name('repair.after.qu.index');
               Route::post('/',[RpAfQuController::class,'store'])->name('repair.after.qu.store');
            });

            Route::post('/gen-qu',[RpAfQuController::class,'index'])->name('repair.after.qu.index');

            Route::prefix('/file-upload')->group(function () {
                Route::get('/',[RpAfFileUploadController::class,'index'])->name('repair.after.file-upload.index');
                Route::post('/',[RpAfFileUploadController::class,'store'])->name('repair.after.file-upload.store');
            });

            Route::prefix('/summary')->group(function () {
                Route::get('/',[RpAfSummaryController::class,'index'])->name('repair.after.summary.index');
            });
        });
    });
});

Route::prefix('send-job')->group(function () {
    Route::get('/list', [sendJobController::class, 'sendJobList'])->name('sendJobs.list');
    Route::post('/update', [sendJobController::class, 'updateJobSelect'])->name('sendJobs.update');
    Route::get('/doc', [sendJobController::class, 'docJobList'])->name('sendJobs.docJobList');


    Route::get('/group-detail/{job_group}', [sendJobController::class, 'groupDetail'])->name('sendJobs.groupDetail');
    Route::get('/print/{job_group}', [sendJobController::class, 'printJobList'])->name('sendJobs.printJobList');
});

Route::get('/genReCieveSpPdf/{job_id}',[genQuPdfController::class,'genReCieveSpPdf'])->name('genReCieveSpPdf');
