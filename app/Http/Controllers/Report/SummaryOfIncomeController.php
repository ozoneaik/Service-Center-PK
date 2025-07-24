<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SummaryOfIncomeController extends Controller
{
    public function index(){
        return Inertia::render('Reports/SummaryOfIncome/SoiMain');
    }
}
