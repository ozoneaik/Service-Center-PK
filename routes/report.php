<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('/report')->group(function(){
    Route::get('/menu',function (){
        return Inertia::render('Reports/ReportMenu');
    })->name('report.menu');
});
