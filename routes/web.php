<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportRepairController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route(Auth::check() ? 'dashboard' : 'login');
//    return Inertia::render('Welcome', [
//        'canLogin' => Route::has('login'),
//        'canRegister' => Route::has('register'),
//        'laravelVersion' => Application::VERSION,
//        'phpVersion' => PHP_VERSION,
//    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/test', function(){
        return response()->json(['message' => 'Hello World!']);
    });

    Route::post('/search',[SearchController::class,'detail'])->name('search');

    Route::prefix('reportRepair')->group(function (){
       Route::get('/show',[ReportRepairController::class,'show'])->name('reportRepair.show');
    });
});

require __DIR__ . '/auth.php';
