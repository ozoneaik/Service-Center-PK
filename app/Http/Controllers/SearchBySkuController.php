<?php

namespace App\Http\Controllers;

use App\Models\JobList;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class SearchBySkuController extends Controller
{
    public function detailSku(Request $request)
    {
        try {
            $data = $request->all();
            $response = Http::timeout(30)->post(env('VITE_API_ORDER'), [
                'pid' => $data['sku'],
                'views' => 'single'
            ]);
            if ($response->successful() && $response->status() === 200) {
                $searchResults = $response->json();
                if ($searchResults['status'] === 'SUCCESS') {
                    $searchResults = $searchResults['assets'][0];
                    $genSN = '';
                    // ค้นหา sn ที่ ขึ้นต้น 9999 แล้ว pid เท่ากับ pid
                    $job = JobList::query()
                        ->where('serial_id', 'like', "9999-%")
                        ->where('pid', $data['sku'])
                        ->whereNot('status','success')
                        ->where('is_code_key', Auth::user()->is_code_cust_id)
                        ->first();
                    if (!$job) {
                        //create Job
                        $job = $this->storeJob($searchResults);
                    }
                    return response()->json([
                        'message' => 'Job Found',
                        'serial_id' => $job->serial_id,
                    ]);
                } else throw new Exception('ไม่พบข้อมูลรหัสสินค้านี้');
            } else throw new Exception('เกิดปัญหากับการเชื่อมต่อ API');
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }

    }

    private function storeJob($data)
    {
        $is_code_4_digit = substr(Auth::user()->is_code_cust_id, 0, 4);
        $date = Carbon::now()->format('ymd');
        $genSN = '9999-' . $is_code_4_digit . $date . $data['pid'] . rand(0, 999);
        return JobList::query()->create([
            'serial_id' => $genSN,
            'job_id' => "JOB-" . Carbon::now()->timestamp . 'C' . $is_code_4_digit,
            'pid' => $data['pid'],
            'p_name' => $data['pname'],
            'p_base_unit' => $data['pbaseunit'],
            'p_cat_id' => $data['pcatid'],
            'p_cat_name' => $data['pCatName'],
            'p_sub_cat_name' => $data['pSubCatName'],
            'fac_model' => $data['facmodel'],
            'image_sku' => $data['imagesku'],
            'warranty' => isset($data['warranty']) ? $data['warranty'] : true,
            'is_code_key' => Auth::user()->is_code_cust_id,
            'user_key' => Auth::user()->user_code,
            'status' => 'pending',
        ]);
    }
}
