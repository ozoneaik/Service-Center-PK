<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WarrantyProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarrantyController extends Controller
{
    public function index(Request $request){
        $query = WarrantyProduct::query();
        $warranties = $query->paginate(100);
        return Inertia::render('Admin/Warranties/WrList',[
            'warranties' => $warranties,
        ]);
    }
}
