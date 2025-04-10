<?php

namespace App\Http\Controllers;

use App\Models\ImageDiagram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DmImageController extends Controller
{
    public function index($pid): JsonResponse
    {
        // $data = DB::connection('diagram')->table('data_file')
        //     ->where('skufg', 'like', $pid)
        //     ->limit(1)
        //     ->first();
        // // ตรวจสอบว่าพบข้อมูลหรือไม่
        // if (!$data) {
        //     return response()->json(['message' => 'ไม่พบข้อมูล'], 404);
        // }
        // return response()->json($data);

//        $data =  DB::connection('diagram')->table('diagrams')
//            ->where('sku_code', 'like', $pid)
//            ->first();

        $data = ImageDiagram::query()
            ->where('sku_code', $pid)
            ->where('dm_type', 'DM01')
            ->orderBy('layer')
            ->get();

        if (!$data) {
            return response()->json(['message' => 'ไม่พบข้อมูล'], 404);
        }
        return response()->json($data);
    }
}
