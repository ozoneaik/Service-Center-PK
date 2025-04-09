<?php

namespace App\Http\Controllers;

use App\Http\Requests\BehaviorRequest;
use App\Models\Behavior;
use App\Models\logStamp;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
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
            $job_id = $request->input('job_id');
            $serial_id = $request->input('serial_id');
            $list = $request->input('list');
            logStamp::query()->create(['description' => Auth::user()->user_code . " พยายามบันทึกอาการ/สาเหตุ $job_id"]);
            DB::beginTransaction();
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
            logStamp::query()->create(['description' => Auth::user()->user_code . " บันทึกอาการ/สาเหตุสำเร็จ $job_id"]);
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
