<?php

namespace App\Http\Controllers\Admin\Skus;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminSps;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkuController extends Controller
{
    public function productList() {
        $skus = AdminSps::query()
            ->groupBy('skufg', 'skufgname','modelfg')
            ->select('skufg', 'skufgname','modelfg')
            ->orderBy('skufg','desc')
            ->paginate(50);

        return Inertia::render('Admin/Skus/SkuList', [
            'skus' => $skus,
        ]);
    }

    public function productDetail($sku_fg,$model_fg){
        $detail = AdminSps::query()->where('skufg',$sku_fg)->where('modelfg',$model_fg)->get();
        $product = AdminSps::query()->where('skufg',$sku_fg)->where('modelfg',$model_fg)->first();
        return Inertia::render('Admin/Skus/SkuDetail', [
            'detail' => $detail,
            'sku_fg' => $sku_fg,
            'model_fg' => $model_fg,
            'product' => $product,
        ]);
    }
}
