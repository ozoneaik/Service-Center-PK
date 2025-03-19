<?php

use Illuminate\Support\Facades\Route;

Route::get('/get-sp/{barcode}', function ($barcode) {
    if ($barcode === '002222111100946') {
        return response()->json([
            'barcode' => $barcode,
            'listSp' => [
                [
                    'sp_code' => 'SP0001',
                    'sp_name' => 'สายไฟ',
                    'qty_sp' => 10,
                ],
                [
                    'sp_code' => 'SP0002',
                    'sp_name' => 'หลอดไฟ',
                    'qty_sp' => 5,
                ],
                [
                    'sp_code' => 'SP0003',
                    'sp_name' => 'สวิทช์',
                    'qty_sp' => 3,
                ],
            ],
        ]);
    } elseif ($barcode === '002222111100947') {
        return response()->json([
            'barcode' => $barcode,
            'listSp' => [
                [
                    'sp_code' => 'SP0001',
                    'sp_name' => 'สายไฟ',
                    'qty_sp' => 100,
                ],
            ],
        ]);
    } else {
        return response()->json([
            'listSp' => [],
            'barcode' => $barcode,
        ]);
    }
})->name('getSp');
