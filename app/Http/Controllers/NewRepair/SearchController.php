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
                $formData['sn'] = $req['SN'];
                $formData['views'] = 'single';
            }
            // ค้นหาหมายเลขซีเรียล
            $response = $this->fetchDataFromApi($URL, $formData);
            if ($response['status']) {
                return response()->json([
                    'message' => 'ดึงข้อมูลสำเร็จ',
                    'data' => $response['data'],
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

    private function fetchDataFromApi($URL, $formData): array
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($URL, $formData);
            $responseJson = $response->json();
            if ($response->status() == 200 && $responseJson['status'] === 'SUCCESS') {
                // เช็ค warranty ใน ระบบ
                $findWarranty = WarrantyProduct::query()->where('serial_id',$formData['sn'])->first();
                if ($findWarranty) {
                    $dateWarranty = Carbon::parse($findWarranty->date_warranty);
                    $expireDate = Carbon::parse($findWarranty->expire_date);
                    $now = Carbon::now();
                    if ($now->greaterThanOrEqualTo($dateWarranty) && $now->lessThanOrEqualTo($expireDate)) {
                        $responseJson['assets'][0]['warranty_status'] = true;
                    } else $responseJson['assets'][0]['warranty_status'] = false;
                }else{
                    $responseJson['assets'][0]['warranty_status'] = $responseJson['warrantyexpire'];
                }
                return [
                    'status' => true,
                    'message' => 'ดึงข้อมูลสำเร็จ',
                    'data' => $responseJson['assets'][0]
                ];
            } else {
                $m = "<span>เกิดข้อผิดพลาด server กรุณาติดต่อผู้ดูแลระบบ <br/> เบอร์ 02-8995928 ต่อ 266</span>";
                throw new \Exception($m);
            }
        }catch (\Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
                'data' => []
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
