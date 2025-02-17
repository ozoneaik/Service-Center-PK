<?php

namespace App\Http\Controllers;


use App\Http\Requests\CustomerInJobRequest;
use App\Models\CustomerInJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CustomerInJobController extends Controller
{
    public function store (CustomerInJobRequest $request) :JsonResponse {
        $job_id = $request->get('job_id');
        $name = $request->get('name');
        $phone = $request->get('phone');
        try {
            DB::beginTransaction();
            $find = CustomerInJob::query()->where('job_id', $job_id)->first();
            if ($find){
                $data = CustomerInJob::query()->update([
                    'name' => $name,
                    'phone' => $phone,
                ]);
            }else{
                $data = CustomerInJob::query()->create([
                   'job_id' => $job_id,
                   'name' => $name,
                   'phone' => $phone,
                ]);
            }
            $message = 'บันทึกข้อมูลสำเร็จ';
            $status = 200;
            DB::commit();
        }catch (\Exception $e){
            DB::rollBack();
            $data = [];
            $status = 400;
            $message = $e->getMessage();
        } finally {
            return response()->json([
               'message' => $message,
                'data' => $data,
            ],$status);
        }
    }
    public function update (CustomerInJobRequest $request) :JsonResponse {
        $name = $request->get('name');
        $phone = $request->get('phone');
        try {
            DB::beginTransaction();
            $data = CustomerInJob::query()->create([
                'name' => $name,
                'phone' => $phone,
            ]);
            $message = 'บันทึกข้อมูลสำเร็จ';
            $status = 200;
            DB::commit();
        }catch (\Exception $e){
            DB::rollBack();
            $data = [];
            $status = 400;
            $message = $e->getMessage();
        } finally {
            return response()->json([
                'message' => $message,
                'data' => $data,
            ],$status);
        }
    }

}
