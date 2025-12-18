<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClaimRequest;
use App\Models\Claim;
use App\Models\ClaimDetail;
use App\Models\ClaimFileUpload;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\SparePart;
use App\Models\StoreInformation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SpareClaimController extends Controller
{
    // ปรับปรุงฟังก์ชัน index เพื่อรวมเคลมด่วนและเคลมปกติ (วิว)
    // public function index(): Response
    // {
    //     $isCodeKey = Auth::user()->is_code_cust_id;

    //     //  1. เคลมด่วน (pending)
    //     $urgentParts = SparePart::query()
    //         ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
    //         ->select('spare_parts.*', 'job_lists.status as job_status')
    //         ->where('spare_parts.claim', true)
    //         ->where('spare_parts.claim_remark', 'เคลมด่วน')
    //         ->where('spare_parts.status', 'pending')
    //         ->where('job_lists.is_code_key', $isCodeKey)
    //         ->orderByDesc('spare_parts.created_at')
    //         ->get();

    //     // 2. เคลมปกติ (ไม่ใช่เคลมด่วน แต่ job ปิดงานแล้ว) 
    //     $normalParts = SparePart::query()
    //         ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
    //         ->select('spare_parts.*', 'job_lists.status as job_status')
    //         ->where('spare_parts.claim', true)
    //         ->where(function ($q) {
    //             $q->whereNull('spare_parts.claim_remark')
    //                 ->orWhere('spare_parts.claim_remark', '!=', 'เคลมด่วน');
    //         })
    //         ->where('spare_parts.status', 'pending')
    //         ->where('job_lists.status', 'success')
    //         ->where('job_lists.is_code_key', $isCodeKey)
    //         ->orderByDesc('spare_parts.created_at')
    //         ->get();

    //     // รวมทั้งสองประเภท
    //     $allParts = $urgentParts->merge($normalParts);

    //     // Group ตาม sp_code
    //     $grouped = collect($allParts)->groupBy('sp_code')->map(function ($items, $sp_code) {
    //         $first = $items->first();
    //         return [
    //             'sp_code' => $sp_code,
    //             'sp_name' => $first->sp_name,
    //             'sp_unit' => $first->sp_unit,
    //             'qty'     => $items->sum('qty'),
    //             'type'    => $first->claim_remark === 'เคลมด่วน' ? 'เคลมด่วน' : 'เคลมปกติ',
    //             'detail'  => $items->values(),
    //         ];
    //     })->values();

    //     return Inertia::render('SpareClaim/ClaimMain', [
    //         'spareParts' => $grouped,
    //     ]);
    // }

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $shops = [];
        $selectedShop = null;

        // ตรวจสอบสิทธิ์: ถ้าเป็น Admin
        if ($user->role === 'admin') {
            // 1. ดึงรายชื่อร้านค้าทั้งหมดมาให้เลือก
            $shops = StoreInformation::select('is_code_cust_id', 'shop_name')
                ->orderBy('shop_name')
                ->get();

            // 2. รับค่าจาก Filter (ถ้ามี)
            $selectedShop = $request->query('shop');
        } else {
            // ถ้าเป็น User ธรรมดา ให้ล็อคดูได้แค่ร้านตัวเอง
            $selectedShop = $user->is_code_cust_id;
        }

        // ฟังก์ชันช่วย Query (เพื่อลด Code ซ้ำ)
        $applyShopFilter = function ($query) use ($selectedShop) {
            // ถ้ามีค่าร้านค้า (Admin เลือก หรือเป็น User ธรรมดา) ให้กรอง
            // ถ้า Admin ไม่เลือก ($selectedShop = null) จะดึงทั้งหมด
            if ($selectedShop) {
                $query->where('job_lists.is_code_key', $selectedShop);
            }
        };

        //  1. เคลมด่วน (pending)
        $urgentParts = SparePart::query()
            ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
            ->select('spare_parts.*', 'job_lists.status as job_status', 'job_lists.is_code_key')
            ->where('spare_parts.claim', true)
            ->where('spare_parts.claim_remark', 'เคลมด่วน')
            ->where('spare_parts.status', 'pending')
            ->tap($applyShopFilter) // ใช้ tap เรียกฟังก์ชันกรอง
            ->orderByDesc('spare_parts.created_at')
            ->get();

        // 2. เคลมปกติ (ไม่ใช่เคลมด่วน แต่ job ปิดงานแล้ว) 
        $normalParts = SparePart::query()
            ->leftJoin('job_lists', 'spare_parts.job_id', '=', 'job_lists.job_id')
            ->select('spare_parts.*', 'job_lists.status as job_status', 'job_lists.is_code_key')
            ->where('spare_parts.claim', true)
            ->where(function ($q) {
                $q->whereNull('spare_parts.claim_remark')
                    ->orWhere('spare_parts.claim_remark', '!=', 'เคลมด่วน');
            })
            ->where('spare_parts.status', 'pending')
            ->where('job_lists.status', 'success')
            ->tap($applyShopFilter) // ใช้ tap เรียกฟังก์ชันกรอง
            ->orderByDesc('spare_parts.created_at')
            ->get();

        // รวมทั้งสองประเภท
        $allParts = $urgentParts->merge($normalParts);

        // Group ตาม sp_code
        $grouped = collect($allParts)->groupBy('sp_code')->map(function ($items, $sp_code) {
            $first = $items->first();
            return [
                'sp_code' => $sp_code,
                'sp_name' => $first->sp_name,
                'sp_unit' => $first->sp_unit,
                'qty'     => $items->sum('qty'),
                'type'    => $first->claim_remark === 'เคลมด่วน' ? 'เคลมด่วน' : 'เคลมปกติ',
                'detail'  => $items->values(),
            ];
        })->values();

        return Inertia::render('SpareClaim/ClaimMain', [
            'spareParts' => $grouped,
            'shops' => $shops, // ส่งรายการร้านค้าไป Frontend
            'filters' => [ // ส่งค่าที่เลือกปัจจุบันไป Frontend
                'shop' => $selectedShop,
            ],
            'isAdmin' => $user->role === 'admin' // ส่งสถานะแอดมินไป
        ]);
    }

    public function store(ClaimRequest $request): JsonResponse
    {
        // dd($request->all());
        $claim_id = 'C-' . Carbon::now()->timestamp . rand(1000, 9999);
        logStamp::query()->create(['description' => Auth::user()->user_code . " พยายามสร้างเอกสารเคลม $claim_id"]);
        $selected = $request->input('selected');
        $items = [];
        //        "{\\"text\\":\\"ศูนย์ซ่อม : hello world\\\\nแจ้งเรื่อง : เคลม\\\\nรายการ :\\\\n\\\\nSP50122-01*1\\\\nSP50122-02*1\\\\nSP50122-03*1\\"}"}
        DB::beginTransaction();
        Claim::query()->create([
            'claim_id' => $claim_id,
            'user_id' => Auth::user()->is_code_cust_id,
        ]);
        try {
            foreach ($selected as $key => $claim) {
                $items[] = "{$claim['sp_code']}*{$claim['qty']}";
                foreach ($claim['detail'] as $k => $value) {
                    $sp = SparePart::query()
                        ->where('job_id', $value['job_id'])
                        ->where('sp_code', $value['sp_code'])->first();
                    $sp->update(['status' => 'success']);
                    ClaimDetail::query()->create([
                        'claim_id' => $claim_id,
                        'serial_id' => $sp['serial_id'],
                        'job_id' => $sp['job_id'],
                        'sp_code' => $sp->sp_code,
                        'sp_name' => $sp->sp_name,
                        'claim_submit_date' => Carbon::now(),
                        'qty' => $sp->qty,
                        'unit' => $sp->sp_unit,
                    ]);
                }
            }
            $store_info = StoreInformation::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();
            $text_claim_id = "รหัสเอกสารเคลม : $claim_id";
            $text = "ศูนย์ซ่อม : " . $store_info->shop_name . "\n$text_claim_id" . "\nแจ้งเรื่อง : เคลมอะไหล่\nรายการ :\n\n" . implode("\n", $items);
            $token_lark = StoreInformation::query()
                ->leftJoin('sale_information', 'sale_information.sale_code', 'store_information.sale_id')
                ->where('store_information.is_code_cust_id', Auth::user()->is_code_cust_id)
                ->select('sale_information.lark_token')->first();
            $body = [
                "receive_id" => $token_lark->lark_token,
                "msg_type" => "text",
                "content" => json_encode(["text" => $text], JSON_UNESCAPED_UNICODE)
            ];
            $response = Http::post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', [
                'app_id' => env('VITE_LARK_APP_ID'),
                'app_secret' => env('VITE_LARK_APP_SECRET')
            ]);

            $message = 'สร้างเอกสารการเคลมสำเร็จ';
            if ($response->successful()) {
                $responseJson = $response->json();
                $tenant_access_token = $responseJson['tenant_access_token'];

                $responseSend = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $tenant_access_token,
                ])->post('https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id', $body);
                if (!$responseSend->successful()) {
                    $message = 'สร้างเอกสารการเคลมสำเร็จ แต่ไม่สามารถส่งการแจ้งเตือนไปหาเซลล์ประจำร้านได้';
                }
            } else {
                $message = 'สร้างเอกสารการเคลมสำเร็จ แต่ไม่สามารถส่งการแจ้งเตือนไปหาเซลล์ประจำร้านได้';
            }

            DB::commit();
            logStamp::query()->create(['description' => Auth::user()->user_code . " สร้างเอกสารเคลม $claim_id สำเร็จ"]);
            return response()->json([
                'message' => $message
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();
            return response()->json([
                'message' => $exception->getMessage()
            ], 400);
        }
    }

    // public function historyShow(): Response
    // {
    //     $history = Claim::query()
    //         ->where('user_id', Auth::user()->is_code_cust_id)->orderByDesc('created_at')->get();
    //     foreach ($history as $h) {
    //         $h['list'] = ClaimDetail::query()
    //             ->where('claim_details.claim_id', $h->claim_id)
    //             ->get();
    //     }
    //     return Inertia::render('SpareClaim/HistoryClaimNew', [
    //         'history' => $history
    //     ]);
    // }

    public function historyShow(Request $request): Response
    {
        $user = Auth::user();
        $shops = [];
        $areas = [];
        $selectedShop = $request->query('shop');
        $selectedArea = $request->query('area');
        $selectedReceiveStatus = $request->query('receive_status');
        $selectedStatus = $request->query('status');

        $isSale = session('is_sales_rep', false) || $user->role === 'sale';
        $currentSale = null;

        if ($user->role === 'admin') {
            $shops = StoreInformation::select('is_code_cust_id', 'shop_name')
                ->orderBy('shop_name')
                ->get();
        } else if ($isSale) {
            try {
                $apiShops = $this->fetchShopsForSale($user->user_code);
                $collectionShops = collect($apiShops);

                // เก็บข้อมูล Sale จาก API เพื่อแสดงผล Info
                $saleData = $collectionShops->first();
                $currentSale = [
                    'name' => $saleData['sale_name'] ?? $user->name,
                    'code' => $user->user_code
                ];

                // กรองเฉพาะร้านที่มีอยู่ในฐานข้อมูลของเรา
                $apiCustIds = $collectionShops->pluck('cust_id')->toArray();
                $existingInDb = StoreInformation::whereIn('is_code_cust_id', $apiCustIds)
                    ->pluck('is_code_cust_id')
                    ->toArray();
                $collectionShops = $collectionShops->whereIn('cust_id', $existingInDb);

                // จัดฟอร์แมตข้อมูลสำหรับ Area และ Shops
                $areas = $collectionShops->map(fn($item) => [
                    'code' => $item['sale_area_code'],
                    'name' => $item['sale_area_name']
                ])->unique('code')->values();

                $shops = $collectionShops->map(fn($item) => [
                        'is_code_cust_id' => $item['cust_id'],
                        'shop_name' => $item['cust_name'],
                        'sale_name' => $item['sale_name'] ?? '-',
                        'sale_area_code' => $item['sale_area_code'],
                        'sale_area_name' => $item['sale_area_name']
                ])->values();
            } catch (\Exception $e) {
                Log::error("Failed to fetch sales shops: " . $e->getMessage());
            }
        } else {
            $selectedShop = $user->is_code_cust_id;
        }

        $history = Claim::query()
            ->when($selectedReceiveStatus, fn($q, $s) => $q->where('receive_status', $s))
            ->when($selectedStatus, fn($q, $s) => $q->where('status', $s))
            ->where(function ($query) use ($user, $isSale, $selectedShop, $selectedArea, $shops) {
                if ($user->role === 'admin') {
                    if ($selectedShop) {
                        $query->where('user_id', $selectedShop);
                    } else {
                        $query->where('user_id', $user->is_code_cust_id);
                    }
                } elseif ($isSale) {
                    if ($selectedShop) {
                        $query->where('user_id', $selectedShop);
                    } elseif ($selectedArea) {
                        $shopIdsInArea = collect($shops)->where('sale_area_code', $selectedArea)->pluck('is_code_cust_id')->toArray();
                        $query->whereIn('user_id', $shopIdsInArea ?: ['none']);
                    } else {
                        // DEFAULT สำหรับ SALE: ถ้าไม่เลือก Filter ให้เห็นเฉพาะร้านที่ตัวเองดูแล
                        $myShopIds = collect($shops)->pluck('is_code_cust_id')->toArray();
                        $query->whereIn('user_id', $myShopIds ?: ['none']);
                    }
                } else {
                    // User ทั่วไป
                    $query->where('user_id', $user->is_code_cust_id);
                }
            })
            ->orderByDesc('created_at')
            ->get();

        foreach ($history as $h) {
            $h['list'] = ClaimDetail::where('claim_id', $h->claim_id)->get();
            if ($h->receive_status === 'Y') {
                $evidences = ClaimFileUpload::where('claim_id', $h->claim_id)->get();
                $h['receive_evidence'] = [
                    'images' => $evidences->map(fn($f) => asset('storage/' . $f->file_path)),
                    'remark' => $evidences->first()->remark ?? ''
                ];
            }
        }

        return Inertia::render('SpareClaim/HistoryClaimNew', [
            'history' => $history,
            'shops' => $shops,
            'areas' => $areas,
            'currentSale' => $currentSale,
            'filters' => [
                'shop' => $selectedShop,
                'area' => $selectedArea,
                'receive_status' => $selectedReceiveStatus,
                'status' => $selectedStatus,
            ],
            'userRole' => $user->role,
            'isAdmin' => $user->role === 'admin' || $isSale
        ]);
    }

    private function fetchShopsForSale($saleCode)
    {
        $authUrl = 'https://pkapi.pumpkin.tools/api/auth/login';
        $authResponse = Http::post($authUrl, [
            'username' => 'B68263',
            'password' => 'Par@68263',
        ]);

        if (!$authResponse->successful()) {
            throw new \Exception('Failed to login to external API');
        }

        $token = $authResponse->json()['access_token'];
        $dataUrl = 'https://pkapi.pumpkin.tools/api/getCustInSales';

        $shopResponse = Http::withToken($token)
            ->asMultipart()
            ->post($dataUrl, [
                'sale_code' => $saleCode, // รหัสเซลล์ที่ต้องการค้นหา
                // 'search' => '' // ส่งค่าว่างหรือตัดออกถ้าไม่ใช้
            ]);

        if (!$shopResponse->successful()) {
            throw new \Exception('Failed to fetch customers from external API');
        }

        $result = $shopResponse->json();

        // ตรวจสอบ status จาก Response Body
        if (isset($result['status']) && $result['status'] == true) {
            return $result['data'];
        }

        return [];
    }

    public function updateReceiveStatus(Request $request)
    {
        $request->validate([
            'claim_id' => 'required|exists:claims,claim_id',
            'images' => 'required|array',
            'images.*' => 'image|max:10240',
            'remark' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();
            $claim = Claim::where('claim_id', $request->claim_id)->first();
            if (!$claim) {
                throw new \Exception('ไม่พบข้อมูล Claim ID');
            }
            $claim->update([
                'receive_status' => 'Y',
                'receive_by' => Auth::user()->user_code,
                'updated_at' => now()
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $originalName = $file->getClientOriginalName();
                    // เพิ่ม random string กันชื่อซ้ำ
                    $fileName = 'receive_' . $request->claim_id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('uploads/claims', $fileName, 'public');

                    ClaimFileUpload::create([
                        'claim_id' => $request->claim_id,
                        'file_path' => $path,
                        'file_name' => $originalName,
                        'remark' => $request->remark // ใช้ remark เดียวกันทุกรูป หรือจะแยกก็ได้
                    ]);
                }
            }

            DB::commit();
            return redirect()->back();
            // return response()->json([
            //     'status' => 'success',
            //     'message' => 'บันทึกการรับอะไหล่เรียบร้อยแล้ว'
            // ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error receiving claim: " . $e->getMessage());
            // return response()->json([
            //     'status' => 'error',
            //     'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
            // ], 500);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function historyDetail($claim_id): Response
    {
        $claim = Claim::query()->where('claim_id', $claim_id)->first();
        $list = ClaimDetail::query()->where('claim_id', $claim_id)->get();
        return Inertia::render('SpareClaim/HistoryClaimNewDetail', [
            'list' => $list,
            'claim_id' => $claim_id,
            'claim' => $claim
        ]);
    }

    public function pendingShow(): Response
    {
        $list = Claim::query()->leftJoin('claim_details', 'claim_details.claim_id', '=', 'claims.claim_id')
            ->leftJoin('job_lists', 'claim_details.job_id', '=', 'job_lists.job_id')
            ->leftJoin('customer_in_jobs', 'job_lists.job_id', '=', 'customer_in_jobs.job_id')
            ->where('claim_details.status', 'pending')
            ->where('user_id', Auth::user()->is_code_cust_id)
            ->select(
                'claims.*',
                'claim_details.job_id',
                'customer_in_jobs.name',
                'customer_in_jobs.phone',
                'claim_details.serial_id',
                'claim_details.sp_code',
                'claim_details.sp_name',
                'claim_details.unit',
                'claim_details.qty',
                'claim_details.claim_submit_date',
            )
            ->orderByDesc('claim_details.created_at')
            ->get();
        //        dd($list->toArray());
        return Inertia::render('SpareClaim/PendingClaim', [
            'list' => $list
        ]);
    }

    //เพิ่มฟังก์ชั่น Check Status Order
    public function checkStatusClaim(Request $request): JsonResponse
    {
        $claim_id = $request->input('claim_id');
        if (empty($claim_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Claim ID ไม่ถูกต้อง'
            ], 400);
        }
        try {
            DB::beginTransaction();
            $uri = env('VITE_API_CHECK_ORDER');
            $claim_id_remove_prefix = str_replace('C-', '', $claim_id);
            $body = [
                'jobno' => $claim_id_remove_prefix,
                'type' => 'claim'
            ];
            Log::info('📦 เริ่มเช็คสถานะออเดอร์', [
                'claim_id' => $claim_id,
                'endpoint' => $uri,
                'request_body' => $claim_id_remove_prefix
            ]);

            $response = Http::post($uri, $body);
            Log::info('API Resposne', [
                'claim_id' => $claim_id,
                'http_status' => $response->status(),
                'raw_body' => $response->body(),
            ]);

            if ($response->successful() && $response->status() == 200) {
                $claim = Claim::query()->where('claim_id', $claim_id)->first();
                if (!$claim) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'ไม่พบรหัส id ที่ต้องการ update'
                    ], 400);
                }
                $response_json = $response->json();
                $externalStatus = $response_json['status'] ?? null;
                Log::info('สถานะปัจจุบันการเคลม', [
                    'claim_id' => $claim_id,
                    'status_old' => $claim->status,
                    'status_from_api' => $externalStatus,
                ]);

                if ($externalStatus) {
                    $claim->status = $externalStatus;
                    $claim->save();

                    Log::info('Update Status SuccessFully', [
                        'claim_id' => $claim_id,
                        'status' => $claim->status
                    ]);
                }

                DB::commit();
                return response()->json([
                    'status' => 'success',
                    'data' => ['status' => $claim->status]
                ]);
            } else {
                throw new \Exception('API ไม่สําเร็จ');
            }
        } catch (\Exception $exception) {
            DB::rollBack();
            Log::error('❌ ตรวจสอบสถานะล้มเหลว', [
                'claim_id' => $claim_id,
                'error' => $exception->getMessage(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage()
            ], 400);
        }
    }
}
