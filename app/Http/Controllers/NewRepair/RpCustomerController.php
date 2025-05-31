<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Http\Requests\Repair\CustomerRequest;
use App\Models\CustomerInJob;
use App\Models\JobList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RpCustomerController extends Controller
{
    public function detail(Request $request): JsonResponse
    {
        $job_id = $request->get('job_id');
        $job = JobList::query()->where('job_id', $job_id)->select('serial_id')->first();
        $serial_id = $job->serial_id;
        $customer = CustomerInJob::query()->where('job_id', $job_id)->first();
        $message = 'empty';
        if ($customer) {
            $message = 'ดึงข้อมูลลุกค้าแล้ว ตรวจพบข้อมูล';
        }else{
            $message = 'ดึงข้อมูลลุกค้าแล้ว ไม่พบข้อมูลลูกค้า';
        }
        return response()->json([
            'customer' => $customer ?? null,
            'job_id' => $job_id ?? null,
            'serial_id' => $serial_id ?? null,
            'message' => $message,
        ]);
    }

    public function storeOrUpdate(CustomerRequest $request) : JsonResponse
    {
        try {
            $data = $request->all();
            $customer = CustomerInJob::query()->where('job_id', $data['job_id'])->first();

            $customerData = [
                'name' => $data['name'],
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null,
                'remark' => $data['remark'] ?? null,
                'subremark1' => $data['subremark1'] ?? false,
                'subremark2' => $data['subremark2'] ?? false,
            ];

            if ($customer) {
                $customer->update($customerData);
            } else {
                $customerData['job_id'] = $data['job_id'];
                $customerData['serial_id'] = $data['serial_id'];
                $customer = CustomerInJob::query()->create($customerData);
            }

            return response()->json([
                'customer' => $customer,
                'message' => 'บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



}
