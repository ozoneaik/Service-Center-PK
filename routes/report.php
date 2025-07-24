<?php

use App\Http\Controllers\Report\StartUpCostController;
use App\Http\Controllers\Report\SummaryOfIncomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('/report')->group(function(){
    Route::get('/menu',function (){
        return Inertia::render('Reports/ReportMenu');
    })->name('report.menu');
    Route::prefix('/start-up-cost')->group(function (){
        Route::get('/', [StartUpCostController::class,'index'])->name('report.start-up-cost.index');
    });
    Route::prefix('/summary-income')->group(function(){
       Route::get('/',[SummaryOfIncomeController::class,'index'])->name('report.summary-income.index');
    });
});
