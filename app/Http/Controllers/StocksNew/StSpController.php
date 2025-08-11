<?php

namespace App\Http\Controllers\StocksNew;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StSpController extends Controller
{
    public function index(Request $request, $is_code_cust_id = null){
        return Inertia::render('Stores/StockSpNew/StSpList');
    }
}
