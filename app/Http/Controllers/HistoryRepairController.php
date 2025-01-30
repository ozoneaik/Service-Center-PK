<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryRepairController extends Controller
{
    public function list(Request $request)
    {
//        dd($request->all());
        return Inertia::render('HistoryRepair/ListHistoryRepair',[
            'detail' => $request->all()
        ]);
    }
}
