<?php

namespace App\Http\Controllers\Stocks;

use App\Http\Controllers\Controller;

class StockSpController extends Controller
{
    public function index(){
        return response()->json([
            'message' => 'hello world'
        ]);
    }
}
