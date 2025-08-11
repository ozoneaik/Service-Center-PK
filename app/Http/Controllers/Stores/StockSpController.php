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

        $rp_sp = SparePart::query()
            ->whereIn('job_id', $job_pending->pluck('job_id')->toArray())
            ->select('sp_code', \DB::raw('SUM(qty) as total_qty'))
            ->groupBy('sp_code')
            ->get();

        $store = StoreInformation::query()->where('is_code_cust_id', $is_code_cust_id)->first();
        return Inertia::render('Stores/StockSp/StockSpList', [
            'stocks' => $stocks,
            'store' => $store,
            'status' => session('status'),
            'job_pending' => [$job_pending, $sp_rp],
        ]);
    }

    public function storeOneSp(StockSpRequest $request): RedirectResponse
    {
        $data = $request;
        DB::beginTransaction();
        try {
            $stockSp = StockSparePart::where('is_code_cust_id', $data['is_code_cust_id'])
                ->where('sp_code', $data['sp_code'])
                ->first();
            if ($stockSp) {
                $stockSp->update([
                    'old_qty_sp' => $stockSp->qty_sp,
                    'qty_sp' => $data['qty_sp'] + $stockSp->qty_sp,
                ]);
                $message = "อัปเดตสต็อกอะไหล่ {$data['sp_name']} เรียบร้อยแล้ว";
            } else {
                StockSparePart::create([
                    'sku_code' => $data['sku_code'] ?? 'ไม่พบรหัสสินค้า',
                    'sku_name' => $data['sku_name'] ?? 'ไม่พบชื่อสินค้า',
                    'sp_code' => $data['sp_code'],
                    'sp_name' => $data['sp_name'],
                    'qty_sp' => $data['qty_sp'],
                    'old_qty_sp' => $data['qty_sp'],
                    'is_code_cust_id' => $data['is_code_cust_id'],
                ]);
                $message = "บันทึกสต็อกอะไหล่ {$data['sp_name']} สำเร็จ";
            }
            DB::commit();
            return Redirect::route('stockSp.list', [
                'is_code_cust_id' => $data['is_code_cust_id']
            ])->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stockSp.list', [
                'is_code_cust_id' => $data['is_code_cust_id']
            ])->with('error', $e->getMessage());
        }
    }

    public function searchSku($sp_code, $is_code_cust_id): JsonResponse
    {
        $search = StockSparePart::query()
            ->where('sp_code', 'like', "%$sp_code%")
            ->where('is_code_cust_id', $is_code_cust_id)
            ->first();
        return response()->json([
            'message' => $search ? 'พบข้อมูล' : 'ไม่พบข้อมูล',
            'data' => $search ?? []
        ], $search ? 200 : 404);
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
}
