<?php

use App\Http\Controllers\Admin\MenuFileUploadController;
use App\Http\Controllers\BehaviorController;
use App\Http\Controllers\CustomerInJobController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\NewRepair\After\RpAfBehaviourController;
use App\Http\Controllers\NewRepair\After\RpAfController;
use App\Http\Controllers\NewRepair\After\RpAfFileUploadController;
use App\Http\Controllers\NewRepair\After\RpAfQuController;
use App\Http\Controllers\NewRepair\After\RpAfSpSparePartController;
use App\Http\Controllers\NewRepair\After\RpAfSummaryController;
use App\Http\Controllers\NewRepair\Before\RpBfController;
use App\Http\Controllers\NewRepair\RpAccessoriesController;
use App\Http\Controllers\NewRepair\RpBehaviourController;
use App\Http\Controllers\NewRepair\RpCustomerController;
use App\Http\Controllers\NewRepair\RpRemarkAndSymptomController;
use App\Http\Controllers\NewRepair\RpUploadFileController;
use App\Http\Controllers\RemarkController;
use App\Http\Controllers\SearchBySkuController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SendJob\sendJobController;
use App\Http\Controllers\SparePartController;
use App\Http\Controllers\SymptomController;
use Illuminate\Support\Facades\Route;

// Search from API outsource
Route::post('/search', [SearchController::class, 'detail'])->name('search');
Route::post('/search-from-history', [SearchController::class, 'searchFromHistory'])->name('search-from-history');
Route::post('/search/sku', [SearchBySkuController::class, 'detailSku'])->name('search.sku');

Route::prefix('jobs')->group(function () {
    Route::get('/check/{serial_id}', [JobController::class, 'check'])->name('jobs.check');
    Route::post('/update', [JobController::class, 'update'])->name('jobs.update');
    Route::put('/cancel/{serial_id}', [JobController::class, 'cancelJob'])->name('jobs.cancel');
});
// บันทึกข้อมูลลูกค้า
Route::prefix('customer-in-job')->group(function () {
    Route::post('/store', [CustomerInJobController::class, 'store'])->name('customerInJob.store');
    Route::get('/searchPhone/{phone}', [CustomerInJobController::class, 'searchPhone'])->name('customerInJob.searchPhone');
});
// บันทึกอาการ
Route::prefix('behavior')->group(function () {
    Route::get('/show/{serial_id}', [BehaviorController::class, 'show'])->name('behavior.show');
    Route::post('/store', [BehaviorController::class, 'store'])->name('behavior.store');
});
// Upload File and Menu Upload File
Route::get('/menu-upload-file/show', [MenuFileUploadController::class, 'show'])->name('menuFileUpload.show');
Route::prefix('upload-file')->group(function () {
    Route::get('/list', [FileUploadController::class, 'list'])->name('uploadFile.show');
    Route::post('/store', [FileUploadController::class, 'store'])->name('uploadFile.store');
});
/*--------------------------------------- บันทึกอะไหล่ ---------------------------------------*/
Route::prefix('spare-part')->group(function () {
    Route::get('/show/{serial_id}', [SparePartController::class, 'show'])->name('sparePart.show');
    Route::post('/store', [SparePartController::class, 'store'])->name('sparePart.store');
});
/*--------------------------------------- บันทึกอาการเบื้องต้น ---------------------------------------*/
Route::prefix('symptom')->group(function () {
    Route::post('/store', [SymptomController::class, 'store'])->name('symptom.store');
});
/*--------------------------------------- บันทึกหมายเหตุ ---------------------------------------*/
Route::prefix('remark')->group(function () {
    Route::get('/show/{serial_id}', [RemarkController::class, 'show'])->name('remark.show');
    Route::post('/storeOrUpdate', [RemarkController::class, 'storeOrUpdate'])->name('remark.store');
});

Route::prefix('send-job')->group(function () {
    Route::get('/list', [sendJobController::class, 'sendJobList'])->name('sendJobs.list');
    Route::post('/update', [sendJobController::class, 'updateJobSelect'])->name('sendJobs.update');
    Route::get('/doc', [sendJobController::class, 'docJobList'])->name('sendJobs.docJobList');


    Route::get('/group-detail/{job_group}', [sendJobController::class, 'groupDetail'])->name('sendJobs.groupDetail');
    Route::get('/print/{job_group}', [sendJobController::class, 'printJobList'])->name('sendJobs.printJobList');
});


// route การแจ้งซ่อมแบบใหม่
Route::prefix('repair')->group(function () {
    Route::get('/', [\App\Http\Controllers\NewRepair\SearchController::class, 'index'])->name('repair.index');
    Route::post('/search', [\App\Http\Controllers\NewRepair\SearchController::class, 'search'])->name('repair.search');

    // ค้นหา job สร้าง job
    Route::post('/search-job', [\App\Http\Controllers\NewRepair\JobController::class, 'searchJob'])->name('repair.search.job');

    Route::prefix('job')->group(function () {
        Route::post('/store', [\App\Http\Controllers\NewRepair\JobController::class, 'storeJob'])->name('repair.store');
        Route::post('/close-repair',[\App\Http\Controllers\NewRepair\JobController::class, 'closeJob'])->name('close-repair');
        Route::post('/cancel-repair',[\App\Http\Controllers\NewRepair\JobController::class, 'cancelJob'])->name('cancel-repair');

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
