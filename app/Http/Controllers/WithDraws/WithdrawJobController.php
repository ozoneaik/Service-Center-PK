<?php

namespace App\Http\Controllers\WithDraws;

use App\Http\Controllers\Controller;
use App\Models\StockJob;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
use App\Models\StoreInformation;
use App\Models\WithdrawCart;
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

class WithdrawJobController extends Controller
{
    // แสดงรายการ Job เบิกอะไหล่
    public function index(Request $request): Response
    {
        $query = StockJob::query()
            ->leftJoin('users', 'users.user_code', '=', 'stock_jobs.user_code_key')
            ->select('stock_jobs.*', 'users.name as user_name')
            ->where('stock_jobs.is_code_cust_id', Auth::user()->is_code_cust_id)
            ->where('stock_jobs.type', 'เบิก')
            ->orderBy('stock_jobs.created_at', 'desc');

        if ($request->filled('searchJob')) {
            $query->where('stock_jobs.stock_job_id', 'like', '%' . $request->searchJob . '%');
        }

        if ($request->filled('searchJobStatus')) {
            $query->where('stock_jobs.job_status', $request->searchJobStatus);
        }

        if ($request->filled('searchJobDateFrom')) {
            $query->whereDate('stock_jobs.created_at', '>=', $request->searchJobDateFrom);
        }

        if ($request->filled('searchJobDateTo')) {
            $query->whereDate('stock_jobs.created_at', '<=', $request->searchJobDateTo);
        }

        $jobs = $query->paginate(10)->appends($request->all());

        $jobs->getCollection()->transform(function ($job) {
            $job->total_qty = StockJobDetail::query()
                ->where('stock_job_id', $job->stock_job_id)
                ->count();

            return $job;
        });

        return Inertia::render('Admin/WithdrawSp/withdrawJobs/index', [
            'list'    => $jobs,
            'filters' => [
                'searchJob'          => $request->searchJob,
                'searchJobStatus'    => $request->searchJobStatus,
                'searchJobDateFrom'  => $request->searchJobDateFrom,
                'searchJobDateTo'    => $request->searchJobDateTo,
            ],
        ]);
    }

    public function create($is_code_cust_id)
    {
        $new_job_id = 'JOB-WD' . time() . rand(100, 999);

        return Inertia::render('Admin/WithdrawSp/withdrawJobs/CreateWithdrawJob', [
            'new_job_id' => $new_job_id,
            'is_code_cust_id' => $is_code_cust_id,
        ]);
    }

    // public function store(Request $request)
    // {
    //     try {
    //         DB::beginTransaction();

    //         $req = $request->all();
    //         if (empty($req['items']) || count($req['items']) === 0) {
    //             throw new \Exception('ไม่พบรายการอะไหล่ในใบเบิก');
    //         }

    //         $jobId = $req['job_id'] ?? 'JOB-WD' . time() . rand(100, 999);
    //         StockJobDetail::where('stock_job_id', $jobId)->delete();

    //         $storeJob = StockJob::updateOrCreate(
    //             ['stock_job_id' => $jobId],
    //             [
    //                 'stock_job_id'    => $jobId,
    //                 'is_code_cust_id' => Auth::user()->is_code_cust_id,
    //                 'user_code_key'   => Auth::user()->user_code,
    //                 'job_status'      => 'complete',
    //                 'type'            => 'เบิก',
    //             ]
    //         );

    //         $totalPrice = 0;

    //         DB::table('withdraw_orders')->insert([
    //             'withdraw_id' => $jobId,
    //             'is_code_key' => Auth::user()->is_code_cust_id,
    //             'user_key'    => Auth::user()->user_code,
    //             'status'      => 'complete',
    //             'total_price' => 0,
    //             'remark'      => 'เบิกอะไหล่จากระบบ',
    //             'created_at'  => Carbon::now(),
    //             'completed_at' => Carbon::now(),
    //         ]);

    //         foreach ($req['items'] as $item) {
    //             $qty = (int)($item['qty'] ?? 0);
    //             $spCode = $item['sp_code'] ?? '';
    //             $sellPrice = (float)($item['sell_price'] ?? $item['stdprice_per_unit'] ?? 0);
    //             $stdPrice = (float)($item['stdprice_per_unit'] ?? 0);

    //             $totalPrice += $qty * $sellPrice;

