<?php

namespace App\Http\Controllers;

use App\Http\Requests\BehaviorRequest;
use App\Models\Behavior;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BehaviorController extends Controller
{
    public function list($serial_id): JsonResponse
    {
        try {
            $data = Behavior::query()->where('serial_id', $serial_id)->get();
            return response()->json([
                'message' => 'success',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function store(BehaviorRequest $request) : JsonResponse
    {
        try {
            DB::beginTransaction();
            $serial_id = $request->input('serial_id');
            $list = $request->input('list');
            $job_id = $request->input('job_id');
            $this->delete($job_id);
            $data = array_map(function ($item) use ($serial_id,$job_id) {
                return Behavior::query()->create([
                    'serial_id' => $serial_id,
                    'job_id' => $job_id,
                    'behavior_name' => $item['behaviorname'],
                    'catalog' => $item['catalog'],
                    'sub_catalog' => $item['subcatalog'],
                    'cause_code' => $item['causecode'],
                    'cause_name' => $item['causename'],
                ]);
            }, $list);
            DB::commit();
            return response()->json([
                'message' => 'บันทึกข้อมูลสำเร็จ',
                'new_data' => $data,
                'request' => $request->input('list'),
            ]);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'data' => []
            ],400);
        }
    }

    protected function delete($job_id) {
        return Behavior::query()->where('job_id', $job_id)->delete();
    }
}
