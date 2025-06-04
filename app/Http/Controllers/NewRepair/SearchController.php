<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\WarrantyProduct;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        if (isset($request->job_id)){
            $data = $this->searchFromHistory($request->job_id);
            return Inertia::render('NewRepair/Repair',['DATA' => $data]);
        }
        return Inertia::render('NewRepair/Repair');
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['SN' => 'required'], ['SN' => 'กรุณากรอกรหัสซีเรียล']);
        $URL = env('API_DETAIL');
        $api_label = 'P'; // P = Product, S = Serial
        $formData = [];
        try {
            $req = $request->toArray();
            if ($req['SN'] === '9999') {
                if (isset($req['PID'])) {
                    $URL = env('VITE_API_ORDER');
                    $formData['pid'] = $req['PID'];
                    $formData['views'] = 'single';
                } else {
                    $status = 400;
                    $m = '<span>กรุณากรอกรหัสสินค้า<br>เนื่องจากคุณได้กรอกหมายเลขซีเรียลเป็น 9999</span>';
                    throw new \Exception($m);
                }
            } else {
                $api_label = 'S';
                $formData['sn'] = $req['SN'];
                $formData['views'] = 'single';
            }
            // ค้นหาหมายเลขซีเรียล
            $response = $this->fetchDataFromApi($URL, $formData,$api_label);
            if ($response['status']) {
                return response()->json([
                    'message' => 'ดึงข้อมูลสำเร็จ',
                    'data' => $response,
                ]);
            }else{
                throw new \Exception($response['message']);
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getFile() . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'data' => [],
            ], $status ?? 500);
        }
    }

    private function fetchDataFromApi($URL, $formData,$api_label): array
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($URL, $formData);
            $responseJson = $response->json();
            if ($response->status() == 200 && $responseJson['status'] === 'SUCCESS') {
                $response_json = $response->json();


                if ($api_label === 'P') {
                    $sku_list = $response_json['assets'][0];
                    $sku_list['serial_id'] = 'จะแสดงเมื่อแจ้งซ่อม';
                    return [
                        'status' => true,
                        'combo_set' => false,
                        'sku_list' => [$sku_list],
                    ];
                }else{
                    $sku_arr = $response_json['skuset'];
                    $assets_new_format = array_map(function ($sku) use ($response_json) {
                        return $response_json['assets'][$sku];
                    }, $sku_arr);
                    $combo_set = false;
                    if (count($assets_new_format) > 1) $combo_set = true;


                    return [
                        'status' => true,
                        'combo_set' => $combo_set,
                        'sku_list' => $assets_new_format,
                    ];
                }
                // เช็คก่อนว่า เป็น combo set หรือไม่
            } else {
                $m = "<span>เกิดข้อผิดพลาด server กรุณาติดต่อผู้ดูแลระบบ <br/> เบอร์ 02-8995928 ต่อ 266</span>";
                throw new \Exception($m);
            }
        }catch (\Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
                'combo_set' => null,
                'sku_list' => null,
            ];
        }

    }

    private function searchFromHistory($job_id){
        $findDetail = JobList::query()
            ->where('job_id',$job_id)
            ->orderBy('id','desc')
            ->first();
        if ($findDetail) {
            return $findDetail;
        }else{
            return [];
        }
    }
}
