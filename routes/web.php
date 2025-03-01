<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\MenuFileUploadController;
use App\Http\Controllers\ApprovalSpController;
use App\Http\Controllers\BehaviorController;
use App\Http\Controllers\CustomerInJobController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\HistoryRepairController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ManageBranchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RemarkController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SpareClaimController;
use App\Http\Controllers\SparePartController;
use App\Http\Controllers\WarrantyProductController;
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


    // ปืดงานซ่อม
    Route::prefix('jobs')->group(function () {
        Route::post('/update', [JobController::class, 'update'])->name('jobs.update');
    });

    // Upload File and Menu Upload File
    Route::get('/menu-upload-file/show', [MenuFileUploadController::class, 'show'])->name('menuFileUpload.show');
    Route::prefix('upload-file')->group(function () {
        Route::get('/list', [FileUploadController::class, 'list'])->name('uploadFile.show');
        Route::post('/store', [FileUploadController::class, 'store'])->name('uploadFile.store');
    });

    // Behavior
    Route::prefix('behavior')->group(function () {
        Route::get('/show/{serial_id}', [BehaviorController::class, 'show'])->name('behavior.show');
        Route::post('/store', [BehaviorController::class, 'store'])->name('behavior.store');
    });

    // Customer in Job
    Route::prefix('customer-in-job')->group(function () {
        Route::post('/store', [CustomerInJobController::class, 'store'])->name('customerInJob.store');
        Route::get('/searchPhone/{phone}', [CustomerInJobController::class, 'searchPhone'])->name('customerInJob.searchPhone');
    });

    // SparePart
    Route::prefix('spare-part')->group(function () {
        Route::get('/show/{serial_id}', [SparePartController::class, 'show'])->name('sparePart.show');
        Route::post('/store', [SparePartController::class, 'store'])->name('sparePart.store');
    });

    // Remark
    Route::prefix('remark')->group(function () {
        Route::get('/show/{serial_id}', [RemarkController::class, 'show'])->name('remark.show');
        Route::post('/storeOrUpdate', [RemarkController::class, 'storeOrUpdate'])->name('remark.store');
    });

    Route::prefix('spare-claim')->group(function () {
        Route::get('/index', [SpareClaimController::class, 'index'])->name('spareClaim.index');
        Route::get('/history', [SpareClaimController::class, 'historyShow'])->name('spareClaim.history');
        Route::get('/pending', [SpareClaimController::class, 'pendingShow'])->name('spareClaim.pending');
        Route::post('/store', [SpareClaimController::class, 'store'])->name('spareClaim.store');
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
            Route::prefix('approval')->group(function (){
               Route::get('/index',[ApprovalSpController::class, 'index'])->name('approvalSp.index');
               Route::put('/update/{spId}/{approve_status}',[ApprovalSpController::class,'updateStatus'])->name('approvalSp.update');
            });
        });
    });

    // ลงทะเบียนรับประกัน
    Route::prefix('warranty')->group(function () {
        Route::get('/index', function () {
            return Inertia::render('Warranty/Form');
        })->name('warranty.index');
        Route::post('/search',[WarrantyProductController::class, 'search'])->name('warranty.search');
        Route::post('/store', [WarrantyProductController::class, 'store'])->name('warranty.store');
        Route::put('/update', [WarrantyProductController::class, 'update'])->name('warranty.update');
        Route::get('/fetchDataLocal/{serial_id}',[WarrantyProductController::class,'fetchDataLocal'])->name('warranty.fetchDataLocal');
    });

    Route::prefix('orders')->group(function () {
        Route::get('/list', function () {
            return Inertia::render('Orders/OrderList0');
        })->name('orders.list');
    });

    Route::prefix('history')->group(function () {
       Route::get('/index', [HistoryRepairController::class,'index'])->name('history.index');
       Route::post('/search',[HistoryRepairController::class,'search'])->name('history.search');
       Route::get('/detail/{serial_id}' ,[HistoryRepairController::class,'detail'])->name('history.detail');
    });

    Route::middleware('AdminBranchAccess')->group(function() {
       Route::get('index', [ManageBranchController::class,'index'])->name('Manage.index');
       Route::post('gp/store',[ManageBranchController::class,'storeGp'])->name('Manage.gp.store');
       Route::post('emp/store',[ManageBranchController::class,'storeEmp'])->name('Manage.emp.store');
    });

});

Route::get('/Unauthorized', function () {
    return Inertia::render('Unauthorized');
})->name('unauthorized');

Route::get('/home', function () {
    return view('home');
})->name('home');

require __DIR__ . '/auth.php';
