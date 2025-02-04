<?php

namespace App\Http\Controllers;

use App\Http\Requests\BehaviorRequest;
use App\Models\Behavior;
use Illuminate\Http\JsonResponse;

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
            $serial_id = $request->input('serial_id');
            $list = $request->input('list');
            $this->delete($serial_id);
            $data = array_map(function ($item) use ($serial_id) {
                return Behavior::query()->create([
                    'serial_id' => $serial_id,
                    'behavior_name' => $item['behaviorname'],
                    'catalog' => $item['catalog'],
                    'sub_catalog' => $item['subcatalog'],
                    'cause_code' => $item['causecode'],
                    'cause_name' => $item['causename'],
                ]);
            }, $list);

            return response()->json([
                'message' => 'success',
                'data' => $data,
            ]);
        }catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'data' => []
            ],400);
        }
    }

    protected function delete($serial_id) {
        return Behavior::query()->where('serial_id', $serial_id)->delete();
    }
}
