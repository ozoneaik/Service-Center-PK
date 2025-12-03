<?php

use App\Http\Controllers\Admin\DiagramController;
use App\Http\Controllers\Admin\JobFromServiceController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\Skus\SkuController;
use App\Http\Controllers\Admin\SpController;
use App\Http\Controllers\Admin\StartUpCostController;
use App\Http\Controllers\Admin\SummaryCenterRepairsController;
use App\Http\Controllers\Admin\SummaryOfIncomeController;
use App\Http\Controllers\Admin\SummaryUsedSparePartsController;
use App\Http\Controllers\Admin\UserManageController;
use App\Http\Controllers\Admin\WarrantyController;
use App\Http\Controllers\ClosedController;
use App\Http\Controllers\NotificationNewController;
use App\Http\Controllers\ScoreMasterController;
use Illuminate\Support\Facades\Route;

Route::middleware('adminPermission')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::prefix('sales')->group(function () {
            Route::get('/index', [SaleController::class, 'index'])->name('Sales.index');
            Route::get('/create', [SaleController::class, 'create'])->name('Sales.create');
            Route::post('/store', [SaleController::class, 'store'])->name('Sales.store');
            Route::put('/update/{id}', [SaleController::class, 'update'])->name('Sales.update');
            Route::delete('/destroy/{sale_code}', [SaleController::class, 'destroy'])->name('Sales.destroy');
        });
        Route::prefix('config')->group(function () {
            Route::get('/closed', [ClosedController::class, 'configClosed'])->name('Closed.config');
            Route::get('/getclosed', [ClosedController::class, 'getNotifications']);
            Route::get('/notifications', [NotificationNewController::class, 'index']);
            Route::get('/notifications/list', [NotificationNewController::class, 'notificationsList']);
            Route::post('/notifications', [NotificationNewController::class, 'store']);
            Route::patch('/notifications/{id}/status', [NotificationNewController::class, 'updateStatus']);
        });
        Route::prefix('scores')->group(function () {
            Route::prefix('master')->group(function () {
                Route::get('/list', [ScoreMasterController::class, 'index'])->name('ScoreMaster.index');
                Route::get('/create', [ScoreMasterController::class, 'create'])->name('ScoreMaster.create');
                Route::post('/store', [ScoreMasterController::class, 'store'])->name('ScoreMaster.store');
                Route::put('/update/{id}', [ScoreMasterController::class, 'update'])->name('ScoreMaster.update');
                Route::delete('/delete/{id}', [ScoreMasterController::class, 'delete'])->name('ScoreMaster.delete');
            });
            Route::get('/list', [ScoreMasterController::class, 'indexSku'])->name('ScoreSku.index');
            Route::get('/create', [ScoreMasterController::class, 'createSku'])->name('ScoreSku.create');
            Route::get('/store', [ScoreMasterController::class, 'storeSku'])->name('ScoreSku.store');
            Route::put('/update/{id}', [ScoreMasterController::class, 'updateSku'])->name('ScoreSku.update');
            Route::delete('/delete/{id}', [ScoreMasterController::class, 'deleteSku'])->name('ScoreSku.delete');
        });
        Route::prefix('job-form-service')->group(function () {
            Route::get('/list', [JobFromServiceController::class, 'index'])->name('JobFormService.index');
            Route::get('/detail/{job_id}', [JobFromServiceController::class, 'detail'])->name('JobFormService.detail');
            Route::put('/update/{job_id}', [JobFromServiceController::class, 'update'])->name('JobFormService.update');
        });

        Route::prefix('start-up-cost')->group(function () {
            Route::get('/', [StartUpCostController::class, 'index'])->name('startUpCost.index');
            Route::get('/create', [StartUpCostController::class, 'create'])->name('startUpCost.create');
            Route::get('/edit/{id}', [StartUpCostController::class, 'edit'])->name('startUpCost.edit');
            Route::put('/update/{id}', [StartUpCostController::class, 'update'])->name('startUpCost.update');
            Route::post('/store', [StartUpCostController::class, 'store'])->name('startUpCost.store');
            Route::delete('/delete/{id}', [StartUpCostController::class, 'delete'])->name('startUpCost.delete');
            Route::get('/export', [StartUpCostController::class, 'exportExcel'])->name('startUpCost.export');
        });

        Route::prefix('summary-center-repairs')->group(function () {
            Route::get('/', [SummaryCenterRepairsController::class, 'index'])->name('admin.summary-center-repairs.index');
            Route::get('/export', [SummaryCenterRepairsController::class, 'exportExcel'])->name('admin.summary-center-repairs.export');
            Route::get('/detail', [SummaryCenterRepairsController::class, 'detail'])->name('admin.summary-center-repairs.detail');
        });

        Route::prefix('/summary-spare-parts')->group(function () {
            Route::get('/', [SummaryUsedSparePartsController::class, 'index'])->name('admin.summary-spare-parts.index');
            Route::get('/detail/{sp_code}/{shop}', [SummaryUsedSparePartsController::class, 'detail'])->name('admin.summary-spare-parts.detail');
            Route::get('/export', [SummaryUsedSparePartsController::class, 'exportExcel'])->name('admin.summary-spare-parts.export');
        });
        Route::prefix('/summary-income')->group(function () {
            Route::get('/', [SummaryOfIncomeController::class, 'index'])->name('admin.summary-income.index');
            Route::get('/detail/{job_id}/{is_code_key}', [SummaryOfIncomeController::class, 'detail'])->name('admin.summary-income.detail');
            Route::get('/export/all/{is_code_key}', [SummaryOfIncomeController::class, 'exportAll'])->name('admin.summary-income.export-all');
        });

        Route::prefix('warranties')->group(function () {
            Route::get('/', [WarrantyController::class, 'index'])->name('admin.warranties.index');
        });

        Route::prefix('skus')->group(function () {
            Route::get('/', [SkuController::class, 'productList'])->name('admin.skus.product.list');
            Route::get('/detail/{sku_fg}/{model_fg}', [SkuController::class, 'productDetail'])->name('admin.skus.detail');
        });

        Route::prefix('spare-parts')->group(function () {
            Route::get('/', [SpController::class, 'index'])->name('admin.spare-parts.index');
            Route::get('/create', [SpController::class, 'create'])->name('admin.spare-parts.create');
            Route::post('/store', [SpController::class, 'store'])->name('admin.spare-parts.store');
            Route::get('/edit/{id}', [SpController::class, 'edit'])->name('admin.spare-parts.edit');
            Route::put('/update/{id}', [SpController::class, 'update'])->name('admin.spare-parts.update');
            Route::delete('/delete/{id}', [SpController::class, 'softDelete'])->name('admin.spare-parts.delete');
            Route::delete('/destroy/{id}', [SpController::class, 'destroy'])->name('admin.spare-parts.destroy');
            Route::post('/restore', [SpController::class, 'restore'])->name('admin.spare-parts.restore');
        });

        Route::prefix('diagrams')->group(function () {
            Route::get('/', [DiagramController::class, 'index'])->name('admin.diagram.index');
            Route::get('/create', [DiagramController::class, 'create'])->name('admin.diagram.create');
            Route::get('/create-exel', [DiagramController::class, 'createFromExel'])->name('admin.diagram.create.excel');
            Route::post('/store', [DiagramController::class, 'store'])->name('admin.diagram.store');
            Route::get('/edit/{id}', [DiagramController::class, 'edit'])->name('admin.diagram.edit');
            Route::put('/update/{id}', [DiagramController::class, 'update'])->name('admin.diagram.update');
            Route::delete('/delete/{id}', [DiagramController::class, 'softDelete'])->name('admin.diagram.delete');
            Route::delete('/destroy/{id}', [DiagramController::class, 'destroy'])->name('admin.diagram.destroy');
            Route::post('/restore', [DiagramController::class, 'restore'])->name('admin.diagram.restore');
        });

        // จัดการเมนู navbar
        Route::prefix('system-menu')->group(function () {});

        // จัดการผู้ใช้
        Route::prefix('users-manage')->group(function () {
            Route::get('/create', [UserManageController::class, 'create'])->name('userManage.create');
            Route::get('/list', [UserManageController::class, 'list'])->name('userManage.list');
            Route::post('/store', [UserManageController::class, 'store'])->name('userManage.store');
            Route::get('/edit/{user_code}', [UserManageController::class, 'edit'])->name('userManage.edit');
            Route::put('/update', [UserManageController::class, 'update'])->name('userManage.update');
            Route::delete('/delete/{user_code}', [UserManageController::class, 'delete'])->name('userManage.delete');
        });
    });
});
