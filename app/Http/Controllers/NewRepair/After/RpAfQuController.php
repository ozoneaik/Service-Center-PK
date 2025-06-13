<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\JobList;
use App\Models\SparePart;
use App\Models\StoreInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class RpAfQuController extends Controller
{
    public function index(Request $request) {
        $job_id = $request->get('job_id');
        $remark = '';
        $cause_remark = '';
        try {
            $job = JobList::query()->where('job_id', $job_id)->first();
            $customer = CustomerInJob::findByJobId($job_id);
            if ($customer['subremark1']) $remark .= 'เสนอราคาก่อนซ่อม / ';
            if ($customer['subremark2']) $remark .= 'ซ่อมเสร็จส่งกลับทางไปรษณีย์ / ';
            if ($customer['subremark3']) $remark .= $customer['remark'];
            $store_information = StoreInformation::query()->where('is_code_cust_id' ,$job->is_code_key)->first();
            $spare_parts = SparePart::findByJobId($job_id);
            $behaviours = Behavior::findByJob($job_id);
            foreach ($behaviours as $behaviour) {
                $cause_remark .= $behaviour['cause_name'].' / ';
            }


            if (count($spare_parts) === 0){
                throw new  \Exception('ไม่พบรายการอะไหล่ กรุณากรอกฟอร์มอะไหล่ก่อนครับ');
            }

            $spare_parts_format = [];

            foreach ($spare_parts as $key=>$spare_part) {
                $spare_parts_format[$key]['pid'] = $spare_part['spcode'];
                $spare_parts_format[$key]['name'] = $spare_part['spname'];
                $spare_parts_format[$key]['price'] = $spare_part['price_per_unit'];
                $spare_parts_format[$key]['prod_discount'] = 20;
                $spare_parts_format[$key]['unit'] = $spare_part['sp_unit'] ?? 'อัน';
                $spare_parts_format[$key]['qty'] = $spare_part['qty'];
            }

            $data = [
                "serial" => $job['serial_id'],
                'req' => 'path',
                "regenqu" => "Y",
                "typeservice" => "SC",
                "docqu" => "QU-" . str_replace('JOB-', '', $job['job_id']),
                "custaddr" => $customer['address'] ?? 'ไม่ได้ระบุ',
                'custnamesc' => $customer['name'],
                "sku" => $spare_parts_format,
                "fgcode" => $job['pid'],
                "fgname" => $job['p_name'],
                "custname" => $store_information['shop_name'],
                "custtel" => $customer['phone'],
                "empcode" => Auth::user()->user_code,
                "empname" => Auth::user()->name,
                "remark" => $remark,
                "cause_remark" => $cause_remark,
            ];

            $response = Http::post('http://192.168.0.13/genpdf/api/qu_ass', $data);
            if ($response->status() == 200) {
                $Json = $request->json();
                if (gettype($Json) === 'array' && $Json['status']) {
                    throw new \Exception($Json['message']);
                }else{
                    $status = 200;
                    $message = 'ทำใบ qu สำเร็จ';
                    $pathUrl = trim($response->body(), '"');
                }
            }else {
                throw new \Exception('ไม่สามารถ ทำใบ QU สำเร็จ');
            }
            return response()->json([
                'message' => 'success',
                'error' => null,
                'job' => $job,
                'customer' => $customer,
                'store_information' => $store_information,
                'spare_found' => true,
                'spare_parts' => $spare_parts_format,
                'pathUrl' => $pathUrl,
            ]);
        }catch (\Exception $e){
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getLine() . $e->getFile(),
                'job' => [],
                'customer' => [],
                'store_information' => [],
                'spare_found' => false,
                'spare_parts' => [],
                'pathUrl' => null,
            ],400);
        }
    }
}
