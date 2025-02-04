<?php

namespace App\Http\Controllers;

use App\Http\Requests\SparePathRequest;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SparePartController extends Controller
{
    public function show($serial_id): JsonResponse
    {
        try {
            $data = SparePart::query()->where('serial_id', $serial_id)->get();

            return response()->json([
                'message' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'data' => []
            ], 400);
        }
    }

    public function store(SparePathRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            $serial_id = $request->input('serial_id');
            $list = $request->input('list');
            $this->delete($serial_id);
            $data = array_map(function ($item) use ($serial_id) {
                return SparePart::query()->create([
                    'serial_id' => $serial_id,
                    'sp_code' => $item['spcode'],
                    'sp_name' => $item['spname'],
                    'price_per_unit' => $item['price_per_unit'],
                    'qty' => $item['qty'],
                ]);
            }, $list);
            DB::commit();
            return response()->json([
                'message' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();
            return response()->json([
                'message' => $exception->getMessage(),
                'data' => []
            ], 400);
        }
    }

    private function delete($serial_id): void
    {
        SparePart::query()->where('serial_id', $serial_id)->delete();
    }
}