    //             $stockSp = StockSparePart::where('sp_code', $spCode)
    //                 ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //                 ->lockForUpdate()
    //                 ->first();

    //             if (!$stockSp) throw new \Exception("ไม่พบอะไหล่ในคลัง: {$spCode}");
    //             if ($stockSp->qty_sp < $qty) throw new \Exception("สต็อกอะไหล่ {$spCode} ไม่พอ");

    //             $before = $stockSp->qty_sp;
    //             $after  = $before - $qty;
    //             $stockSp->update(['qty_sp' => $after]);

    //             StockJobDetail::create([
    //                 'stock_job_id'    => $jobId,
    //                 'is_code_cust_id' => Auth::user()->is_code_cust_id,
    //                 'user_code_key'   => Auth::user()->user_code,
    //                 'sp_code'         => $spCode,
    //                 'sp_name'         => $item['sp_name'] ?? '',
    //                 'sp_qty'          => $qty,
    //                 'sp_unit'         => $item['sp_unit'] ?? '',
    //                 'stdprice_per_unit' => $stdPrice,
    //                 'sell_price'        => $sellPrice,
    //                 'before'          => $before,
    //                 'tran'            => -$qty,
    //                 'after'           => $after,
    //                 'type'            => 'เบิก',
    //                 'ref'             => $jobId,
    //                 'actor'           => Auth::user()->name ?? 'system',
    //                 'date'            => Carbon::now(),
    //             ]);

    //             WithdrawOrderSpList::create([
    //                 'withdraw_id'    => $jobId,
    //                 'sp_code'        => $spCode,
    //                 'sp_name'        => $item['sp_name'] ?? '',
    //                 'sku_code'       => $item['sku_code'] ?? 'UNKNOWN',
    //                 'qty'            => $qty,
    //                 'stdprice_per_unit' => $stdPrice,
    //                 'sell_price'        => $sellPrice,
    //                 'sp_unit'        => $item['sp_unit'] ?? 'ชิ้น',
    //                 'path_file'      => env('VITE_IMAGE_SP') . ($item['sku_code'] ?? '') . '/' . ($item['sp_code'] ?? '') . '.jpg',
    //             ]);
    //         }

    //         DB::table('withdraw_orders')
    //             ->where('withdraw_id', $jobId)
    //             ->update(['total_price' => $totalPrice, 'status' => 'complete']);

    //         DB::table('withdraw_carts')
    //             ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
    //             ->where('user_code_key', Auth::user()->user_code)
    //             ->delete();

    //         DB::commit();

    //         return redirect()->route('withdrawJob.index')
    //             ->with('success', "✅ บันทึกใบเบิกอะไหล่ {$jobId} สำเร็จ");
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         Log::error('❌ WithdrawJob store failed', ['error' => $e->getMessage()]);
    //         return redirect()->back()->with('error', $e->getMessage());
    //     }
    // }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $req = $request->all();
            if (empty($req['items']) || count($req['items']) === 0) {
                throw new \Exception('ไม่พบรายการอะไหล่ในใบเบิก');
            }

            // ดึงค่าจาก payload
            $jobId = $req['job_id'] ?? 'JOB-WD' . time() . rand(100, 999);
            $discountPercent = (float)($req['discount_percent'] ?? 0); // ส่วนลดรวม %

            // ลบรายละเอียดเดิมหากมี
            StockJobDetail::where('stock_job_id', $jobId)->delete();

            // สร้าง/อัปเดตใบงานหลัก
            $storeJob = StockJob::updateOrCreate(
                ['stock_job_id' => $jobId],
                [
                    'stock_job_id'    => $jobId,
                    'is_code_cust_id' => Auth::user()->is_code_cust_id,
                    'user_code_key'   => Auth::user()->user_code,
                    'job_status'      => 'complete',
                    'type'            => 'เบิก',
                ]
            );

            $totalPrice = 0;
            $totalDiscount = 0;

            // เพิ่มใบ withdraw_orders
            DB::table('withdraw_orders')->insert([
                'withdraw_id'  => $jobId,
                'is_code_key'  => Auth::user()->is_code_cust_id,
                'user_key'     => Auth::user()->user_code,
                'status'       => 'complete',
                'total_price'  => 0,
                'remark'       => 'เบิกอะไหล่จากระบบ',
                'created_at'   => Carbon::now(),
                'completed_at' => Carbon::now(),
            ]);

