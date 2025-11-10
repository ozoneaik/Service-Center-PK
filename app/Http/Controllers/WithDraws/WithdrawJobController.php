<?php

namespace App\Http\Controllers\WithDraws;

use App\Http\Controllers\Controller;
use App\Models\StockJob;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
use App\Models\WithdrawCart;
use App\Models\WithdrawOrderSpList;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

                if (!$stockSp) throw new \Exception("ไม่พบอะไหล่ในคลัง: {$spCode}");
                if ($stockSp->qty_sp < $qty) throw new \Exception("สต็อกอะไหล่ {$spCode} ไม่พอ");

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
}
