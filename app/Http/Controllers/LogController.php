<?php

namespace App\Http\Controllers;

use App\Models\logStamp;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 100);
        $search = $request->input('search', '');

        $query = logStamp::query()->orderBy('id', 'desc');

        // เพิ่มการค้นหาถ้ามีคำค้น
        if (!empty($search)) {
            $query->where('description', 'like', '%' . $search . '%');
        }

        $Logs = $query->paginate($perPage);

        return Inertia::render('LogPage/LogList', ['Logs' => $Logs]);
    }
}
