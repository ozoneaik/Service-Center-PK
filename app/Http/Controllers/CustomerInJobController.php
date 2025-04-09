<?php

namespace App\Http\Controllers;


use App\Http\Requests\CustomerInJobRequest;
use App\Models\CustomerInJob;
use App\Models\logStamp;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CustomerInJobController extends Controller
{
    public function store(CustomerInJobRequest $request): JsonResponse
    {
        $job_id = $request->get('job_id');
        logStamp::query()->create(['description'=>Auth::user()->user_code." พยายามบันทึกข้อมูลลูกค้า $job_id"]);
        $serial_id = $request->get('serial_id');
        $name = $request->get('name');
        $phone = $request->get('phone');
        $address = $request->get('address');
        $remark = $request->get('remark');
        $subremark1 = $request->get('subremark1') ?? false;
        $subremark2 = $request->get('subremark2') ?? false;
        try {
            DB::beginTransaction();
            $find = CustomerInJob::query()->where('job_id', $job_id)->first();
            if ($find) {
                $data = CustomerInJob::query()->where('job_id', $job_id)->update([
                    'name' => $name,
                    'phone' => $phone,
                    'address' => $address,
                    'remark' => $remark,
                    'subremark1' => $subremark1,
                    'subremark2' => $subremark2,
                ]);
                $data = CustomerInJob::query()->where('job_id', $job_id)->first();
            } else {
                $data = CustomerInJob::query()->create([
                    'job_id' => $job_id,
                    'serial_id' => $serial_id,
                    'name' => $name,
                    'phone' => $phone,
                    'address' => $address,
                    'remark' => $remark,
                    'subremark1' => $subremark1,
                    'subremark2' => $subremark2,
                ]);
            }
            $message = 'บันทึกข้อมูลสำเร็จ';
            $status = 200;
            logStamp::query()->create(['description'=>Auth::user()->user_code." บันทึกข้อมูลลูกค้า $job_id สำเร็จ"]);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $data = [];
            $status = 400;
            $message = $e->getMessage();
        } finally {
            return response()->json([
                'message' => $message,
                'data' => $data,
            ], $status);
        }
    }

    public function searchPhone($phone): JsonResponse
    {
        logStamp::query()->create(['description'=>Auth::user()->user_code." ค้นหาข้อมูลลูกค้าจาก เบอร์โทร"]);
        $searchPhone = CustomerInJob::query()->where('phone', $phone)->orderBy('id', 'desc')->first();
        if ($searchPhone) {
            return response()->json([
                'message' => 'success',
                'data' => $searchPhone,
            ]);
        } else {
            return response()->json([
                'message' => 'ไม่พบข้อมูล',
                'data' => [],
            ], 400);
        }
    }

}
