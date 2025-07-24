<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\StartUpCost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StartUpCostController extends Controller
{
    public function index(Request $request)
    {
        $req = $request->all();
        $sku_name = $req['sku_name'] ?? null;
        $sku_code = $req['sku_code'] ?? null;
        $query = StartUpCost::query();
        if (isset($sku_code)) {
            $query->where('sku_code', 'like', "%{$sku_code}%");
        }
        if (isset($sku_name)) {
            $query->where('sku_name', 'like', "%{$sku_name}%");
        }
        $start_up_cost = $query->orderBy('id')->paginate(50);
        return Inertia::render('Reports/StartUpCosts/SucServiceList', [
            'start_up_cost' => $start_up_cost,
        ]);
    }
}
