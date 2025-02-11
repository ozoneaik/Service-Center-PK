<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemarkRequest;
use App\Models\Remark;
use Illuminate\Http\JsonResponse;
use Exception;

class RemarkController extends Controller
{

    public function show($serial_id) : JsonResponse{
        try {
            $data = Remark::query()->where('serial_id', $serial_id)->first();
            is_null($data) ?? throw new Exception('Remark not found');
            return response()->json([
                'message' => 'fetch data success',
                'data' => $data
            ]);
        }catch (Exception $e){
            return response()->json([
                "message"=>$e->getMessage(),
                'data' => []
            ],400);
        }
    }

    public function storeOrUpdate(RemarkRequest $request): JsonResponse
    {
        try {
            $serial_id = $request->input('serial_id');
            $job_id = $request->input('job_id');
            $findPrevRemark = Remark::query()->where('serial_id', $serial_id)->first();
            if ($findPrevRemark) {
                $data = Remark::query()->update([
                    'remark' => $request->input('remark')
                ]);
            } else {
                $data = Remark::query()->create([
                    'remark' => $request->input('remark'),
                    'serial_id' => $serial_id,
                    'job_id' => $job_id
                ]);
            }
            return response()->json([
                'message' => "Remark Updated",
                'remark' => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'remark' => []
            ],400);
        }
    }
}
