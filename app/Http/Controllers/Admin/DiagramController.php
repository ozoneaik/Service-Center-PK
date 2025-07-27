<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Diagram;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiagramController extends Controller
{
    public function index(){
        $dm_list = Diagram::orderBy('created_at', 'desc')->paginate(50);
        return Inertia::render('Admin/Diagrams/DmList', ['dm_list' => $dm_list]);
    }

    public function store(){
        return ;
    }

    public function softDelete($id){
    }

    public function destroy($id) {

    }

    public function restore(){

    }
}
