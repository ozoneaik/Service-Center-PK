<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\Behavior;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RpAfBehaviourController extends Controller
{
    public function index(Request $request)
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');
        $behaviors = Behavior::query()->where('job_id', $job_id)->where('serial_id', $serial_id)->get();
        return response()->json([
            'message' => 'success',
            'job_id' => $job_id,
            'serial_id' => $serial_id,
            'behaviors' => $behaviors ?? [],
        ]);
    }

    public function store(Request $request){
        try {
            $job_id = $request->get('job_id');
            $serial_id = $request->get('serial_id');
            $behaviors = $request->get('behaviors') ?? [];

            $keep = [];

            foreach($behaviors as $key=>$behavior){
                $keep[$key] = $behavior['causecode'];
                $check = Behavior::query()->where('job_id', $job_id)->where('cause_code', $behavior['causecode'])->first();
                if(!$check){
                    $store = new Behavior();
                    $store->job_id = $job_id;
                    $store->serial_id = $serial_id;
                    $store->cause_code = $behavior['causecode'];
                    $store->cause_name = $behavior['causename'];
                    $store->behavior_name = $behavior['behaviorname'];
                    $store->catalog = $behavior['catalog'];
                    $store->sub_catalog = $behavior['subcatalog'];
                    $store->save();
                }
            }

            DB::beginTransaction();
            Behavior::query()->where('job_id', $job_id)->whereNotIn('cause_code',$keep)->delete();

            $msg_s = "<div style='display: block;gap: 20px'>
                        <p style='margin-bottom: 10px;'>บันทึกข้อมูลสำเร็จ</p>
                        <p style='margin-bottom: 10px;'>ลำดับต่อไปกรอกฟอร์ม<b>เลือกอะไหล่</b></p>
                      </div>";
            DB::commit();
            return response()->json([
                'message' => $msg_s,
                'job_id' => $job_id,
                'error' => null,
                'serial_id' => $serial_id,
                'behaviors' => $behaviors,
            ]);
        }catch (\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'behaviors' => [],
            ],400);
        }
    }
}
