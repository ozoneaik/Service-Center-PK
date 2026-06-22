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
        $highlightJobId = $request->query('job_id');
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

            'highlightJobId' => $highlightJobId,
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

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $req = $request->all();
            if (empty($req['items']) || count($req['items']) === 0) {
                throw new \Exception('ไม่พบรายการอะไหล่ในใบเบิก');
            }

            $jobId = $req['job_id'];
            $discountPercent = (float)($req['discount_percent'] ?? 0);

            $isEditing = StockJob::where('stock_job_id', $jobId)->exists();

            // บันทึกหัว JOB
            StockJob::updateOrCreate(
                ['stock_job_id' => $jobId],
                [
                    'stock_job_id'    => $jobId,
                    'is_code_cust_id' => Auth::user()->is_code_cust_id,
                    'user_code_key'   => Auth::user()->user_code,
                    // 'job_status'      => 'process',
                    'job_status'      => 'processing',
                    'type'            => 'เบิก',
                ]
            );

            // ถ้าเป็นการแก้ไข ให้ลบ detail เก่าออก
            if ($isEditing) {
                StockJobDetail::where('stock_job_id', $jobId)->delete();
                WithdrawOrderSpList::where('withdraw_id', $jobId)->delete();

                DB::table('withdraw_orders')
                    ->where('withdraw_id', $jobId)
                    ->update([
                        // 'status'         => 'process',
                        'status'         => 'processing',
                        'total_price'    => 0,
                        'discount_total' => 0,
                        'updated_at'     => now(),
                    ]);
            } else {
                DB::table('withdraw_orders')->insert([
                    'withdraw_id'  => $jobId,
                    'is_code_key'  => Auth::user()->is_code_cust_id,
                    'user_key'     => Auth::user()->user_code,
                    'status'       => 'processing',
                    'total_price'  => 0,
                    'remark'       => 'เบิกอะไหล่จากระบบ',
                    'created_at'   => now(),
                    'completed_at' => now(),
                ]);
            }

            $totalPrice = 0;
            $totalDiscount = 0;

            foreach ($req['items'] as $item) {

                $qty = (int)$item['qty'];
                $spCode = $item['sp_code'];
                $sellPrice = (float)$item['sell_price'];
                $stdPrice = (float)$item['stdprice_per_unit'];

                $lineTotal = $qty * $sellPrice;
                $discountAmount = $discountPercent > 0 ? ($lineTotal * $discountPercent / 100) : 0;
                $lineNet = $lineTotal - $discountAmount;

                $totalPrice += $lineNet;
                $totalDiscount += $discountAmount;

                // สินค้าในสต๊อก (ยังไม่หักจนกว่าจะ complete)
                $stock = StockSparePart::firstOrCreate(
                    [
                        'sp_code'        => $spCode,
                        'is_code_cust_id' => Auth::user()->is_code_cust_id,
                    ],
                    [
                        'sku_code'      => $item['sku_code'] ?? '-',
                        'sku_name'      => $item['sku_name'] ?? $item['sp_name'],
                        'sp_name'       => $item['sp_name'],
                        'sp_unit'       => $item['sp_unit'],
                        'qty_sp'        => 0,
                        'user_code_key' => Auth::user()->user_code,
                    ]
                );

                // บันทึก detail ของ JOB
                StockJobDetail::updateOrCreate(
                    [
                        'stock_job_id' => $jobId,
                        'sp_code' => $spCode,
                    ],
                    [
                        'is_code_cust_id' => Auth::user()->is_code_cust_id,
                        'user_code_key'   => Auth::user()->user_code,
                        'sp_name' => $item['sp_name'],
                        'sp_qty' => $qty,
                        'sp_unit' => $item['sp_unit'],
                        'stdprice_per_unit' => $stdPrice,
                        'sell_price' => $sellPrice,
                        'discount_percent' => $discountPercent,
                        'discount_amount' => $discountAmount,
                        'before' => $stock->qty_sp,
                        'tran' => 0,
                        'after' => $stock->qty_sp - $qty,
                        'type' => 'เบิก',
                        'ref' => $jobId,
                        'actor' => Auth::user()->name,
                        'date' => now(),
                    ]
                );

                // บันทึกลงตาราง withdraw_order_sp_lists
                WithdrawOrderSpList::updateOrCreate(
                    [
                        'withdraw_id' => $jobId,
                        'sp_code' => $spCode,
                    ],
                    [
                        'sp_name' => $item['sp_name'],
                        'sku_code' => $item['sku_code'],
                        'qty' => $qty,
                        'stdprice_per_unit' => $stdPrice,
                        'sell_price' => $sellPrice,
                        'discount_percent' => $discountPercent,
                        'discount_amount' => $discountAmount,
                        'sp_unit' => $item['sp_unit'],
                        'path_file' => env('VITE_IMAGE_SP_NEW') . $item['sku_code'] . '/' . $spCode . '.jpg',
                    ]
                );
            }

            // อัปเดตยอดรวม ORDER
            DB::table('withdraw_orders')
                ->where('withdraw_id', $jobId)
                ->update([
                    'total_price'    => $totalPrice,
                    'discount_total' => $totalDiscount,
                ]);

            WithdrawCart::where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('user_code_key', Auth::user()->user_code)
                ->where('is_active', false)
                ->delete();

            DB::commit();

            return redirect()->route('withdrawJob.index', ['job_id' => $jobId])
                ->with('success', "บันทึกใบเบิก {$jobId} สำเร็จ");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("WithdrawJob failed", ['err' => $e->getMessage()]);
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function updateDetail(Request $request)
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'job_id' => 'required|string',
                'sp_code' => 'required|string',
                'sp_qty' => 'required|numeric|min:1',
            ]);

            $jobId = $request->job_id;
            $spCode = $request->sp_code;
            $qty = (int)$request->sp_qty;

            $detail = StockJobDetail::where('stock_job_id', $jobId)
                ->where('sp_code', $spCode)
                ->firstOrFail();

            // อัปเดตจำนวน
            $detail->update([
                'sp_qty' => $qty,
                'discount_percent' => $request->discount_percent ?? $detail->discount_percent,
                'discount_amount' => (($detail->sell_price ?? 0) * $qty * ($request->discount_percent ?? 0)) / 100,
                'after'  => $detail->before - $qty,
            ]);

            // อัปเดตยอดรวม ORDER
            $total = StockJobDetail::where('stock_job_id', $jobId)
                ->selectRaw("SUM((sp_qty * sell_price) - discount_amount) as total")
                ->value('total') ?? 0;

            DB::table('withdraw_orders')
                ->where('withdraw_id', $jobId)
                ->update(['total_price' => $total]);

            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // public function complete($job_id)
    // {
    //     try {
    //         DB::beginTransaction();

    //         $job = StockJob::where('stock_job_id', $job_id)->firstOrFail();

    //         if ($job->job_status !== 'processing') {
    //             throw new \Exception("ไม่สามารถปิดงานได้ เนื่องจากสถานะไม่ใช่ processing");
    //         }

    //         $items = StockJobDetail::where('stock_job_id', $job_id)->get();

    //         $errors = [];

    //         // เช็คสต็อคปัจจุบันทุกรายการก่อน
    //         foreach ($items as $item) {
    //             $sp = StockSparePart::where('sp_code', $item->sp_code)
    //                 ->where('is_code_cust_id', $job->is_code_cust_id)
    //                 ->first();

    //             $stockNow = $sp->qty_sp ?? 0;

    //             if ($stockNow < $item->sp_qty) {
    //                 $errors[] = [
    //                     'sp_code' => $item->sp_code,
    //                     'need'    => $item->sp_qty,
    //                     'sp_name' => $item->sp_name,
    //                     'have'    => $stockNow,
    //                 ];
    //             }
    //         }


    //         // ถ้าสต๊อคไม่พอ → สร้างเอกสาร JOB-STOCK อัตโนมัติ
    //         if (!empty($errors)) {

    //             // สร้างเลขเอกสารอัตโนมัติ
    //             $newStockJobId = 'JOB-STOCK' . time() . rand(100, 999);

    //             // บันทึกหัวเอกสาร JOB-STOCK (auto)
    //             $stockJob = StockJob::create([
    //                 'stock_job_id'    => $newStockJobId,
    //                 'is_code_cust_id' => $job->is_code_cust_id,
    //                 'user_code_key'   => $job->user_code_key,
    //                 'job_status'      => 'processing',
    //                 'type'            => 'เพิ่ม',
    //                 'doctype'         => 'Auto',
    //                 'ref_doc'         => $job_id,
    //                 'remark'          => "Auto created by withdraw job {$job_id} (stock shortage)"
    //             ]);

    //             // เติมเฉพาะรายการที่สต๊อคไม่พอ
    //             foreach ($errors as $item) {

    //                 $need = (int)$item['need'];
    //                 $have = (int)$item['have'];
    //                 $requireQty = $need - $have; // จำนวนที่ต้องเติม

    //                 StockJobDetail::create([
    //                     'stock_job_id' => $newStockJobId,
    //                     'is_code_cust_id' => $job->is_code_cust_id,
    //                     'user_code_key' => $job->user_code_key,

    //                     'sp_code' => $item['sp_code'],
    //                     'sp_name' => $item['sp_name'],
    //                     'sp_qty'  => $requireQty,
    //                     'sp_unit' => 'ชิ้น',

    //                     'before' => $have,
    //                     'tran'   => 0,
    //                     'after'  => $have + $requireQty,
    //                 ]);
    //             }

    //             $job->update(['job_status' => 'complete']);

    //             DB::table('withdraw_orders')
    //                 ->where('withdraw_id', $job_id)
    //                 ->update(['status' => 'complete']);

    //             DB::commit();

    //             return response()->json([
    //                 'success' => false,
    //                 'stock_error' => true,
    //                 'new_stock_job_id' => $newStockJobId,
    //                 'message' => "สต๊อคไม่เพียงพอ",
    //                 'details' => $errors
    //             ], 422);
    //         }

    //         // ถ้าสต็อคพอทั้งหมด → เตรียมหัก stock จริง
    //         foreach ($items as $item) {
    //             $sp = StockSparePart::where('sp_code', $item->sp_code)
    //                 ->where('is_code_cust_id', $job->is_code_cust_id)
    //                 ->lockForUpdate()
    //                 ->first();

    //             $before = $sp->qty_sp;
    //             $after  = $before - $item->sp_qty;

    //             $sp->update(['qty_sp' => $after]);

    //             $item->update([
    //                 'before' => $before,
    //                 'tran'   => -$item->sp_qty,
    //                 'after'  => $after,
    //             ]);
    //         }

    //         $job->update(['job_status' => 'complete']);

    //         DB::table('withdraw_orders')
    //             ->where('withdraw_id', $job_id)
    //             ->update(['status' => 'complete']);

    //         WithdrawCart::where('is_code_cust_id', $job->is_code_cust_id)
    //             ->where('user_code_key', $job->user_code_key)
    //             ->delete();

    //         DB::commit();

    //         return response()->json(['success' => true]);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'success' => false,
    //             'message' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    public function complete($job_id)
    {
        try {
            DB::beginTransaction();

            $job = StockJob::where('stock_job_id', $job_id)->firstOrFail();

            if ($job->job_status !== 'processing') {
                throw new \Exception("ไม่สามารถปิดงานได้ เนื่องจากสถานะไม่ใช่ processing");
            }

            $items = StockJobDetail::where('stock_job_id', $job_id)->get();
            $errors = [];

            /**
             * 1) เช็คสต็อกปัจจุบันของอะไหล่ทุกตัวในใบเบิก
             */
            foreach ($items as $item) {
                $sp = StockSparePart::where('sp_code', $item->sp_code)
                    ->where('is_code_cust_id', $job->is_code_cust_id)
                    ->first();

                $stockNow = $sp->qty_sp ?? 0;

                if ($stockNow < $item->sp_qty) {
                    $errors[] = [
                        'sp_code' => $item->sp_code,
                        'sp_name' => $item->sp_name,
                        'have'    => $stockNow,
                        'need'    => $item->sp_qty,
                    ];
                }
            }


            if (!empty($errors)) {
                $newStockJobId = 'JOB-STOCK' . time() . rand(100, 999);

                $autoJob = StockJob::create([
                    'stock_job_id'    => $newStockJobId,
                    'is_code_cust_id' => $job->is_code_cust_id,
                    'user_code_key'   => $job->user_code_key,
                    'job_status'      => 'processing', // ยังไม่ complete
                    'type'            => 'เพิ่ม',
                    'doctype'         => 'Auto',
                    'ref_doc'         => $job_id,
                    'remark'          => "Auto created by withdraw job {$job_id} (stock shortage)",
                ]);

                foreach ($errors as $err) {
                    $requireQty = $err['need'] - $err['have']; // จำนวนที่ต้องเติมเข้าสต็อกจริงในอนาคต

                    StockJobDetail::create([
                        'stock_job_id'    => $newStockJobId,
                        'is_code_cust_id' => $job->is_code_cust_id,
                        'user_code_key'   => $job->user_code_key,

                        'sp_code' => $err['sp_code'],
                        'sp_name' => $err['sp_name'],
                        'sp_qty'  => $requireQty,
                        'sp_unit' => 'ชิ้น',

                        'before' => $err['have'],
                        'tran'   => 0,                      // ยังไม่บวกสต็อกจริง
                        'after'  => $err['have'] + $requireQty,
                        'date'   => now(),
                    ]);
                }
            }

            /**
             * 3) ตัดสต็อกจริงสำหรับใบเบิก (ยอมให้ติดลบได้)
             */
            foreach ($items as $item) {
                $sp = StockSparePart::where('sp_code', $item->sp_code)
                    ->where('is_code_cust_id', $job->is_code_cust_id)
                    ->lockForUpdate()
                    ->first();

                // ถ้าไม่มี row ใน StockSparePart ให้สร้างใหม่ (เริ่มจาก 0)
                if (!$sp) {
                    $sp = StockSparePart::create([
                        'sp_code'        => $item->sp_code,
                        'sp_name'        => $item->sp_name,
                        'sku_code'       => $item->sku_code ?? '',
                        'sku_name'       => $item->sku_name ?? '',
                        'sp_unit'        => $item->sp_unit ?? 'ชิ้น',
                        'qty_sp'         => 0,
                        'is_code_cust_id' => $job->is_code_cust_id,
                        'user_code_key'  => $job->user_code_key,
                    ]);
                }

                $before = $sp->qty_sp;
                $after  = $before - $item->sp_qty;  // ✅ ยอมให้เป็นค่าติดลบได้

                // อัปเดตสต็อกจริง
                $sp->update(['qty_sp' => $after]);

                // อัปเดตรายละเอียดใน StockJobDetail
                $item->update([
                    'before' => $before,
                    'tran'   => -$item->sp_qty,
                    'after'  => $after,
                ]);
            }

            /**
             * 4) ปิดใบเบิก + ใบสั่งเบิก
             */
            $job->update(['job_status' => 'complete']);

            DB::table('withdraw_orders')
                ->where('withdraw_id', $job_id)
                ->update(['status' => 'complete']);

            WithdrawCart::where('is_code_cust_id', $job->is_code_cust_id)
                ->where('user_code_key', $job->user_code_key)
                ->delete();

            DB::commit();

            // return response()->json([
            //     'success'          => true,
            //     'auto_job_created' => !empty($errors),
            //     'shortages'        => $errors,
            // ]);
            if (!empty($errors)) {
                return response()->json([
                    'stock_error' => true,
                    'details' => $errors,
                    'new_stock_job_id' => $newStockJobId,
                    'message' => "สต๊อคไม่เพียงพอ",
                ], 422);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteDetail(Request $request)
    {
        $validated = $request->validate([
            'job_id' => 'required',
            'sp_code' => 'required',
        ]);

        try {
            WithdrawOrderSpList::where('withdraw_id', $request->job_id)
                ->where('sp_code', $request->sp_code)
                ->delete();

            StockJobDetail::where('stock_job_id', $request->job_id)
                ->where('sp_code', $request->sp_code)
                ->delete();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getItems($jobId)
    {
        try {
            $items = StockJobDetail::where('stock_job_id', $jobId)
                ->get([
                    'sp_code',
                    'sp_name',
                    'sp_unit',
                    'sp_qty',
                    'stdprice_per_unit',
                    'sell_price'
                ]);

            return response()->json([
                'success' => true,
                'items' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
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

        $autoJob = StockJob::where('ref_doc', $job_id)->first();
        $job_detail = StockJobDetail::query()
            ->where('stock_job_id', $job_id)
            ->get(['sp_code', 'sp_name', 'sp_unit', 'sp_qty', 'stdprice_per_unit', 'sell_price', 'discount_percent']);

        $outOfStock = [];

        foreach ($job_detail as $item) {
            $currentQty = \App\Models\StockSparePart::where('sp_code', $item->sp_code)
                ->where('is_code_cust_id', $job->is_code_cust_id)
                ->value('qty_sp') ?? 0;

            if ($currentQty < $item->sp_qty) {
                $outOfStock[] = $item->sp_code;
            }
        }

        $total_amount = DB::table('withdraw_orders')
            ->where('withdraw_id', $job_id)
            ->value('total_price');

        if (is_null($total_amount)) {
            $total_amount = 0;
        }

        $jobDiscount = StockJobDetail::where('stock_job_id', $job_id)
            ->value('discount_percent') ?? 0;

        return Inertia::render('Admin/WithdrawSp/withdrawJobs/JobsListDetail', [
            'job'          => $job,
            'job_detail'   => $job_detail,
            'total_amount' => $total_amount,
            'discount_percent' => $jobDiscount,
            'out_of_stock_list' => $outOfStock,
            'auto_job' => $autoJob,
        ]);
    }

    public function delete($job_id)
    {
        try {
            DB::beginTransaction();

            $job = StockJob::where('stock_job_id', $job_id)->firstOrFail();

            $job->update([
                'job_status' => 'deleted'
            ]);

            DB::table('withdraw_orders')
                ->where('withdraw_id', $job_id)
                ->update(['status' => 'deleted']);

            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    //ฟังก์ชั่น Export PDF หน้าเบิกอะไหล่
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
                "typeservice" => "req",

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
