<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\MenuFileUploadController;
use App\Http\Controllers\BehaviorController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\HistoryRepairController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RemarkController;
use App\Http\Controllers\ReportRepairController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SparePartController;
use App\Http\Controllers\SparePartWarrantyController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route(Auth::check() ? 'dashboard' : 'login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    // Search from API outsource
    Route::post('/search', [SearchController::class, 'detail'])->name('search');


    // Upload File and Menu Upload File
    Route::get('/menu-upload-file/show', [MenuFileUploadController::class, 'show'])->name('menuFileUpload.show');
    Route::prefix('upload-file')->group(function (){
       Route::get('/list', [FileUploadController::class,'list'])->name('uploadFile.show');
    });

    // Behavior
    Route::prefix('behavior')->group(function (){
        Rotue::get('/show/{serial_id}',[BehaviorController::class,'show'])->name('behavior.show');
        Rotue::post('/store',[BehaviorController::class,'store'])->name('behavior.store');
    });

    // SparePart Warranty
    Route::prefix('spare-path-warranty')->group(function (){
        Route::get('/show/{serial_id}',[SparePartWarrantyController::class,'show'])->name('sparePartWarranty.show');
        Route::post('/store',[SparePartController::class,'store'])->name('sparePartWarranty.store');
    });

    // SparePart
    Route::prefix('spare-part')->group(function(){
        Route::get('/show/{serial_id}',[SparePartController::class,'show'])->name('sparePart.show');
        Route::post('/store',[SparePartController::class,'store'])->name('sparePart.store');
    });

    // Remark
    Route::prefix('remark')->group(function () {
        Route::get('/show/{serial_id}', [RemarkController::class, 'show'])->name('remark.show');
        Route::post('/storeOrUpdate', [RemarkController::class, 'storeOrUpdate'])->name('remark.store');
    });

    // Admin Only
    Route::middleware('adminPermission')->group(function () {
        Route::prefix('admin')->group(function () {
            Route::get('/main', [AdminController::class, 'show'])->name('admin.show');
            Route::prefix('/menu-upload-file')->group(function () {
                Route::post('/store', [MenuFileUploadController::class, 'store'])->name('menuFileUpload.store');
                Route::put('/update', [MenuFileUploadController::class, 'update'])->name('menuFileUpload.update');
                Route::delete('/destroy', [MenuFileUploadController::class, 'destroy'])->name('menuFileUpload.destroy');
            });
        });
    });
});

Route::get('/Unauthorized', function () {
    return Inertia::render('Unauthorized');
})->name('unauthorized');

require __DIR__ . '/auth.php';
