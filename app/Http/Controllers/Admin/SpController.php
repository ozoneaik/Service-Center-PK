<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SpController extends Controller
{
    public function index()
    {
        return;
    }

    public function store() {}

    public function update(Request $request, $id) {}

    public function softDelete($id) {}

    public function destroy($id) {}

    public function restore() {}
}
