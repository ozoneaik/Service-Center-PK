<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\ClaimDetail;
use App\Models\ClaimFileUpload;
use App\Models\StoreInformation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ApiSpareClaimController extends Controller
{
    private function fetchShopsForSale($saleCode)
    {
        $loginAndGetToken = function () {
            $authUrl = 'https://pkapi.pumpkin.tools/api/auth/login';
            $authResponse = Http::post($authUrl, [
                'username' => 'B68263',
                'password' => 'Par@68263',
            ]);
            if ($authResponse->successful()) {
                return $authResponse->json()['access_token'];
            }
            return null;
        };

        $token = Cache::remember('pk_api_token', 60 * 50, function () use ($loginAndGetToken) {
            return $loginAndGetToken();
        });

        if (!$token) throw new \Exception('Login Failed');

        $cacheKey = "shops_for_sale_{$saleCode}";


        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $dataUrl = 'https://pkapi.pumpkin.tools/api/getCustInSales';
        $shopResponse = Http::withToken($token)->asMultipart()->post($dataUrl, ['sale_code' => $saleCode]);

        if ($shopResponse->status() === 401) {
          
            Cache::forget('pk_api_token');

            $newToken = $loginAndGetToken();

            if ($newToken) {
                Cache::put('pk_api_token', $newToken, 60 * 50);
                $shopResponse = Http::withToken($newToken)->asMultipart()->post($dataUrl, ['sale_code' => $saleCode]);
            }
        }

        if ($shopResponse->successful()) {
            $result = $shopResponse->json();
            if (isset($result['status']) && $result['status'] == true) {
                // จำข้อมูลร้านค้าไว้ 10 นาที
                Cache::put($cacheKey, $result['data'], 60 * 10);
                return $result['data'];
            }
        }

        return [];
    }

    public function apiGetShops(Request $request)
    {
        $userCode = $request->query('user_code');
        if (!$userCode) return response()->json([]);

        try {
            $apiShops = $this->fetchShopsForSale($userCode);

            if (empty($apiShops)) {
                return response()->json([]);
            }

            $externalShopIds = collect($apiShops)->pluck('cust_id')->filter()->toArray();

            // ตรงนี้ Query DB ปกติ เร็วอยู่แล้ว
            $localShops = StoreInformation::whereIn('is_code_cust_id', $externalShopIds)
                ->select('is_code_cust_id', 'shop_name')
                ->orderBy('shop_name', 'asc')
                ->get();

            $shops = $localShops->map(function ($shop) {
                return [
                    'id' => $shop->is_code_cust_id,
                    'name' => '[' . $shop->is_code_cust_id . '] ' . $shop->shop_name
                ];
            });

            return response()->json($shops);
        } catch (\Exception $e) {
            Log::error("API Get Shops Error: " . $e->getMessage());
            Cache::forget('pk_api_token');
            return response()->json([]);
        }
    }

    public function apiList(Request $request)
    {
        $userCode = $request->query('user_code');
        $filterShop = $request->query('shop');
        $filterStatus = $request->query('status');
        $filterReceive = $request->query('receive_status');

        if (!$userCode) {
            return response()->json(['error' => 'User Code required'], 400);
        }

        $shopIds = [];
        try {
            // เรียกผ่าน Cache เช่นกัน ทำให้หน้า List โหลดเร็วขึ้นมาก
            $apiShops = $this->fetchShopsForSale($userCode);
            if (!empty($apiShops)) {
                $shopIds = collect($apiShops)->pluck('cust_id')->toArray();
            }
        } catch (\Exception $e) {
            Log::error("API List Fetch Shops Error: " . $e->getMessage());
            // ถ้าโหลดร้านไม่ผ่าน ก็ยังให้ทำงานต่อได้
        }

        $history = Claim::query()
            ->where(function ($q) use ($userCode, $shopIds) {
                if (!empty($shopIds)) {
                    $q->whereIn('user_id', $shopIds);
                } else {
                    $q->where('user_id', $userCode);
                }
            })
            ->when($filterShop, function ($q) use ($filterShop) {
                return $q->where('user_id', $filterShop);
            })
            ->when($filterStatus, function ($q) use ($filterStatus) {
                return $q->where('status', $filterStatus);
            })
            ->when($filterReceive && $filterReceive !== 'all', function ($q) use ($filterReceive) {
                return $q->where('receive_status', $filterReceive);
            })
            ->select('claim_id', 'created_at', 'updated_at', 'status', 'receive_status')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $formatted = $history->map(function ($item) {
            return [
                'claim_id' => $item->claim_id,
                'date' => Carbon::parse($item->created_at)->format('d/m/Y'),
                'update' => Carbon::parse($item->updated_at)->format('d/m/Y'),
                'status_raw' => $item->status,
                'receive_raw' => $item->receive_status ?? 'N',
                'status_label' => match ($item->status) {
                    'pending' => 'กำลังตรวจสอบคำขอเคลม',
                    'approved' => 'อนุมัติคำสั่งส่งเคลม',
                    'rejected' => 'ไม่อนุมัติ',
                    'กำลังจัดเตรียมสินค้า' => 'กำลังจัดเตรียมสินค้า',
                    'อยู่ระหว่างจัดส่ง' => 'อยู่ระหว่างจัดส่ง',
                    'จัดส่งสำเร็จ' => 'จัดส่งสำเร็จ',
                    default => 'ไม่สามารถระบุได้'
                },
                'status_color' => match ($item->status) {
                    'pending' => 'bg-secondary',
                    'approved', 'จัดส่งสำเร็จ' => 'bg-success',
                    'rejected' => 'bg-danger',
                    'กำลังจัดเตรียมสินค้า' => 'bg-info',
                    'อยู่ระหว่างจัดส่ง' => 'bg-warning',
                    default => 'bg-info'
                }
            ];
        });

        return response()->json($formatted);
    }

    public function apiReceiveUpdate(Request $request)
    {
        //  Validate ข้อมูล
        $validator = Validator::make($request->all(), [
            'claim_id' => 'required|exists:claims,claim_id',
            'items' => 'required|array',      // รายการสินค้าที่จะรับ
            'items.*.id' => 'required',       // ID ของ claim_details
            'items.*.qty' => 'required|numeric|min:1',
            'images' => 'required|array',     // รูปภาพ
            'images.*' => 'image|max:10240',  // ต้องเป็นไฟล์รูป
            'remark' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            DB::beginTransaction();

            // หา Claim
            $claim = Claim::where('claim_id', $request->claim_id)->first();

            // Update รายการสินค้า
            foreach ($request->items as $item) {
                // แปลง array เป็น object ถ้าจำเป็น
                $detailId = $item['id'];
                $qty = $item['qty'];

                ClaimDetail::where('id', $detailId)->update(['rc_qty' => $qty]);
            }

            // คำนวณสถานะรวม (Active/Partial/Complete)
            $allDetails = ClaimDetail::where('claim_id', $request->claim_id)->get();
            $totalQty = $allDetails->sum('qty');
            $totalReceived = $allDetails->sum('rc_qty');

            $status = 'N';
            if ($totalReceived >= $totalQty) $status = 'Y';
            elseif ($totalReceived > 0) $status = 'P';

            // Update Claim Header
            $receiveBy = $request->input('user_code', 'API_USER');

            $claim->update([
                'receive_status' => $status,
                'receive_by' => $receiveBy,
                'updated_at' => now()
            ]);

            // บันทึกรูปภาพ
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $fileName = 'receive_' . $request->claim_id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('uploads/claims', $fileName, 'public');

                    ClaimFileUpload::create([
                        'claim_id' => $request->claim_id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'remark' => $request->remark
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'บันทึกการรับอะไหล่สำเร็จ', 'status' => $status]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("API Receive Error: " . $e->getMessage());
            return response()->json(['error' => 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'], 500);
        }
    }

    public function apiGetClaimDetail($claim_id)
    {
        // ค้นหา Claim
        $claim = Claim::where('claim_id', $claim_id)->first();

        if (!$claim) {
            return response()->json(['error' => 'ไม่พบข้อมูลเอกสารเคลม'], 404);
        }

        // ดึงรายการสินค้า
        $details = ClaimDetail::where('claim_id', $claim_id)
            ->select('id', 'sp_code', 'sp_name', 'qty', 'rc_qty', 'unit')
            ->get();

        $formattedDetails = $details->map(function ($item) {
            return [
                'id' => $item->id,
                'sp_code' => $item->sp_code,
                'sp_name' => $item->sp_name,
                'qty_total' => $item->qty,
                'qty_received' => $item->rc_qty,
                'qty_remaining' => $item->qty - $item->rc_qty,
                'unit' => $item->unit,
                'is_complete' => ($item->qty <= $item->rc_qty)
            ];
        });

        // ดึงรูปภาพ
        $images = ClaimFileUpload::where('claim_id', $claim_id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($img) {
                return [
                    'id' => $img->id,
                    'url' => $img->full_file_path,
                    'file_name' => $img->file_name,
                    'remark' => $img->remark,
                    'created_at' => $img->created_at->format('d/m/Y H:i')
                ];
            });

        // (แก้ไข) ดึงหมายเหตุล่าสุด "ที่มีข้อความ" (ไม่เอาค่าว่าง)
        $lastRemarkObj = ClaimFileUpload::where('claim_id', $claim_id)
            ->whereNotNull('remark')
            ->where('remark', '!=', '') // กรองค่าว่างทิ้ง
            ->orderBy('created_at', 'desc')
            ->first();

        $lastRemark = $lastRemarkObj ? $lastRemarkObj->remark : null;

        // ส่ง Response
        return response()->json([
            'claim_id' => $claim->claim_id,
            'status' => $claim->status,
            'items' => $formattedDetails,
            'images' => $images,
            'remark' => $lastRemark
        ]);
    }
}