            foreach ($req['items'] as $item) {
                $qty = (int)($item['qty'] ?? 0);
                $spCode = $item['sp_code'] ?? '';
                $sellPrice = (float)($item['sell_price'] ?? $item['stdprice_per_unit'] ?? 0);
                $stdPrice = (float)($item['stdprice_per_unit'] ?? 0);

                // คำนวณส่วนลดต่อแถว
                $lineTotal = $qty * $sellPrice;
                $discountAmount = $discountPercent > 0 ? ($lineTotal * $discountPercent / 100) : 0;
                $lineNet = $lineTotal - $discountAmount;

                $totalPrice += $lineNet;
                $totalDiscount += $discountAmount;

                // เช็ก stock
                $stockSp = StockSparePart::where('sp_code', $spCode)
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->lockForUpdate()
                    ->first();

                if (!$stockSp) {
                    $stockSp = StockSparePart::create([
                        'sp_code'        => $spCode,
                        'sku_code'       => $item['sku_code'] ?? 'UNKNOWN',
                        'sku_name'       => $item['sku_name'] ?? 'UNKNOWN',
                        'sp_name'        => $item['sp_name'] ?? 'UNKNOWN',
                        'sp_unit'        => $item['sp_unit'] ?? 'ชิ้น',

                        'is_code_cust_id' => Auth::user()->is_code_cust_id,
                        'qty_sp'         => 0,
                        'user_code_key'  => Auth::user()->user_code,
                    ]);
                }

                // if (!$stockSp) throw new \Exception("ไม่พบอะไหล่ในคลัง: {$spCode}");
                // if ($stockSp->qty_sp < $qty) throw new \Exception("สต็อกอะไหล่ {$spCode} ไม่พอ");

                $before = $stockSp->qty_sp;
                $after  = $before - $qty;
                $stockSp->update(['qty_sp' => $after]);

                StockJobDetail::create([
                    'stock_job_id'        => $jobId,
                    'is_code_cust_id'     => Auth::user()->is_code_cust_id,
                    'user_code_key'       => Auth::user()->user_code,
                    'sp_code'             => $spCode,
                    'sp_name'             => $item['sp_name'] ?? '',
                    'sp_qty'              => $qty,
                    'sp_unit'             => $item['sp_unit'] ?? '',
                    'stdprice_per_unit'   => $stdPrice,
                    'sell_price'          => $sellPrice,
                    'discount_percent'    => $discountPercent,
                    'discount_amount'     => $discountAmount,
                    'before'              => $before,
                    'tran'                => -$qty,
                    'after'               => $after,
                    'type'                => 'เบิก',
                    'ref'                 => $jobId,
                    'actor'               => Auth::user()->name ?? 'system',
                    'date'                => Carbon::now(),
                ]);

                WithdrawOrderSpList::create([
                    'withdraw_id'         => $jobId,
                    'sp_code'             => $spCode,
                    'sp_name'             => $item['sp_name'] ?? '',
                    'sku_code'            => $item['sku_code'] ?? 'UNKNOWN',
                    'qty'                 => $qty,
                    'stdprice_per_unit'   => $stdPrice,
                    'sell_price'          => $sellPrice,
                    'discount_percent'    => $discountPercent,
                    'discount_amount'     => $discountAmount,
                    'sp_unit'             => $item['sp_unit'] ?? 'ชิ้น',
                    'path_file'           => env('VITE_IMAGE_SP') . ($item['sku_code'] ?? '') . '/' . ($item['sp_code'] ?? '') . '.jpg',
                ]);
            }

            DB::table('withdraw_orders')
                ->where('withdraw_id', $jobId)
                ->update([
                    'total_price'   => $totalPrice,
                    'discount_total' => $totalDiscount ?? 0,
                    'status'        => 'complete',
                ]);

            DB::table('withdraw_carts')
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->delete();

            DB::commit();

