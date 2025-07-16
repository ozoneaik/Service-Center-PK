<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminSps;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SparePartController extends Controller
{
    public function index(): Response
    {
        $sp_group = AdminSps::query()->groupBy('skufg','skufgname')->select('skufg','skufgname')->paginate(50);
        return Inertia::render('Admin/Sps_Dms/Sps/SpList',[
            'sp_group' => $sp_group,
        ]);
    }
    public function detail(string $sku_fg): JsonResponse
    {
        $sps = AdminSps::query()->where('skufg',$sku_fg)->get();
        return response()->json([
            'sps' => count($sps) > 0 ? $sps : [],
        ]);
    }
}
