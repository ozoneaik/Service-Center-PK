<?php

use App\Http\Controllers\Admin\MenuFileUploadController;
use App\Http\Controllers\BehaviorController;
use App\Http\Controllers\CustomerInJobController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\JobController;
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
Route::post('/search/sku',[SearchBySkuController::class,'detailSku'])->name('search.sku');

Route::prefix('jobs')->group(function(){
    Route::get('/check/{serial_id}', [JobController::class, 'check'])->name('jobs.check');
    Route::post('/update', [JobController::class, 'update'])->name('jobs.update');
    Route::put('/cancel/{serial_id}',[JobController::class,'cancelJob'])->name('jobs.cancel');
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
// บันทึกอะไหล่
Route::prefix('spare-part')->group(function () {
    Route::get('/show/{serial_id}', [SparePartController::class, 'show'])->name('sparePart.show');
    Route::post('/store', [SparePartController::class, 'store'])->name('sparePart.store');
});
// บันทึกอาการเบื้องต้น
Route::prefix('symptom')->group(function () {
    Route::post('/store', [SymptomController::class, 'store'])->name('symptom.store');
});
// บันทึกหมายเหตุ
Route::prefix('remark')->group(function () {
    Route::get('/show/{serial_id}', [RemarkController::class, 'show'])->name('remark.show');
    Route::post('/storeOrUpdate', [RemarkController::class, 'storeOrUpdate'])->name('remark.store');
});

Route::prefix('send-job')->group(function () {
   Route::get('/list',[sendJobController::class, 'sendJobList'])->name('sendJobs.list');
   Route::post('/update',[sendJobController::class, 'updateJobSelect'])->name('sendJobs.update');
   Route::get('/doc',[sendJobController::class,'docJobList'])->name('sendJobs.docJobList');


   Route::get('/group-detail/{job_group}',[sendJobController::class,'groupDetail'])->name('sendJobs.groupDetail');
   Route::get('/print/{job_group}',[sendJobController::class,'printJobList'])->name('sendJobs.printJobList');
});


Route::prefix('repair')->group(function(){
   Route::get('/',[\App\Http\Controllers\NewRepair\SearchController::class,'index'])->name('repair.index');
   Route::post('/search',[\App\Http\Controllers\NewRepair\SearchController::class,'search'])->name('repair.search');
   Route::post('/found/{serial_id}/{pid}',[\App\Http\Controllers\NewRepair\JobController::class,'found'])->name('repair.found');
   Route::prefix('job')->group(function(){
       Route::post('/store',[\App\Http\Controllers\NewRepair\JobController::class,'storeJob'])->name('repair.store');
   });
   Route::prefix('customer')->group(function(){
        Route::get('/', [RpCustomerController::class,'detail'])->name('repair.customer.detail');
        Route::post('/', [RpCustomerController::class, 'storeOrUpdate'])->name('repair.customer.store');
   });
   Route::prefix('remark-symptom')->group(function(){
       Route::get('/',[RpRemarkAndSymptomController::class,'detail'])->name('repair.remark.symptom.detail');
       Route::post('/',[RpRemarkAndSymptomController::class, 'storeOrUpdate'])->name('repair.remark.symptom.store');
   });
   Route::prefix('upload-file')->group(function(){
      Route::get('/',[RpUploadFileController::class,'detail'])->name('repair.upload-file.detail');
   });
});
