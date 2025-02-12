<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarrantyProductRequest;
use App\Models\WarrantyProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class WarrantyProductController extends Controller
{
    public function store(WarrantyProductRequest $request): JsonResponse
    {
        $serial_id = $request->input('serial_id');
        $pid = $request->input('pid');
        $p_name = $request->input('p_name');
        $date_warranty = $request->input('date_warranty');
        try {
            DB::beginTransaction();
            WarrantyProduct::query()->create([
                'serial_id' => $serial_id,
                'pid' => $pid,
                'p_name' => $p_name,
                'date_warranty' => $date_warranty,
                'user_id' => auth()->id(),
                'user_is_code_id' => auth()->user()->is_code_cust_id
            ]);
            $message = 'บันทึกข้อมูลเสร็จสิ้น';
            $Status = 200;
            DB::commit();
        }catch (\Exception $e){
            DB::rollBack();
            $message = $e->getMessage();
            $Status = 400;
        } finally {
            return response()->json([
                'message' => $message,
            ],$Status);
        }
    }

    public function update(){

    }
}
