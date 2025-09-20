<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockSpRequest;
use App\Models\Bill;
use App\Models\JobList;
use App\Models\SparePart;
use App\Models\StockJob;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
use App\Models\StoreInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockSpController extends Controller
{
    public function index(): Response
    {
        $shops = StoreInformation::query()->with('gp')
            ->leftJoin('users', 'users.is_code_cust_id', '=', 'store_information.is_code_cust_id')
            ->select('store_information.*', DB::raw('COUNT(users.id) as count_user'))
            ->groupBy('store_information.id')
            ->get();
        foreach ($shops as $shop) {
            $shop['AT'] = StockJobDetail::query()
                ->leftJoin('stock_jobs', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
                ->where('stock_jobs.is_code_cust_id', '=', $shop['is_code_cust_id']) // เปลี่ยนจาก 'like' เป็น '='
                ->where('stock_jobs.job_status', 'processing')
                ->select(DB::raw('SUM(stock_job_details.sp_qty) as total_sp_qty'))
                ->value('total_sp_qty'); // ดึงค่า SUM จริง ๆ
        }
        return Inertia::render('Stores/Manage/StoreList', ['shops' => $shops]);
    }

    // หน้าแสดงสต็อกรายการอะไหล่
    public function StockSpList(Request $request, $is_code_cust_id): Response
    {
        $sp_code = $request->input('sp_code');
        $sp_name = $request->input('sp_name');
        $query = StockSparePart::query();
        if (isset($sp_code)) {
            $query->where('sp_code', 'like', "%$sp_code%");
        }
        if (isset($sp_name)) {
            $query->where('sp_name', 'like', "%$sp_name%");
        }
        $query->where('is_code_cust_id', $is_code_cust_id);
        $stocks = $query->get();

        $job_pending = JobList::query()
            ->where('is_code_key', $is_code_cust_id)
            ->where('status', 'pending')
            ->select('job_id', 'pid')
            ->get();

        // ผลรวมของอะไหล่แจ้งซ่อม
        $rp_sp = SparePart::query()
            ->whereIn('job_id', $job_pending->pluck('job_id')->toArray())
            ->select('sp_code', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('sp_code')
            ->get();
        $store = StoreInformation::query()->where('is_code_cust_id', $is_code_cust_id)->first();
        foreach ($stocks as $stock) {
            $stock->rp_qty = 0;
            foreach ($rp_sp as $rp) {
                if ($stock->sp_code === $rp->sp_code) {
                    $stock->rp_qty = intval($rp->total_qty);
                    break;
                }
            }
        }

        // ผลรวมของอะไหล่ปรับปรุง
        $stj_sp = StockJob::query()
            ->leftJoin('stock_job_details', 'stock_job_details.stock_job_id', '=', 'stock_jobs.stock_job_id')
            ->where('stock_jobs.job_status', 'processing')
            ->select('stock_job_details.sp_code', 'stock_job_details.sp_name', DB::raw('SUM(stock_job_details.sp_qty)'))
            ->groupBy('stock_job_details.sp_code', 'stock_job_details.sp_name')->get();
        foreach ($stocks as $stock) {
            $stock->stj_qty = 0;
            foreach ($stj_sp as $stj) {
                if ($stock->sp_code === $stj->sp_code) {
                    $stock->stj_qty = intval($stj->sum);
                    break;
                }
            }
        }

        $stock_job_add_type = StockJob::query()
            ->where('job_status', 'processing')
            ->where('is_code_cust_id', $is_code_cust_id)
            ->where('type', 'เพิ่ม')
            ->get()
            ->map(function ($stj_add) {
                $stj_add = (object)$stj_add->toArray(); // แปลงเป็น stdClass
                $stj_add->list = StockJobDetail::query()
                    ->where('stock_job_id', $stj_add->stock_job_id)
                    ->select('sp_code','sp_name','sp_qty')
                    ->get()
                    ->toArray();
                return $stj_add;
            })
            ->values()
            ->all(); // ให้ได้ array object ที่เข้าถึงแบบ $obj->property

        $stock_job_remove_type = StockJob::query()
            ->where('job_status', 'processing')
            ->where('is_code_cust_id', $is_code_cust_id)
            ->where('type', 'ลด')
            ->get()
            ->map(function ($stj_remove) {
                $stj_remove = (object)$stj_remove->toArray();
                $stj_remove->list = StockJobDetail::query()
                    ->where('stock_job_id', $stj_remove->stock_job_id)
                    ->select('sp_code','sp_name','sp_qty')
                    ->get()
                    ->toArray();
                return $stj_remove;
            })
            ->values()
            ->all();



        //        dd($stocks->toArray(), $store->toArray(), $job_pending->toArray(), $rp_sp->toArray(),$stj_sp->toArray());
        return Inertia::render('Stores/StockSp/StockSpList', [
            'stocks' => $stocks,
            'store' => $store,
            'status' => session('status'),
            'job_pending' => [$job_pending, $rp_sp],
            'stock_job_add_type' => $stock_job_add_type,
            'stock_job_remove_type' => $stock_job_remove_type
        ]);
    }

    public function storeManySp(Request $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            if (!$request->has('spList') || !is_array($request->spList)) {
                throw new \Exception('ไม่มีรายการอะไหล่ที่ส่งมา');
            }
            $spList = $request->spList;
            $isCodeCustId = $request->input('is_code_cust_id');
            if (!$isCodeCustId) throw new \Exception('ไม่พบรหัสร้านค้า');
            foreach ($spList as $sp) {
                if (!isset($sp['sp_code'], $sp['sp_name'], $sp['qty_sp'])) throw new \Exception('ข้อมูลอะไหล่ไม่ครบถ้วน');
                $check = StockSparePart::where('is_code_cust_id', $isCodeCustId)->where('sp_code', $sp['sp_code'])->first();
                if ($check) {
                    $check->update([
                        'old_qty_sp' => $check->qty_sp,
                        'qty_sp' => $check->qty_sp + $sp['qty_sp']
                    ]);
                } else {
                    StockSparePart::create([
                        'sku_code' => $sp['sku_code'] ?? 'ไม่พบรหัสสินค้า',
                        'sku_name' => $sp['sku_name'] ?? 'ไม่พบชื่อสินค้า',
                        'sp_code' => $sp['sp_code'],
                        'sp_name' => $sp['sp_name'],
                        'qty_sp' => $sp['qty_sp'],
                        'old_qty_sp' => $sp['qty_sp'],
                        'is_code_cust_id' => $isCodeCustId,
                    ]);
                }
            }
            $checkBill = Bill::query()->where('bill_no', $request->barcode)->first();
            if ($checkBill) {
                if ($checkBill->status === true) throw new \Exception('บิลนี้เคยถูกบันทึกแล้ว');
                else $checkBill->update(['status' => true]);
            } else Bill::query()->create(['bill_no' => $request->barcode, 'is_code_cust_id' => $isCodeCustId]);
            DB::commit();
            return Redirect::route('stockSp.list', [
                'is_code_cust_id' => $isCodeCustId
            ])->with('success', 'บันทึกสต็อกอะไหล่สำเร็จ');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stockSp.list', [
                'is_code_cust_id' => $request->is_code_cust_id ?? null
            ])->with('error', $e->getMessage());
        }
    }


    //นับจำนวนคงเหลือใน stock job
    public function countSp($sp_code)
    {
        try {
            //สต็อกคงเหลือ	
            $sp_count = StockSparePart::query()->where('sp_code', $sp_code)->where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();
            if ($sp_count) {
                $sp_count = $sp_count->qty_sp;
            } else {
                $sp_count = 0;
            }
            // สต็อกคงเหลือพร้อมใช้งาน
            $stock_job_processing_positive_type = StockJob::query()->where('type', 'เพิ่ม')->where('is_code_cust_id', Auth::user()->is_code_cust_id)->where('job_status', 'processing')->get();
            $sp_count_already_positive_type = 0;
            foreach ($stock_job_processing_positive_type as $key => $stock_job) {
                $stock_job_detail = StockJobDetail::query()->where('stock_job_id', $stock_job->stock_job_id)->where('sp_code', $sp_code)->first();
                if ($stock_job_detail) {
                    $sp_count_already_positive_type += (int)$stock_job_detail->sp_qty;
                }
            }

            $stock_job_processing_nagative_type = StockJob::query()->where('type', 'เพิ่ม')->where('is_code_cust_id', Auth::user()->is_code_cust_id)->where('job_status', 'processing')->get();
            $sp_count_already_nagative_type = 0;
            foreach ($stock_job_processing_nagative_type as $key => $stock_job) {
                $stock_job_detail = StockJobDetail::query()->where('stock_job_id', $stock_job->stock_job_id)->where('sp_code', $sp_code)->first();
                if ($stock_job_detail) {
                    $sp_count_already_nagative_type += (int)$stock_job_detail->sp_qty;
                }
            }

            // จำนวนอะไหล่ที่กำลังซ่อม
            $job_pending = JobList::query()->where('is_code_key', Auth::user()->is_code_cust_id)->where('status', 'pending')->get();
            $count_spare_part_job = 0;
            foreach ($job_pending as $key => $job) {
                $spare_part = SparePart::query()->where('job_id', $job->job_id)->where('sp_code', $sp_code)->first();
                if ($spare_part) {
                    $count_spare_part_job += (int)$spare_part->qty;
                }
            }

            $total_aready = (int)$sp_count - (int)($sp_count_already_nagative_type + $count_spare_part_job) + (int)$sp_count_already_positive_type;
            return response()->json([
                'message' => 'พบข้อมูล',
                'sp_count' => $sp_count,
                'total_aready' => $total_aready
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'sp_count' => 0,
                'total_aready' => 0
            ], 400);
        }
    }

    public function storeOrUpdateStockJob(Request $request)
    {
        try {
            dd($request->all());
        } catch (\Exception $e) {
        }
    }
}
