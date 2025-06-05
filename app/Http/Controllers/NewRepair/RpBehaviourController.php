<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Models\Behavior;
use App\Models\JobList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PHPUnit\Util\PHP\Job;

class RpBehaviourController extends Controller
{
    public function detail(Request $request): JsonResponse
    {
        try {
            $job_id = $request->get('job_id');
            $found_job = JobList::query()->where('job_id', $job_id)->select('job_id', 'pid', 'serial_id')->first();
            if (!$found_job) {
                throw new \Exception("ไม่พบ job นี้");
            }

            $behaviour = Behavior::query()->where('job_id', $job_id)->get();
            return response()->json([
                'message' => 'success',
                'request' => $request->all(),
                'job' => $found_job,
                'behaviour' => $behaviour ?? []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getLine() . $e->getFile(),
                'request' => $request->all()
            ], 400);
        }
    }

    public function storeOrUpdate(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            $job_id = $request->get('job_id');
            $serial_id = JobList::query()->where('job_id', $job_id)->value('serial_id');
            $this->delete($job_id);
            $behaviors = $request->get('behaviors');
            if (is_array($behaviors) && !empty($behaviors)) {
                $data = array_map(function ($item) use ($serial_id,$job_id) {
                    return Behavior::query()->create([
                        'serial_id' => $serial_id,
                        'job_id' => $job_id,
                        'behavior_name' => $item['behaviorname'],
                        'catalog' => $item['catalog'],
                        'sub_catalog' => $item['sub_catalog'],
                        'cause_code' => $item['cause_code'],
                        'cause_name' => $item['cause_name'],
                    ]);
                }, $behaviors);
            }else throw new \Exception('ไม่ได้กรอกอาการ หรือ อาการมีค่าเป็น 0');
            DB::commit();
            return response()->json([
                'message' => 'success',
                'request' => $request->all(),
                'new_behaviors' => $data ?? []
            ]);
        }catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getLine() . $e->getFile(),
                'request' => $request->all()
            ],400);
        }

    }

    protected function delete($job_id) {
        return Behavior::query()->where('job_id', $job_id)->delete();
    }
}
