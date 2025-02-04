<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemarkRequest;
use App\Models\Remark;
use Illuminate\Http\JsonResponse;

class RemarkController extends Controller
{

    public function show($serial_id) : JsonResponse{
        try {
            $data = Remark::query()->where('serial_id', $serial_id)->first();
            return response()->json([
                'message' => 'fetch data success',
                'data' => $data
            ]);
        }catch (\Exception $e){
            return response()->json([
                "message"=>$e->getMessage(),
                'data' => []
            ],400);
        }
    }

    public function storeOrUpdate(RemarkRequest $request): JsonResponse
    {
        try {
            $request->validate([
                'remark' => 'required', 'serial_id' => 'required'
            ]);
            $serial_id = $request->input('serial_id');
            $findPrevRemark = Remark::query()->where('serial_id', $serial_id)->first();
            if ($findPrevRemark) {
                $data = Remark::query()->update([
                    'remark' => $request->input('remark'),
                ]);
            } else {
                $data = Remark::query()->create([
                    'remark' => $request->input('remark'),
                    'serial_id' => $serial_id,
                ]);
            }
            return response()->json([
                'message' => "Remark Updated",
                'remark' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'remark' => []
            ],400);
        }
    }
}
