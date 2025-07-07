<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\JobList;
use App\Models\Qu;
use App\Models\Remark;
use App\Models\SparePart;
use App\Models\StoreInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class RpAfQuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $job_id = $request->get('job_id');
        $qus = Qu::findByJobId($job_id);
        return response()->json([
           'message' => 'success',
           'list' => $qus,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $job_id = $request->get('job_id');
            $spare_parts = SparePart::findByJobId($job_id);
            if (count($spare_parts) === 0) {
                throw new \Exception('ไม่สามารถสร้างใบ qu ได้เนืองจาก ไม่พบรายการสินค้า');
            } else {
                $spare_parts_format = [];
                foreach ($spare_parts as $key => $spare_part) {
                    $spare_parts_format[$key]['pid'] = $spare_part['spcode'];
                    $spare_parts_format[$key]['name'] = $spare_part['spname'];
                    $spare_parts_format[$key]['price'] = $spare_part['price_multiple_gp'];
                    $spare_parts_format[$key]['prod_discount'] = 20;
                    $spare_parts_format[$key]['unit'] = $spare_part['sp_unit'] ?? 'อัน';
                    $spare_parts_format[$key]['qty'] = $spare_part['qty'];
                }
                $job = JobList::query()->where('job_id', $job_id)->first();
                $customer = CustomerInJob::findByJobId($job_id);
                $store_information = StoreInformation::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();
                $remark = Remark::findByJobId($job_id);
                $behaviours = Behavior::findByJob($job_id);
                $cause_remark = '';
                foreach ($behaviours as $behaviour) {
                    $cause_remark .= $behaviour['cause_name'] . ' / ';
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
                $response = Http::post(env('VITE_GEN_QU'), $data);
                if ($response->status() == 200) {
                    $Json = $request->json();
                    if (gettype($Json) === 'array' && $Json['status']) {
                        throw new \Exception($Json['message']);
                    } else {
                        $status = 200;
                        $message = 'ทำใบ qu สำเร็จ';
                        $pathUrl = trim($response->body(), '"');
                    }
                } else {
                    throw new \Exception('ไม่สามารถ ทำใบ QU สำเร็จ');
                }
            }

            $cleanUrl = str_replace('\\/', '/', $pathUrl);


            $file = file_get_contents($cleanUrl);
            $file_name = basename($cleanUrl);
            $path_file = 'qu_file/'.$file_name;
            Storage::disk('public')->put('qu_file/'.$file_name, $file);

            DB::beginTransaction();

            $store_qu = Qu::query()->create([
                'job_id' => $job_id,
                'file_name' => $file_name,
                'file_path' => $path_file,
            ]);

            $full_path_file = asset('storage/' . $path_file);


            DB::commit();

            return response()->json([
                'message' => $message,
                'store_qu' => $store_qu,
                'full_file_path' => $full_path_file,
                'error' => null,
            ], $status);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'store_qu' => null,
                'full_file_path' => null,
                'error' => $e->getMessage() . $e->getLine() . $e->getFile(),
            ], $status ?? 400);
        }
    }
}
