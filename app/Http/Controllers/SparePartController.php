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
            $job_id = $request->input('job_id');
            $list = $request->input('list');
            $this->delete($job_id);
            $data['sp'] = array_map(function ($item) use ($serial_id, $job_id) {
                return SparePart::query()->create([
                    'serial_id' => $serial_id,
                    'job_id' => $job_id,
                    'sp_code' => $item['spcode'],
                    'sp_name' => $item['spname'],
                    'price_per_unit' => floatval($item['price_per_unit'] ?? 0),
                    'gp' => $item['gp'],
                    'sp_warranty' => $item['warranty'],
                    'approve' => $item['approve'] ?? 'no',
                    'approve_status' => $item['approve_status'] ?? 'yes',
                    'price_multiple_gp' => $item['price_multiple_gp'],
                    'qty' => $item['qty'] ?? 0,
                    'sp_unit' => $item['spunit'] ?? 'อัน',
                    'claim' => (bool)$item['claim'],
                    'remark' => $item['remark'] ?? null,
                ]);
            }, $list['sp']);
            DB::commit();
            return response()->json([
                'message' => 'บันทึกรายการอะไหล่สำเร็จ',
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

    private function delete($job_id): void
    {
        SparePart::query()->where('job_id', $job_id)->delete();
    }
}