            return redirect()->route('withdrawJob.index')
                ->with('success', "✅ บันทึกใบเบิกอะไหล่ {$jobId} สำเร็จ (ส่วนลด {$discountPercent}%)");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ WithdrawJob store failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function deleteBySpCode(Request $request): JsonResponse
    {
        try {
            $sp_code = $request->input('sp_code');
            if (!$sp_code) {
                return response()->json(['message' => 'ไม่พบรหัสอะไหล่'], 400);
            }

            WithdrawCart::query()
                ->where('sp_code', $sp_code)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('is_active', false)
                ->delete();

            return response()->json(['message' => 'success']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function checkStock(Request $request): JsonResponse
    {
        try {
            $spCode = $request->query('sp_code');
            if (!$spCode) {
                return response()->json(['status' => 'error', 'message' => 'ไม่พบรหัสอะไหล่'], 400);
            }

            $qty = StockSparePart::where('sp_code', $spCode)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->value('qty_sp') ?? 0;

            return response()->json([
                'status' => 'success',
                'sp_code' => $spCode,
                'stock_balance' => (int) $qty,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($job_id)
    {
        $job = StockJob::query()
            ->leftJoin('users', 'users.user_code', '=', 'stock_jobs.user_code_key')
            ->select('stock_jobs.*', 'users.name as user_name')
            ->where('stock_jobs.stock_job_id', $job_id)
            ->firstOrFail();

        $job_detail = StockJobDetail::query()
            ->where('stock_job_id', $job_id)
            ->get(['sp_code', 'sp_name', 'sp_unit', 'sp_qty', 'stdprice_per_unit', 'sell_price', 'discount_percent']);

        $total_amount = DB::table('withdraw_orders')
            ->where('withdraw_id', $job_id)
            ->value('total_price');

        if (is_null($total_amount)) {
            $total_amount = 0;
        }

        return Inertia::render('Admin/WithdrawSp/withdrawJobs/JobsListDetail', [
            'job'          => $job,
            'job_detail'   => $job_detail,
            'total_amount' => $total_amount,
        ]);
    }

    public function exportPdf(Request $request)
    {
        try {
            Log::info('📥 เริ่ม Export PDF จาก Cart', $request->all());

            $groups = $request->input('groups', []);
            if (empty($groups)) {
                throw new \Exception("ไม่พบข้อมูลสินค้าในใบเบิก");
            }

            // ดึงข้อมูลร้านจาก store_information ตาม is_code_cust_id
            $store = StoreInformation::where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();

            // รับค่าจาก React + Fallback DB
            $soNumber = $request->input('so_number', 'SO-' . time());
            $storeName = $store->shop_name
                ?? Auth::user()->store_info->shop_name
                ?? $request->input('store_name')
                ?? Auth::user()->name
                ?? '-';
            $address = $store->address ?? Auth::user()->store_info->address ?? '-';
            $phone = $store->phone ?? Auth::user()->phone ?? '-';
            $date = $request->input('date', now()->format('d/m/Y'));
            $totalPrice = $request->input('total_price', 0);
            $discount = $request->input('discount', 0);
            $discountPercent = (float)($request->input('discount_percent') ?? 0);
            $netTotal = $request->input('net_total', 0);

            $payload = [
                "req" => "path",
                "regenqu" => "Y",
                "docno" => $soNumber,
                "doc_title" => "ใบเบิกอะไหล่",
                "typeservice" => "SO",

                "empproc"     => $request->input('empproc', Auth::user()->name ?? 'system'),
                "custsccode"  => $request->input('custsccode', Auth::user()->user_code ?? '-'),
                "custscname"  => $request->input('custscname', Auth::user()->name ?? '-'),
                
                "custnamesc" => $storeName,
                "custname"   => $storeName,
                "custscaddr" => $address,
                "custtel" => $phone,
                "date" => $date,
                "summary" => [
                    "total_price" => (float)$totalPrice,
                    "discount" => (float)$discount,
                    "net_total" => (float)$netTotal,
                ],
                "sku" => [],
            ];


            $sumBeforeDiscount = 0;
            $sumDiscount = 0;
            $sumNet = 0;

            foreach ($groups as $group) {
                foreach ($group['list'] as $sp) {
                    $qty = (float)($sp['qty'] ?? 1);
                    $stdPrice = (float)($sp['stdprice_per_unit'] ?? 0); // ราคาตั้ง
                    $discountPercent = (float)($request->input('discount_percent') ?? 0);

                    // คำนวณส่วนลดต่อหน่วย
                    $discountPerUnit = $discountPercent > 0 ? ($stdPrice * $discountPercent / 100) : 0;
                    $sellPrice = $stdPrice - $discountPerUnit; // ราคาหลังหักส่วนลด
                    $lineTotal = $sellPrice * $qty; // ยอดรวมสุทธิ

                    // รวมยอดเพื่อแสดง summary ด้านล่าง
                    $sumBeforeDiscount += ($stdPrice * $qty);
                    $sumDiscount += ($discountPerUnit * $qty);
                    $sumNet += $lineTotal;

                    $payload["sku"][] = [
                        "pid"            => $sp['sp_code'] ?? null,
                        "name"           => $sp['sp_name'] ?? '',
                        "qty"            => $qty,
                        "unit"           => $sp['sp_unit'] ?? 'ชิ้น',

                        // ราคาตั้งต่อหน่วย
                        "unitprice"      => number_format($stdPrice, 2, '.', ''),
                        "prod_discount"  => number_format($discountPercent, 2, '.', ''),

                        // ส่วนลดต่อหน่วยและรวม
                        "discount"       => number_format($discountPerUnit, 2, '.', ''),
                        "discountamount" => number_format($discountPerUnit * $qty, 2, '.', ''),

                        // ราคาหลังหักส่วนลด
                        "sell_price"     => number_format($sellPrice, 2, '.', ''),

                        // ราคาตั้ง (template บางตัวใช้)
                        "price"          => number_format($stdPrice, 2, '.', ''),
                        "priceperunit"   => number_format($stdPrice, 2, '.', ''),

                        // ยอดรวมหลังส่วนลด
                        "amount"         => number_format($lineTotal, 2, '.', ''),
                        "netamount"      => number_format($lineTotal, 2, '.', ''),
                        "net"            => number_format($lineTotal, 2, '.', ''),
                    ];
                }
            }

            $payload["summary"] = [
                "price_before_discount" => number_format($sumBeforeDiscount, 2, '.', ''),
                "prod_discount"         => number_format($discountPercent, 2, '.', ''),
                "discount"     => number_format($sumDiscount, 2, '.', ''),
                "total_price"  => number_format($sumNet, 2, '.', ''),
                "net_total"    => number_format($sumNet, 2, '.', ''),
                "sum_total"    => number_format($sumNet, 2, '.', ''),
                "amount"       => number_format($sumNet, 2, '.', ''),
            ];

            Log::info('📤 Payload ส่งไปยัง PDF API', $payload);

            // $response = Http::withHeaders([
            //     'Content-Type' => 'application/json',
            // ])->post("http://192.168.0.13/genpdf/api/gen_so", $payload);
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("http://192.168.0.13/genpdf/api/get_req_pdf", $payload);

            if (!$response->successful()) {
                throw new \Exception("PDF API error: " . $response->body());
            }

            $body = trim($response->body());
            $pdfUrl = null;

            // กรณี response เป็น URL เต็ม เช่น "http://qupumpkin.dyndns.org:8130/_SO20251112154625.pdf"
            if (preg_match('/^https?:\/\/.*\.pdf$/i', $body)) {
                $pdfUrl = $body;

                // 🔹 กรณี response เป็นชื่อไฟล์ เช่น "_SO20251112154625.pdf"
            } elseif (preg_match('/\.pdf$/i', $body)) {
                $pdfUrl = "http://qupumpkin.dyndns.org:8130/" . ltrim($body, '/');

                // 🔹 กรณี response เป็น JSON เช่น {"path":"_SO20251112154625.pdf"}
            } else {
                $decoded = json_decode($body, true);
                if (is_array($decoded) && isset($decoded['path'])) {
                    $path = $decoded['path'];
                    $pdfUrl = preg_match('/^https?:\/\//i', $path)
                        ? $path
                        : "http://qupumpkin.dyndns.org:8130/" . ltrim($path, '/');
                } elseif (is_string($decoded) && preg_match('/\.pdf$/i', $decoded)) {
                    $pdfUrl = preg_match('/^https?:\/\//i', $decoded)
                        ? $decoded
                        : "http://qupumpkin.dyndns.org:8130/" . ltrim($decoded, '/');
                }
            }

            if (!$pdfUrl) {
                throw new \Exception("ไม่สามารถตีความผลลัพธ์ PDF ได้");
            }

            Log::info('✅ สำเร็จ PDF URL: ' . $pdfUrl);

            return response()->json([
                'success' => true,
                'pdf_url' => $pdfUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Export PDF ล้มเหลว', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการส่งออก PDF: ' . $e->getMessage(),
            ], 500);
        }
    }
}
