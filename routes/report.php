<?php

use App\Http\Controllers\Report\StartUpCostByShopController;
use App\Http\Controllers\Report\StartUpCostController;
use App\Http\Controllers\Report\SummaryOfIncomeController;
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
});
