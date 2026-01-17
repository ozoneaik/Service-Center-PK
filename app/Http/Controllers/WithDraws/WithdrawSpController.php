<?php

namespace App\Http\Controllers\WithDraws;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\StockJobDetail;
use App\Models\StoreInformation;
use App\Models\WithdrawCart;
use App\Models\WithdrawOrder;
use App\Models\WithdrawOrderSpList;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawSpController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->restore == 1) {
            return Inertia::render('Admin/WithdrawSp/Index', [
                'pageTitle' => 'เบิกอะไหล่สินค้า',
                'message'   => null,
                'sku'       => null,
                'result'    => null,
                'restore'   => 1,
                'mode'      => $request->mode,
                'job_id'    => $request->job_id,
            ]);
        }

        $search_term = $request->query('sku');

        if (!empty($search_term)) {
            return $this->search($search_term);
        }

        return Inertia::render('Admin/WithdrawSp/Index', [
            'pageTitle' => 'เบิกอะไหล่สินค้า',
            'message'   => null,
            'sku'       => null,
            'result'    => null,
            'restore'   => 0,
        ]);
    }

    //ใช้อยู่
    // public function searchJson(Request $request)
    // {
    //     $sku = $request->sku;
    //     $jobId = $request->job_id;

    //     if (!$sku) {
    //         return response()->json(['error' => 'SKU required'], 422);
    //     }

    //     $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');

    //     try {
    //         $response = Http::timeout(15)->get($apiUrl, ['search' => $sku]);

    //         if (!$response->successful()) {
    //             throw new \Exception("API Error");
    //         }

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception($data['message'] ?? 'ไม่พบสินค้า');
    //         }

    //         $assets = $data['assets'] ?? [];
    //         $dmList = $data['dm_list'] ?? [];
    //         $spAll = $data['sp'] ?? [];

    //         $pid = $sku;
    //         $asset = $assets[$pid] ?? [];
    //         $facmodel = $asset['facmodel'] ?? $pid;

    //         // ใช้ BASE URL เดียวกับ search()
    //         $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
    //         $imageSpBase = rtrim(env('VITE_IMAGE_SP', ''), '/');

    //         $diagramLayers = [];
    //         $spList = [];
    //         $modelOptions = [];

    //         if (!empty($dmList[$pid])) {
    //             foreach ($dmList[$pid] as $dmKey => $dmData) {

    //                 $modelfg = trim($dmData['modelfg'] ?? $facmodel);
    //                 if ($modelfg === '') {
    //                     $modelfg = "DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT);
    //                 }

    //                 $modelOptions[] = $modelfg;

    //                 // Diagram (เหมือน search())
    //                 for ($i = 1; $i <= 5; $i++) {
    //                     $imgUrl = $dmData["img_{$i}"] ?? null;
    //                     if (!$imgUrl) continue;

    //                     if (!str_contains($imgUrl, 'http')) {
    //                         $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
    //                     }

    //                     $diagramLayers[] = [
    //                         'modelfg' => $modelfg,
    //                         'layer' => "รูปที่ {$i}",
    //                         'path_file' => $imgUrl,
    //                         'layout' => $i,
    //                         'typedm' => $dmKey,
    //                     ];
    //                 }

    //                 // Spare Parts (ให้เหมือน search())
    //                 if (!empty($spAll[$pid][$dmKey])) {
    //                     foreach ($spAll[$pid][$dmKey] as $sp) {

    //                         $spcode = $sp['spcode'] ?? null;
    //                         if (!$spcode) continue;

    //                         $spList[] = [
    //                             'spcode' => $spcode,
    //                             'spname' => $sp['spname'] ?? '',
    //                             'spunit' => $sp['spunit'] ?? 'ชิ้น',
    //                             'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
    //                             'price_per_unit' => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
    //                             'layout' => (int)($sp['layout'] ?? 1),
    //                             'tracking_number' => $sp['tracking_number'] ?? '',
    //                             'modelfg' => $modelfg,
    //                             'pid' => $pid,
    //                             'skufg' => $pid,
    //                             'pname' => $asset['pname'] ?? '',
    //                             'imagesku' => $asset['imagesku'][0] ?? null,
    //                             'typedm' => $dmKey,
    //                         ];
    //                     }
    //                 }
    //             }
    //         }

    //         // เติมรูปอะไหล่ + stock + added (เหมือน search())
    //         foreach ($spList as $i => $sp) {
    //             $spcode = $sp['spcode'];

    //             // path_file แบบเดียวกับ search()
    //             $spList[$i]['path_file'] = "{$imageSpBase}/{$spcode}.jpg";

    //             $stockQty = DB::table('stock_spare_parts')
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->where('sp_code', $spcode)
    //                 ->value('qty_sp') ?? 0;

    //             $spList[$i]['stock_balance'] = (int)$stockQty;

    //             // check cart like search()
    //             $cart = WithdrawCart::query()
    //                 ->where('sp_code', $spcode)
    //                 ->where('is_active', false)
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->where('user_code_key', Auth::user()->user_code)
    //                 ->first();

    //             $spList[$i]['added'] = (bool)$cart;

    //             // check already in job
    //             $exists = WithdrawOrderSpList::where('withdraw_id', $jobId)
    //                 ->where('sp_code', $spcode)
    //                 ->exists();
    //             $spList[$i]['already_in_job'] = $exists;
    //         }

    //         return response()->json([
    //             'message' => null,
    //             'result' => [
    //                 'pid' => $sku,
    //                 'pname' => $asset['pname'] ?? '',
    //                 'imagesku' => $asset['imagesku'][0] ?? null,
    //                 'sp' => $spList,
    //                 'model_options' => array_values(array_unique($modelOptions)),
    //                 'diagram_layers' => $diagramLayers,
    //             ],
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => $e->getMessage(),
    //             'result' => null,
    //             'sku' => $sku,
    //         ], 200);
    //     }
    // }

    // public function searchJson(Request $request)
    // {
    //     $search_term = $request->sku;
    //     $jobId = $request->job_id;

    //     if (!$search_term) {
    //         return response()->json(['error' => 'SKU/Serial required'], 422);
    //     }

    //     $search_term = trim($search_term);

    //     if (!preg_match('/^[a-zA-Z0-9\-\/_]+$/', $search_term)) {
    //         $message = '⚠️ รูปแบบรหัสสินค้า/ซีเรียล ไม่ถูกต้อง. โปรดตรวจสอบว่ามีอักขระพิเศษ (เช่น จุด, ช่องว่าง) หรือไม่';
    //         Log::warning('❌ searchJson Term Invalid Format', ['search_term' => $search_term]);

    //         return response()->json([
    //             'message' => $message,
    //             'result' => null,
    //             'sku' => $search_term,
    //         ], 200); 
    //     }
    //     // -----------------------------------------------------

    //     $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');

    //     try {
    //         $response = Http::timeout(15)->get($apiUrl, ['search' => $search_term]);

    //         if (!$response->successful()) {
    //             throw new \Exception("API สินค้าหลักไม่ตอบกลับ");
    //         }

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') {
    //             $api_message = $data['message'] ?? 'ไม่พบข้อมูลสินค้า/ซีเรียล ในระบบ';
    //             throw new \Exception("ไม่พบข้อมูลสินค้า: {$search_term}. [{$api_message}]");
    //         }

    //         $assets = $data['assets'] ?? [];
    //         $dmList = $data['dm_list'] ?? [];
    //         $spAll = $data['sp'] ?? [];

    //         $pid_from_api = $data['skumain'] ?? null;
    //         $pid_to_use = $pid_from_api ?? $search_term;
    //         $pid = $pid_to_use;

    //         $asset = $assets[$pid] ?? [];

    //         // หากไม่เจอ asset จาก $pid_to_use ให้พยายามหาจาก $search_term
    //         if (empty($asset) && isset($assets[$search_term])) {
    //             $asset = $assets[$search_term];
    //             $pid = $search_term;
    //         }

    //         // หากยังไม่เจออีก ให้ลองใช้ asset แรกจากผลลัพธ์
    //         if (empty($asset) && !empty($assets)) {
    //             $asset = reset($assets);
    //             $pid = key($assets); // ใช้ key ของ asset แรกเป็น PID
    //         }

    //         if (empty($asset)) {
    //             throw new \Exception("ไม่พบข้อมูลสินค้าหลัก (Asset) สำหรับ: {$search_term}");
    //         }
    //         // -----------------------------------------------------

    //         $facmodel = $asset['facmodel'] ?? $pid;

    //         // ใช้ BASE URL เดียวกับ search()
    //         $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
    //         $imageSpBase = rtrim(env('VITE_IMAGE_SP_NEW', ''), '/');

    //         $diagramLayers = [];
    //         $spList = [];
    //         $modelOptions = [];

    //         // ใช้ $pid ที่หาได้ในการวนลูป
    //         if (!empty($dmList[$pid])) {
    //             foreach ($dmList[$pid] as $dmKey => $dmData) {

    //                 $modelfg = trim($dmData['modelfg'] ?? $facmodel);
    //                 if ($modelfg === '') {
    //                     $modelfg = "DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT);
    //                 }

    //                 $modelOptions[] = $modelfg;

    //                 // Diagram (ใช้ $pid)
    //                 for ($i = 1; $i <= 5; $i++) {
    //                     $imgUrl = $dmData["img_{$i}"] ?? null;
    //                     if (!$imgUrl) continue;

    //                     if (!str_contains($imgUrl, 'http')) {
    //                         $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
    //                     }

    //                     $diagramLayers[] = [
    //                         'modelfg' => $modelfg,
    //                         'layer' => "รูปที่ {$i}",
    //                         'path_file' => $imgUrl,
    //                         'layout' => $i,
    //                         'typedm' => $dmKey,
    //                         'pdf_path'  => $dmData['pdf_path'] ?? null,
    //                         'manual_pdf_path' => $dmData['manual_pdf_path'] ?? null,
    //                     ];
    //                 }

    //                 // Spare Parts (ใช้ $pid)
    //                 if (!empty($spAll[$pid][$dmKey])) {
    //                     foreach ($spAll[$pid][$dmKey] as $sp) {

    //                         $spcode = $sp['spcode'] ?? null;
    //                         if (!$spcode) continue;

    //                         $spList[] = [
    //                             'spcode' => $spcode,
    //                             'spname' => $sp['spname'] ?? '',
    //                             'spunit' => $sp['spunit'] ?? 'ชิ้น',
    //                             'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
    //                             'price_per_unit' => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
    //                             'layout' => (int)($sp['layout'] ?? 1),
    //                             'tracking_number' => $sp['tracking_number'] ?? '',
    //                             'modelfg' => $modelfg,
    //                             'pid' => $pid,
    //                             'skufg' => $pid,
    //                             'pname' => $asset['pname'] ?? '',
    //                             'imagesku' => $asset['imagesku'][0] ?? null,
    //                             'typedm' => $dmKey,
    //                         ];
    //                     }
    //                 }
    //             }
    //         }

    //         // เติมรูปอะไหล่ + stock + added
    //         foreach ($spList as $i => $sp) {
    //             $spcode = $sp['spcode'];

    //             // path_file แบบเดียวกับ search()
    //             $spList[$i]['path_file'] = "{$imageSpBase}/{$spcode}.jpg";

    //             $stockQty = DB::table('stock_spare_parts')
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->where('sp_code', $spcode)
    //                 ->value('qty_sp') ?? 0;

    //             $spList[$i]['stock_balance'] = (int)$stockQty;

    //             $cart = WithdrawCart::query()
    //                 ->where('sp_code', $spcode)
    //                 ->where('is_active', false)
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->where('user_code_key', Auth::user()->user_code)
    //                 ->first();

    //             $spList[$i]['added'] = (bool)$cart;

    //             $exists = WithdrawOrderSpList::where('withdraw_id', $jobId)
    //                 ->where('sp_code', $spcode)
    //                 ->exists();
    //             $spList[$i]['already_in_job'] = $exists;
    //         }

    //         Log::debug('✅ searchJson Success (SN Ready)', [
    //             'search_term' => $search_term,
    //             'result_pid'  => $pid,
    //             'job_id' => $jobId
    //         ]);

    //         return response()->json([
    //             'message' => null,
    //             'result' => [
    //                 'pid' => $pid, // ใช้ PID ที่หาได้
    //                 'pname' => $asset['pname'] ?? '',
    //                 'imagesku' => $asset['imagesku'][0] ?? null,
    //                 'sp' => $spList,
    //                 'model_options' => array_values(array_unique($modelOptions)),
    //                 'diagram_layers' => $diagramLayers,
    //             ],
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('❌ searchJson API Error', [
    //             'search_term' => $search_term,
    //             'error' => $e->getMessage(),
    //             'job_id' => $jobId
    //         ]);

    //         return response()->json([
    //             'message' => $e->getMessage(),
    //             'result' => null,
    //             'sku' => $search_term,
    //         ], 200);
    //     }
    // }

    public function searchJson(Request $request)
    {
        $search_term = $request->sku;
        $jobId = $request->job_id;

        if (!$search_term) {
            return response()->json(['error' => 'SKU/Serial required'], 422);
        }

        $search_term = trim($search_term);

        if (!preg_match('/^[a-zA-Z0-9\-\/_]+$/', $search_term)) {
            $message = '⚠️ รูปแบบรหัสสินค้า/ซีเรียล ไม่ถูกต้อง. โปรดตรวจสอบว่ามีอักขระพิเศษ (เช่น จุด, ช่องว่าง) หรือไม่';
            Log::warning('❌ searchJson Term Invalid Format', ['search_term' => $search_term]);

            return response()->json([
                'message' => $message,
                'result' => null,
                'sku' => $search_term,
            ], 200); 
        }
        // -----------------------------------------------------

        $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');

        try {
            $response = Http::timeout(15)->get($apiUrl, ['search' => $search_term]);

            if (!$response->successful()) {
                throw new \Exception("API สินค้าหลักไม่ตอบกลับ");
            }

            $data = $response->json();
            if (($data['status'] ?? '') !== 'SUCCESS') {
                $api_message = $data['message'] ?? 'ไม่พบข้อมูลสินค้า/ซีเรียล ในระบบ';
                throw new \Exception("ไม่พบข้อมูลสินค้า: {$search_term}. [{$api_message}]");
            }

            $assets = $data['assets'] ?? [];
            $dmList = $data['dm_list'] ?? [];
            $spAll = $data['sp'] ?? [];

            $pid_from_api = $data['skumain'] ?? null;
            $pid_to_use = $pid_from_api ?? $search_term;
            $pid = $pid_to_use;

            $asset = $assets[$pid] ?? [];

            if (empty($asset) && isset($assets[$search_term])) {
                $asset = $assets[$search_term];
                $pid = $search_term;
            }

            if (empty($asset) && !empty($assets)) {
                $asset = reset($assets);
                $pid = key($assets);
            }

            if (empty($asset)) {
                throw new \Exception("ไม่พบข้อมูลสินค้าหลัก (Asset) สำหรับ: {$search_term}");
            }

            $facmodel = $asset['facmodel'] ?? $pid;
            $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
            $imageSpBase = rtrim(env('VITE_IMAGE_SP_NEW', ''), '/');

            $diagramLayers = [];
            $spList = [];
            $modelOptions = [];

            if (!empty($dmList[$pid])) {
                // --- เพิ่มการเช็คความซ้ำของชื่อโมเดลก่อนเข้า Loop ---
                $allRawModels = collect($dmList[$pid])->map(fn($item) => trim($item['modelfg'] ?? ''))->toArray();
                $hasDuplicateModel = count($allRawModels) !== count(array_unique($allRawModels));

                foreach ($dmList[$pid] as $dmKey => $dmData) {
                    $rawModelfg = trim($dmData['modelfg'] ?? '');

                    // ตรรกะตัดสินใจเลือกชื่อที่ใช้แสดงผล
                    if ($hasDuplicateModel) {
                        // ถ้าซ้ำ ให้พ่วง (DMxx) เสมอ
                        $displayName = ($rawModelfg ?: $facmodel) . " (DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT) . ")";
                    } else {
                        // ถ้าไม่ซ้ำ แต่ชื่อว่าง ให้พ่วง DM
                        if ($rawModelfg === '') {
                            $displayName = $facmodel . " (DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT) . ")";
                        } else {
                            $displayName = $rawModelfg;
                        }
                    }

                    $modelOptions[] = $displayName;

                    // Diagram
                    for ($i = 1; $i <= 5; $i++) {
                        $imgUrl = $dmData["img_{$i}"] ?? null;
                        if (!$imgUrl) continue;

                        if (!str_contains($imgUrl, 'http')) {
                            $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
                        }

                        $diagramLayers[] = [
                            'modelfg' => $displayName, // ใช้ชื่อที่แต่งใหม่เพื่อให้ Frontend กรองได้
                            'layer' => "รูปที่ {$i}",
                            'path_file' => $imgUrl,
                            'layout' => $i,
                            'typedm' => $dmKey,
                            'pdf_path'  => $dmData['pdf_path'] ?? null,
                            'manual_pdf_path' => $dmData['manual_pdf_path'] ?? null,
                        ];
                    }

                    // Spare Parts
                    if (!empty($spAll[$pid][$dmKey])) {
                        foreach ($spAll[$pid][$dmKey] as $sp) {

                            $spcode = $sp['spcode'] ?? null;
                            if (!$spcode) continue;

                            $spList[] = [
                                'spcode' => $spcode,
                                'spname' => $sp['spname'] ?? '',
                                'spunit' => $sp['spunit'] ?? 'ชิ้น',
                                'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
                                'price_per_unit' => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
                                'layout' => (int)($sp['layout'] ?? 1),
                                'tracking_number' => $sp['tracking_number'] ?? '',
                                'modelfg' => $displayName, // ใช้ชื่อที่แต่งใหม่
                                'pid' => $pid,
                                'skufg' => $pid,
                                'pname' => $asset['pname'] ?? '',
                                'imagesku' => $asset['imagesku'][0] ?? null,
                                'typedm' => $dmKey,
                            ];
                        }
                    }
                }
            }

            // เติมข้อมูลรูปภาพและสถานะ Cart
            foreach ($spList as $i => $sp) {
                $spcode = $sp['spcode'];
                $spList[$i]['path_file'] = "{$imageSpBase}/{$spcode}.jpg";
                $stockQty = DB::table('stock_spare_parts')
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('sp_code', $spcode)->value('qty_sp') ?? 0;
                $spList[$i]['stock_balance'] = (int)$stockQty;

                $cart = WithdrawCart::query()->where('sp_code', $spcode)
                    ->where('is_active', false)
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('user_code_key', Auth::user()->user_code)->first();
                $spList[$i]['added'] = (bool)$cart;

                $exists = WithdrawOrderSpList::where('withdraw_id', $jobId)
                    ->where('sp_code', $spcode)->exists();
                $spList[$i]['already_in_job'] = $exists;
            }

            return response()->json([
                'message' => null,
                'result' => [
                    'pid' => $pid,
                    'pname' => $asset['pname'] ?? '',
                    'imagesku' => $asset['imagesku'][0] ?? null,
                    'sp' => $spList,
                    'model_options' => array_values(array_unique($modelOptions)),
                    'diagram_layers' => $diagramLayers,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'result' => null, 'sku' => $search_term], 200);
        }
    }

    public function addDetail(Request $request)
    {
        $validated = $request->validate([
            'job_id' => 'required',
            'sp_code' => 'required',
            'sp_name' => 'required',
            'sp_unit' => 'required',
            'stdprice_per_unit' => 'required|numeric',
            'sell_price' => 'required|numeric',
        ]);

        // ป้องกันซ้ำ
        $exists = WithdrawOrderSpList::where('withdraw_id', $request->job_id)
            ->where('sp_code', $request->sp_code)
            ->first();

        if ($exists) {
            return response()->json(['message' => 'already_exists'], 200);
        }

        WithdrawOrderSpList::create([
            'withdraw_id'        => $request->job_id,
            'sp_code'            => $request->sp_code,
            'sp_name'            => $request->sp_name,
            'sp_unit'            => $request->sp_unit,
            'stdprice_per_unit'  => $request->stdprice_per_unit,
            'sell_price'         => $request->sell_price,
            'sku_code'           => $request->sku_code,
            'sp_qty'             => 1,
        ]);

        return response()->json(['message' => 'success']);
    }

    public function updateAllDetail(Request $request)
    {
        $validated = $request->validate([
            'job_id' => 'required',
            'list' => 'required|array',
        ]);

        DB::beginTransaction();

        try {
            foreach ($request->list as $sp) {

                $exists = WithdrawOrderSpList::where('withdraw_id', $request->job_id)
                    ->where('sp_code', $sp['sp_code'])
                    ->exists();

                if (!$exists) {
                    WithdrawOrderSpList::create([
                        'withdraw_id'        => $request->job_id,
                        'sp_code'            => $sp['sp_code'],
                        'sp_name'            => $sp['sp_name'],
                        'sp_unit'            => $sp['sp_unit'],
                        'stdprice_per_unit'  => $sp['stdprice_per_unit'],
                        'sell_price'         => $sp['sell_price'],
                        'sku_code'           => $sp['sku_code'],
                        'sp_qty'             => $sp['sp_qty'],
                        'discount_percent' => $sp['discount_percent'] ?? 0,
                        'discount_amount'  => $sp['discount_amount'] ?? 0,
                    ]);
                }

                StockJobDetail::updateOrCreate(
                    [
                        'stock_job_id' => $request->job_id,
                        'sp_code' => $sp['sp_code'],
                    ],
                    [
                        'is_code_cust_id' => Auth::user()->is_code_cust_id,
                        'user_code_key'   => Auth::user()->user_code,

                        'sp_name' => $sp['sp_name'],
                        'sp_qty' => $sp['sp_qty'] ?? 1,
                        'sp_unit' => $sp['sp_unit'],
                        'stdprice_per_unit' => $sp['stdprice_per_unit'],
                        'sell_price' => $sp['sell_price'],
                        'discount_percent' => $sp['discount_percent'] ?? 0,
                        'discount_amount'  => $sp['discount_amount'] ?? 0,
                        'before' => 0,
                        'tran' => 0,
                        'after' => 0 - ($sp['sp_qty'] ?? 1),
                        'type' => 'เบิก',
                        'ref' => $request->job_id,
                        'actor' => Auth::user()->name,
                        'date' => now(),
                    ]
                );
            }

            DB::commit();
            // return response()->json(['message' => 'success']);
            $items = StockJobDetail::where('stock_job_id', $request->job_id)
                ->orderBy('id')
                ->get();

            return response()->json([
                'message' => 'success',
                'items' => $items   // ← ส่งให้ React เอาไปอัปเดตทันที
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function cartCount(): JsonResponse
    {
        try {
            $count = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->count();

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            return response()->json(['count' => 0]);
        }
    }

    //13/11/2568 ที่ใช้อยู่
    // public function search(string $sku): Response
    // {
    //     $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');
    //     $message = '';
    //     $result = [];
    //     $diagramLayers = [];
    //     $modelOptions = [];
    //     $spList = [];

    //     try {
    //         $response = Http::timeout(15)->get($apiUrl, ['search' => $sku]);
    //         if (!$response->successful()) {
    //             throw new \Exception('API สินค้าหลักไม่ตอบกลับ');
    //         }

    //         $data = $response->json();
    //         if (($data['status'] ?? '') !== 'SUCCESS') {
    //             throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้าในระบบ');
    //         }

    //         $assets = $data['assets'] ?? [];
    //         $dmList = $data['dm_list'] ?? [];
    //         $spAll = $data['sp'] ?? [];
    //         $pid = $sku;
    //         $asset = $assets[$pid] ?? [];
    //         $facmodel = $asset['facmodel'] ?? $pid;

    //         $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
    //         $imageSpBase = rtrim(env('VITE_IMAGE_SP', ''), '/');

    //         // loop dm list
    //         if (!empty($dmList[$pid])) {
    //             foreach ($dmList[$pid] as $dmKey => $dmData) {
    //                 // $dmName = strtoupper("DM{$dmKey}");
    //                 // $modelOptions[] = $dmName; // เพิ่มชื่อ DM ใน dropdown

    //                 // $modelfg = $dmData['modelfg'] ?? $facmodel;

    //                 $modelfg = trim($dmData['modelfg'] ?? $facmodel);
    //                 if ($modelfg == '') {
    //                     $modelfg = "DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT);
    //                 }
    //                 $modelOptions[] = $modelfg;

    //                 // Diagram
    //                 for ($i = 1; $i <= 5; $i++) {
    //                     $imgKey = "img_{$i}";
    //                     $imgUrl = $dmData[$imgKey] ?? null;
    //                     if (!$imgUrl) continue;

    //                     if (!str_contains($imgUrl, 'http')) {
    //                         $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');
    //                     }

    //                     $diagramLayers[] = [
    //                         'modelfg' => $modelfg,
    //                         'layer' => "รูปที่ {$i}",
    //                         'path_file' => $imgUrl,
    //                         'layout' => $i,
    //                         'typedm' => $dmKey,
    //                     ];
    //                 }

    //                 // Spare Parts ตาม DM
    //                 if (!empty($spAll[$pid][$dmKey])) {
    //                     foreach ($spAll[$pid][$dmKey] as $sp) {
    //                         $spcode = $sp['spcode'] ?? null;
    //                         if (!$spcode) continue;

    //                         $spList[] = [
    //                             'spcode' => $spcode,
    //                             'spname' => $sp['spname'] ?? '',
    //                             'spunit' => $sp['spunit'] ?? 'ชิ้น',
    //                             'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
    //                             'price_per_unit' => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
    //                             'layout' => (int)($sp['layout'] ?? 1),
    //                             'tracking_number' => $sp['tracking_number'] ?? '',
    //                             'modelfg' => $modelfg,
    //                             'pid' => $pid,
    //                             'skufg' => $pid,
    //                             'pname' => $asset['pname'] ?? '',
    //                             'imagesku' => $asset['imagesku'][0] ?? null,
    //                             'typedm' => $dmKey,
    //                         ];
    //                     }
    //                 }
    //             }
    //         }

    //         // เติม stock / cart
    //         foreach ($spList as $i => $sp) {
    //             $spcode = $sp['spcode'];
    //             $spList[$i]['path_file'] = "{$imageSpBase}/{$spcode}.jpg";

    //             $stockQty = DB::table('stock_spare_parts')
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->where('sp_code', $spcode)
    //                 ->value('qty_sp') ?? 0;

    //             $spList[$i]['stock_balance'] = (int)$stockQty;

    //             $cart = WithdrawCart::query()
    //                 ->where('sp_code', $spcode)
    //                 ->where('is_active', false)
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->where('user_code_key', Auth::user()->user_code)
    //                 ->first();

    //             $spList[$i]['added'] = (bool)$cart;
    //             $spList[$i]['remark'] = 'มาจากการเบิก';
    //         }

    //         $result = [
    //             'pid' => $sku,
    //             'pname' => $asset['pname'] ?? '',
    //             'pbaseunit' => $asset['pbaseunit'] ?? '',
    //             'facmodel' => $facmodel,
    //             'imagesku' => $asset['imagesku'][0] ?? null,
    //             'sp' => $spList,
    //             'model_options' => array_values(array_unique($modelOptions)),
    //             'diagram_layers' => $diagramLayers,
    //         ];
    //     } catch (\Exception $e) {
    //         $message = $e->getMessage();
    //         $result = null;
    //     }

    //     Log::debug('✅ WithdrawSp Search (DM filter ready)', [
    //         'sku' => $sku,
    //         'count_sp' => count($result['sp'] ?? []),
    //         'models' => $result['model_options'] ?? [],
    //     ]);

    //     return Inertia::render('Admin/WithdrawSp/Index', [
    //         'pageTitle' => 'เบิกอะไหล่สินค้า',
    //         'message' => $message ?: null,
    //         'sku' => $sku,
    //         'result' => $result,
    //     ]);
    // }

    public function search(string $search_term): Response
    {
        $apiUrl = env('VITE_WARRANTY_SN_API_GETDATA');
        $message = '';
        $result = [];
        $diagramLayers = [];
        $modelOptions = [];
        $spList = [];

        try {
            // ใช้ $search_term สำหรับค้นหาใน API (รองรับทั้ง SKU และ SN)
            $response = Http::timeout(15)->get($apiUrl, ['search' => $search_term]);
            if (!$response->successful()) {
                throw new \Exception('API สินค้าหลักไม่ตอบกลับ');
            }

            $data = $response->json();
            if (($data['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception($data['message'] ?? 'ไม่พบข้อมูลสินค้า/ซีเรียล ในระบบ');
            }

            $assets = $data['assets'] ?? [];
            $dmList = $data['dm_list'] ?? [];
            $spAll = $data['sp'] ?? [];

            // หา PID หลักจากผลลัพธ์ API (skumain) หรือใช้ $search_term
            $pid_from_api = $data['skumain'] ?? null;
            $pid_to_use = $pid_from_api ?? $search_term;
            $pid = $pid_to_use;

            // ค้นหา Asset ที่เกี่ยวข้อง
            $asset = $assets[$pid] ?? [];

            // หากไม่เจอ asset จาก $pid_to_use ให้พยายามหาจาก $search_term
            if (empty($asset) && isset($assets[$search_term])) {
                $asset = $assets[$search_term];
                $pid = $search_term;
            }

            // หากยังไม่เจออีก ให้ลองใช้ asset แรกจากผลลัพธ์
            if (empty($asset) && !empty($assets)) {
                $asset = reset($assets);
                $pid = key($assets); // ใช้ key ของ asset แรกเป็น PID
            }

            if (empty($asset)) {
                throw new \Exception('ไม่พบข้อมูลสินค้าจาก API');
            }

            $facmodel = $asset['facmodel'] ?? $pid;

            $imageDmBase = rtrim(env('VITE_IMAGE_DM', 'https://warranty-sn.pumpkin.tools/storage'), '/');
            $imageSpBase = rtrim(env('VITE_IMAGE_SP_NEW', ''), '/');

            // loop dm list (ใช้ $pid ที่หาได้)
            if (!empty($dmList[$pid])) {
                // เช็คความซ้ำก่อนเข้า Loop
                $allRawModels = collect($dmList[$pid])->map(fn($item) => trim($item['modelfg'] ?? ''))->toArray();
                $hasDuplicateModel = count($allRawModels) !== count(array_unique($allRawModels));

                foreach ($dmList[$pid] as $dmKey => $dmData) {
                    $rawModelfg = trim($dmData['modelfg'] ?? '');

                    // กำหนดชื่อที่ใช้แสดงผล
                    if ($hasDuplicateModel) {
                        $displayName = ($rawModelfg ?: $facmodel) . " (DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT) . ")";
                    } else {
                        $displayName = ($rawModelfg !== '') ? $rawModelfg : $facmodel . " (DM" . str_pad($dmKey, 2, "0", STR_PAD_LEFT) . ")";
                    }

                    $modelOptions[] = $displayName;

                    // Diagram Layers (ใช้ $displayName)
                    for ($i = 1; $i <= 5; $i++) {
                        $imgUrl = $dmData["img_{$i}"] ?? null;
                        if (!$imgUrl) continue;
                        if (!str_contains($imgUrl, 'http')) $imgUrl = "{$imageDmBase}/" . ltrim($imgUrl, '/');

                        $diagramLayers[] = [
                            'modelfg' => $displayName,
                            'layer' => "รูปที่ {$i}",
                            'path_file' => $imgUrl,
                            'layout' => $i,
                            'typedm' => $dmKey,
                            'pdf_path'  => $dmData['pdf_path'] ?? null,
                            'manual_pdf_path' => $dmData['manual_pdf_path'] ?? null,
                        ];
                    }

                    // Spare Parts (ใช้ $displayName)
                    if (!empty($spAll[$pid][$dmKey])) {
                        foreach ($spAll[$pid][$dmKey] as $sp) {
                            $spcode = $sp['spcode'] ?? null;
                            if (!$spcode) continue;
                            $spList[] = [
                                'spcode' => $spcode,
                                'spname' => $sp['spname'] ?? '',
                                'spunit' => $sp['spunit'] ?? 'ชิ้น',
                                'stdprice_per_unit' => floatval($sp['stdprice'] ?? 0),
                                'price_per_unit' => floatval($sp['disc40p20p'] ?? $sp['disc40p'] ?? $sp['disc20p'] ?? 0),
                                'layout' => (int)($sp['layout'] ?? 1),
                                'tracking_number' => $sp['tracking_number'] ?? '',
                                'modelfg' => $displayName,
                                'pid' => $pid,
                                'skufg' => $pid,
                                'pname' => $asset['pname'] ?? '',
                                'imagesku' => $asset['imagesku'][0] ?? null,
                                'typedm' => $dmKey,
                            ];
                        }
                    }
                }
            }

            // เติม stock / cart
            foreach ($spList as $i => $sp) {
                $spcode = $sp['spcode'];
                $spList[$i]['path_file'] = "{$imageSpBase}/{$spcode}.jpg";

                $stockQty = DB::table('stock_spare_parts')
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('sp_code', $spcode)
                    ->value('qty_sp') ?? 0;

                $spList[$i]['stock_balance'] = (int)$stockQty;

                $cart = WithdrawCart::query()
                    ->where('sp_code', $spcode)
                    ->where('is_active', false)
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('user_code_key', Auth::user()->user_code)
                    ->first();

                $spList[$i]['added'] = (bool)$cart;
                $spList[$i]['remark'] = 'มาจากการเบิก';
            }

            $result = [
                'pid' => $pid, // ใช้ PID ที่หาได้
                'pname' => $asset['pname'] ?? '',
                'pbaseunit' => $asset['pbaseunit'] ?? '',
                'facmodel' => $facmodel,
                'imagesku' => $asset['imagesku'][0] ?? null,
                'sp' => $spList,
                'model_options' => array_values(array_unique($modelOptions)),
                'diagram_layers' => $diagramLayers,
            ];
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $result = null;
        }

        Log::debug('✅ WithdrawSp Search (SN Ready)', [
            'search_term' => $search_term,
            'result_pid'  => $pid ?? 'N/A',
            'count_sp' => count($result['sp'] ?? []),
            'models' => $result['model_options'] ?? [],
        ]);

        return Inertia::render('Admin/WithdrawSp/Index', [
            'pageTitle' => 'เบิกอะไหล่สินค้า',
            'message' => $message ?: null,
            'sku' => $search_term, // ส่งค่าที่ค้นหากลับไป (แม้จะเป็น SN)
            'result' => $result,
        ]);
    }

    public function carts(): Response
    {
        $skuImageBase = env('VITE_IMAGE_PID');

        $groupSku = WithdrawCart::query()
            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('user_code_key', Auth::user()->user_code)
            ->where('is_active', false)
            ->where('remark', 'มาจากการเบิก')
            ->select('sku_code', 'sku_name')
            ->groupBy('sku_code', 'sku_name')
            ->get();

        $totalSp = 0;
        foreach ($groupSku as $group) {
            $group['sku_image_path'] = $skuImageBase . $group['sku_code'] . ".jpg";
            $group['list'] = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->where('sku_code', $group->sku_code)
                ->get();

            $totalSp += $group['list']->count();
        }

        return Inertia::render('Admin/WithdrawSp/CartList', [
            'groupSku' => $groupSku,
            'totalSp' => $totalSp,
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function addToCart(Request $request): JsonResponse
    {
        try {
            // ตรวจว่ามีของในสต็อกหรือไม่
            $stockQty = DB::table('stock_spare_parts')
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('sp_code', $request->spcode)
                ->value('qty_sp') ?? 0;

            // if ($stockQty <= 0) {
            //     return response()->json([
            //         'message' => 'out_of_stock',
            //         'error'   => 'สินค้าไม่มีสต็อกคงเหลือ',
            //     ], 200);
            // }

            // ป้องกันซ้ำ
            if (WithdrawCart::existsInCart(Auth::user()->user_code, $request->spcode)) {
                return response()->json(['message' => 'already_added'], 200);
            }

            // สร้างข้อมูลใหม่
            $cart = WithdrawCart::query()->create([
                'is_code_cust_id' => Auth::user()->is_code_cust_id,
                'user_code_key'   => Auth::user()->user_code,
                'sku_code'        => $request->skufg,
                'sku_name'        => $request->pname,
                'sp_code'         => $request->spcode,
                'sp_name'         => $request->spname,
                'price_per_unit'  => floatval($request->price_per_unit),
                'stdprice_per_unit' => floatval($request->stdprice_per_unit ?? $request->std_price ?? 0),
                'sp_unit'         => $request->spunit,
                'qty'             => 1,
                'remark'          => 'มาจากการเบิก',
            ]);

            return response()->json(['message' => 'success', 'cart' => $cart]);
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains($e->getMessage(), 'uq_withdraw_carts_user_sp_active_false')) {
                return response()->json(['message' => 'already_added'], 200);
            }
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    public function qty(Request $request, string $condition = 'add'): JsonResponse
    {
        try {
            $sp = WithdrawCart::query()->where('id', $request->id)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->firstOrFail();

            if ($condition === 'add') {
                $sp->update(['qty' => $sp->qty + 1]);
            } else {
                if ($sp->qty <= 1) {
                    return response()->json(['message' => 'Cannot reduce quantity below 1'], 400);
                }
                $sp->update(['qty' => $sp->qty - 1]);
            }
            return response()->json(['message' => 'success', 'sp' => $sp->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    public function clearCart(): JsonResponse
    {
        try {
            WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->delete();

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function deleteCart(int $id): JsonResponse
    {
        try {
            $sp = WithdrawCart::query()->where('id', $id)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->firstOrFail();

            $sp->delete();

            return response()->json(['message' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    public function cartSpcodes(): JsonResponse
    {
        try {
            $spcodes = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->pluck('sp_code')
                ->toArray();

            return response()->json(['spcodes' => $spcodes]);
        } catch (\Exception $e) {
            return response()->json(['spcodes' => []]);
        }
    }

    public function history(): Response
    {
        $history = WithdrawOrder::query()
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->orderBy('id', 'desc')->paginate(100);
        return Inertia::render(
            'Admin/WithdrawSp/OrderWithdrawHistory',
            ['history' => $history]
        );
    }

    public function summary(Request $request): Response
    {
        $job_id = $request->job_id;
        $skuImageBase = env('VITE_IMAGE_PID');

        $groupSku = WithdrawCart::query()
            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('user_code_key', Auth::user()->user_code)
            ->where('is_active', false)
            ->where('remark', 'มาจากการเบิก')
            ->select('sku_code', 'sku_name')
            ->groupBy('sku_code', 'sku_name')
            ->get();

        $totalSp = 0;

        foreach ($groupSku as $group) {
            $group['sku_image_path'] = $skuImageBase . $group['sku_code'] . ".jpg";

            $list = WithdrawCart::query()
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->where('remark', 'มาจากการเบิก')
                ->where('sku_code', $group->sku_code)
                ->get();

            foreach ($list as $item) {
                $stockQty = DB::table('stock_spare_parts')
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('sp_code', $item->sp_code)
                    ->value('qty_sp') ?? 0;

                $item->stock_balance = (int) $stockQty;
            }

            $group['list'] = $list;
            $totalSp += $list->count();
        }

        return Inertia::render('Admin/WithdrawSp/WithdrawSummary', [
            'groupSku' => $groupSku,
            'totalSp' => $totalSp,
            'is_code_cust_id' => Auth::user()->is_code_cust_id,
            'job_id' => $job_id,
        ]);
    }
}
