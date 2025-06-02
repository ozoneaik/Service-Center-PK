<?php

namespace App\Http\Controllers;

use App\Models\ImageDiagram;
use Illuminate\Http\JsonResponse;

class DmImageController extends Controller
{
    public function index($pid,$fag_model='9999',$dm_type = 'DM01'): JsonResponse
    {
        if ($fag_model === '9999'){
            $data = ImageDiagram::query()
                ->where('sku_code', $pid)
                ->where('dm_type', $dm_type)
                ->orderBy('layer')
                ->get();
        }else{
            $data = ImageDiagram::query()
                ->where('sku_code', $pid)
                ->where('dm_type', $dm_type)
                ->where('fac_model', $fag_model)
                ->orderBy('layer')
                ->get();
        }

        if (!$data) {
            return response()->json(['message' => 'ไม่พบข้อมูล'], 404);
        }
        return response()->json($data);
    }
}
