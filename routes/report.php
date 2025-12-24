<?php

use App\Http\Controllers\Report\SummaryCenterRepairsController;
use App\Http\Controllers\Report\StartUpCostByShopController;
use App\Http\Controllers\Report\StartUpCostByShopController2;
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
        Route::get('/', [StartUpCostByShopController2::class, 'index'])->name('report.start-up-cost-shop.index');
        Route::get('/export', [StartUpCostByShopController2::class, 'exportExcel'])->name('report.start-up-cost-shop.export');
        Route::get('/create-doc', [StartUpCostByShopController2::class, 'createDoc'])->name('report.start-up-cost-shop.create-doc');
        Route::post('/store-doc', [StartUpCostByShopController2::class, 'storeDoc'])->name('report.start-up-cost-shop.store-doc');
        Route::get('/docs', [StartUpCostByShopController2::class, 'docList'])->name('report.start-up-cost-shop.doc-list');
        Route::post('/check-cn', [StartUpCostByShopController2::class, 'checkCnStatus'])->name('report.start-up-cost-shop.check-cn');
        Route::get('/doc/{doc_no}', [StartUpCostByShopController2::class, 'showDoc'])->name('report.start-up-cost-shop.show-doc');
        Route::get('/export-doc-list', [StartUpCostByShopController2::class, 'exportDocList'])->name('report.start-up-cost-shop.export-doc-list');
        Route::post('/cancel-doc', [StartUpCostByShopController2::class, 'cancelDoc'])->name('report.start-up-cost-shop.cancel-doc');
    });

    Route::prefix('/g-start-up-cost-shop')->group(function () {
        Route::get('/', [StartUpCostByShopController::class, 'index'])->name('report.g-start-up-cost-shop.index');
        Route::get('/export', [StartUpCostByShopController::class, 'exportExcel'])->name('report.g-start-up-cost-shop.export');
    });

    /**
     * รายสรุปยอดรายรับ ศูนย์ซ่อม แยก เป็น ค่าบริการ ค่าอะไหล่ ค่าตอบแทน
     */
    Route::prefix('/summary-income')->group(function(){
       Route::get('/',[SummaryOfIncomeController::class,'index'])->name('report.summary-income.index');
        Route::get('/detail/{job_id}/{is_code_key}', [SummaryOfIncomeController::class, 'detail'])->name('report.summary-income.detail');
        Route::get('/export/all/{is_code_key}', [SummaryOfIncomeController::class, 'exportAll'])->name('report.summary-income.export-all');
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
