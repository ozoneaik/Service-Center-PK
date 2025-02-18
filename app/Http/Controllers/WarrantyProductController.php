<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarrantyProductRequest;
use App\Models\WarrantyProduct;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class WarrantyProductController extends Controller
{
    public function search(Request $request)
    {
        $request->validate(['serial_id' => 'required',], ['serial_id.required' => 'Serial ID is required']);
        $serial_id = $request->input('serial_id');
        try {
            $response = Http::post(env('API_DETAIL'), [
                'sn' => $serial_id,
                'views' => $request->views,
            ]);
            if ($response->status() === 200) {
                $searchResults = $response->json();
                if ($searchResults['status'] === 'Fail') {
                    throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $request->sn);
                }
                $warrantyAt = WarrantyProduct::query()->where('serial_id',$serial_id)->first();
                $warrantyAt = $warrantyAt->date_warranty ?? '';
            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }
            return response()->json([
                'searchResults' => $searchResults,
                'message' => 'success',
                'warrantyAt' => $warrantyAt,
                'time' => Carbon::now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'searchResults' => [],
                'message' => $e->getMessage(),
                'time' => Carbon::now()
            ], 400);
        }
    }

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
        } catch (\Exception $e) {
            DB::rollBack();
            $message = $e->getMessage();
            $Status = 400;
        } finally {
            return response()->json([
                'message' => $message,
            ], $Status);
        }
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'serial_id' => 'required',
            'date_warranty' => 'required',
        ]);
        $serial_id = $request->input('serial_id');
        $pid = $request->input('pid');
        WarrantyProduct::query()->where('serial_id', $serial_id)->update([
            'date_warranty' => $request->input('date_warranty'),
        ]);

        return response()->json([
            'message' => 'success',
        ]);
    }
}
