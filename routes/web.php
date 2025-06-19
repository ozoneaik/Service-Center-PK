<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\HistorySpController;
use App\Http\Controllers\Admin\MenuFileUploadController;
use App\Http\Controllers\Admin\OrderManageController;
use App\Http\Controllers\Admin\UserManageController;
use App\Http\Controllers\ApprovalSpController;
use App\Http\Controllers\DmImageController;
use App\Http\Controllers\genQuPdfController;
use App\Http\Controllers\HistoryRepairController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\ManageBranchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Stores\UserController;
use App\Http\Controllers\Test\DomPdfController;
use App\Http\Controllers\WarrantyProductController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route(Auth::check() ? 'repair.index' : 'login');
});

Route::get('/dashboard', [SearchController::class,'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::get('/logs/list',[LogController::class,'index'])->name('logs.list');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // จัดการ Jobs
    require __DIR__ . '/jobs.php';

    // จัดการเอกสารการเคลมอะไหล่
    require __DIR__.'/spareClaim.php';

    // Admin Only
    Route::middleware('adminPermission')->group(function () {
        Route::prefix('admin')->group(function () {
            Route::get('/main', [AdminController::class, 'show'])->name('admin.show');
            Route::prefix('/menu-upload-file')->group(function () {
                Route::post('/store', [MenuFileUploadController::class, 'store'])->name('menuFileUpload.store');
                Route::put('/update', [MenuFileUploadController::class, 'update'])->name('menuFileUpload.update');
                Route::delete('/destroy', [MenuFileUploadController::class, 'destroy'])->name('menuFileUpload.destroy');
            });
            Route::prefix('approval')->group(function () {
                Route::get('/index', [ApprovalSpController::class, 'index'])->name('approvalSp.index');
                Route::put('/update/{spId}/{approve_status}', [ApprovalSpController::class, 'updateStatus'])->name('approvalSp.update');
            });
            Route::prefix('users-manage')->group(function () {
                Route::get('/create', [UserManageController::class, 'create'])->name('userManage.create');
                Route::get('/list', [UserManageController::class, 'list'])->name('userManage.list');
                Route::post('/store',[UserManageController::class,'store'])->name('userManage.store');
                Route::get('/edit/{user_code}',[UserManageController::class,'edit'])->name('userManage.edit');
                Route::put('/update',[UserManageController::class,'update'])->name('userManage.update');
                Route::delete('/delete/{user_code}',[UserManageController::class,'delete'])->name('userManage.delete');
            });
            Route::prefix('orders')->group(function (){
               Route::get('/list',[OrderManageController::class,'list'])->name('admin.orders.list');
            });
            Route::get('history-job',[HistorySpController::class,'index'])->name('admin.history-job');
        });
    });
    require __DIR__.'/admin.php';

    // ลงทะเบียนรับประกัน
    Route::prefix('warranty')->group(function () {
        Route::get('/index', [WarrantyProductController::class,'index'])->name('warranty.index');
        Route::post('/search', [WarrantyProductController::class, 'search'])->name('warranty.search');
        Route::post('/store', [WarrantyProductController::class, 'store'])->name('warranty.store');
        Route::put('/update', [WarrantyProductController::class, 'update'])->name('warranty.update');
        Route::get('/fetchDataLocal/{serial_id}', [WarrantyProductController::class, 'fetchDataLocal'])->name('warranty.fetchDataLocal');
    });

    // สั่งซื้ออะไหล่
    require __DIR__ . '/orders.php';

    // จัดการ stock
    require __DIR__. '/stockSp.php';


    Route::prefix('history')->group(function () {
        Route::get('/index', [HistoryRepairController::class, 'index'])->name('history.index');
        Route::post('/search', [HistoryRepairController::class, 'search'])->name('history.search');
        Route::get('/detail/{serial_id}', [HistoryRepairController::class, 'detail'])->name('history.detail');
    });

    Route::middleware('AdminBranchAccess')->group(function () {
        Route::get('index', [ManageBranchController::class, 'index'])->name('Manage.index');
        Route::post('gp/store', [ManageBranchController::class, 'storeGp'])->name('Manage.gp.store');
        Route::post('emp/store', [ManageBranchController::class, 'storeEmp'])->name('Manage.emp.store');
    });

    // สำหรับผู้จัดการร้าน
    Route::prefix('store')->group(function(){
        Route::prefix('user')->group(function(){
            Route::get('/index', [UserController::class, 'index'])->name('storeUsers.index');
            Route::put('/update',[UserController::class,'update'])->name('storeUsers.update');
            Route::get('/create',[UserController::class,'create'])->name('storeUsers.create');
            Route::post('/store',[UserController::class,'store'])->name('storeUsers.store');
            Route::delete('/delete/{user_code}',[UserController::class,'delete'])->name('storeUsers.delete');
        });
    });
});

Route::get('/Unauthorized', function () {
    return Inertia::render('Unauthorized');
})->name('unauthorized');

Route::get('/welcome', function () {
    return Inertia::render('Welcome',[
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

//Route::post('/genQuPdf', [genQuPdfController::class, 'genQuPdf'])->name('genQuPdf');
Route::get('/image-dm/{pid}/{fac_model}/{dm_type}', [DmImageController::class, 'index'])->name('dmImage');

require __DIR__ . '/auth.php';
require __DIR__ . '/fakeForTest.php';


Route::get('/test-page',function(){
   return Inertia::render('Test/TestPage');
});

Route::get('/dom-pdf', [DomPdfController::class,'index'])->name('dom-pdf.index');



