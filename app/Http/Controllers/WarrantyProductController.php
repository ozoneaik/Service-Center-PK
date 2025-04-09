<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarrantyProductRequest;
use App\Models\logStamp;
use App\Models\WarrantyProduct;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class WarrantyProductController extends Controller
{
    public function index(): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ลงทะเบียนรับประกัน"]);
        return Inertia::render('Warranty/Form');
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['serial_id' => 'required',], ['serial_id.required' => 'Serial ID is required']);
        $serial_id = $request->input('serial_id');
        logStamp::query()->create(['description' => Auth::user()->user_code . " ค้นหา ซีเรียล $serial_id ในหน้าลงทะเบียนรับประกัน"]);
        try {
            $response = Http::post(env('API_DETAIL'), [
                'sn' => $serial_id,
                'views' => $request->views,
            ]);
            if ($response->status() === 200) {
                $searchResults = $response->json();
                if ($searchResults['status'] === 'Fail') {
                    throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $request->sn);
                }
                $warrantyAt = WarrantyProduct::query()->where('serial_id', $serial_id)->first();
                $expire_date = $warrantyAt->expire_date ?? '';
                $warrantyAt = $warrantyAt->date_warranty ?? '';

            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }
            return response()->json([
                'searchResults' => $searchResults,
                'message' => 'success',
                'warrantyAt' => $warrantyAt,
                'expire_date' => $expire_date,
                'time' => Carbon::now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'searchResults' => [],
                'message' => $e->getMessage(),
                'time' => Carbon::now()
            ], 400);
        }
    }

    public function store(WarrantyProductRequest $request): JsonResponse
    {
//        dd($request->all());
        $dateWarranty = Carbon::parse($request->input('date_warranty'));
        $now = Carbon::now();
        $dateLimit = $now->copy()->subDays(14);


        if ($dateWarranty->gt($now)) {
            return response()->json([
                'message' => "วันที่ลงทะเบียนรับประกัน ($dateWarranty) ไม่สามารถมากกว่าวันปัจจุบัน ($now) ได้"
            ], 422);
        }

        // กรณีวันที่ลงทะเบียนย้อนหลังเกิน 14 วัน
        if ($dateWarranty->lt($dateLimit)) {
            return response()->json([
                'message' => "วันที่ลงทะเบียนรับประกัน ($dateWarranty) ไม่สามารถย้อนหลังเกิน 14 วัน (ก่อนวันที่ $dateLimit) ได้"
            ], 422);
        }


        $serial_id = $request->input('serial_id');
        logStamp::query()->create(['description' => Auth::user()->user_code . " พยายามลงทะเบียนรับประกัน $serial_id"]);
        $pid = $request->input('pid');
        $p_name = $request->input('p_name');
        $warranty_period = $request->input('warrantyperiod');
        $date_warranty = $request->input('date_warranty');
        $expire_date = Carbon::parse($date_warranty)->addMonths($warranty_period);
        try {
            DB::beginTransaction();
            WarrantyProduct::query()->create([
                'serial_id' => $serial_id,
                'pid' => $pid,
                'p_name' => $p_name,
                'date_warranty' => $date_warranty,
                'user_id' => auth()->id(),
                'user_is_code_id' => auth()->user()->is_code_cust_id,
                'warranty_period' => $warranty_period,
                'expire_date' => $expire_date,
            ]);
            $message = 'บันทึกข้อมูลเสร็จสิ้น';
            $Status = 200;
            DB::commit();
            logStamp::query()->create(['description' => Auth::user()->user_code . " ลงทะเบียนรับประกัน $serial_id สำเร็จ"]);
        } catch (\Exception $e) {
            DB::rollBack();
            $message = $e->getMessage();
            $Status = 400;
        } finally {
            return response()->json([
                'message' => $message,
            ], $Status);
        }
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'serial_id' => 'required',
            'date_warranty' => 'required',
        ]);
        $serial_id = $request->input('serial_id');
        $pid = $request->input('pid');
        WarrantyProduct::query()->where('serial_id', $serial_id)->update([
            'date_warranty' => $request->input('date_warranty'),
        ]);

        return response()->json([
            'message' => 'success',
        ]);
    }
}
