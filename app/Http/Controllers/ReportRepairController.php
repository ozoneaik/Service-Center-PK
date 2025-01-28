<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportRepairController extends Controller
{
    public function store(){

    }

    public function show(Request $request){
        return Inertia::render('ReportRepair/FormRepair',[
            'detail' => $request->all()
        ]);
    }

    public function update(){

    }

    public function destroy(){

    }

    public function edit(){

    }
}
