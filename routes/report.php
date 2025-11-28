<?php

use App\Http\Controllers\Report\SummaryCenterRepairsController;
use App\Http\Controllers\Report\StartUpCostByShopController;
use App\Http\Controllers\Report\StartUpCostController;
use App\Http\Controllers\Report\SummaryOfIncomeController;
use App\Http\Controllers\Report\SummaryUsedSparePartsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('/report')->group(function(){
    Route::get('/menu',function (){
        return Inertia::render('Reports/ReportMenu');
    })->name('report.menu');

    /**
     * รายงานค่าตอบแทน (ค่าเปิดเครื่องในประกัน)
     */
    Route::prefix('/start-up-cost-shop')->group(function () {
        Route::get('/', [StartUpCostByShopController::class,'index'])->name('report.start-up-cost-shop.index');
    });
    Route::get('/report/start-up-cost-shop/export', [StartUpCostByShopController::class, 'exportExcel'])->name('report.start-up-cost-shop.export');
    /**
     * รายสรุปยอดรายรับ ศูนย์ซ่อม แยก เป็น ค่าบริการ ค่าอะไหล่ ค่าตอบแทน
     */
    Route::prefix('/summary-income')->group(function(){
       Route::get('/',[SummaryOfIncomeController::class,'index'])->name('report.summary-income.index');
    });
    /**
     * รายการค่าเปิดเครื่อง
     */
    Route::prefix('/start-up-cost')->group(function (){
        Route::get('/', [StartUpCostController::class,'index'])->name('report.start-up-cost.index');
    });
    Route::prefix('/summary-center-repairs')->group(function () {
        Route::get('/', [SummaryCenterRepairsController::class, 'index'])->name('report.summary-center-repairs.index');
        Route::get('/export', [SummaryCenterRepairsController::class, 'exportExcel'])->name('report.summary-center-repairs.export');
        Route::get('/detail', [SummaryCenterRepairsController::class, 'detail'])->name('report.summary-center-repairs.detail');
    });
    Route::prefix('/summary-spare-parts')->group(function () {
        Route::get('/', [SummaryUsedSparePartsController::class, 'index'])->name('report.summary-spare-parts.index');
        Route::get('/detail/{sp_code}/{shop}', [SummaryUsedSparePartsController::class, 'detail'])->name('report.summary-spare-parts.detail');
        Route::get('/export', [SummaryUsedSparePartsController::class, 'exportExcel'])->name('report.summary-spare-parts.export');
    });
});
