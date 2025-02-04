<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\MenuFileUploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
