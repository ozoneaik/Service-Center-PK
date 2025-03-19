<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockSpRequest;
use App\Models\Bill;
use App\Models\StockSparePart;
use App\Models\StoreInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class StockSpController extends Controller
{
    public function index()
    {
        $shops = StoreInformation::query()->with('gp')
            ->leftJoin('users', 'users.is_code_cust_id', '=', 'store_information.is_code_cust_id')
            ->select('store_information.*', DB::raw('COUNT(users.id) as count_user'))
            ->groupBy('store_information.id')
            ->get();
        return Inertia::render('Stores/Manage/StoreList', ['shops' => $shops]);
    }

    public function StockSpList($is_code_cust_id)
    {
        $stocks = StockSparePart::query()->where('is_code_cust_id', $is_code_cust_id)->get();
        $store = StoreInformation::query()->where('is_code_cust_id', $is_code_cust_id)->first();
        return Inertia::render('Stores/StockSpList', ['stocks' => $stocks, 'store' => $store, 'status' => session('status')]);
    }

    public function storeOneSp(StockSpRequest $request)
    {
        $data = $request->validated(); // ตรวจสอบข้อมูล
        DB::beginTransaction(); // เริ่ม Transaction
        try {
            $stockSp = StockSparePart::where('is_code_cust_id', $data['is_code_cust_id'])
                ->where('sp_code', $data['sp_code'])
                ->first();
            if ($stockSp) {
                $stockSp->update([
                    'old_qty_sp' => $stockSp->qty_sp,
                    'qty_sp' => $data['qty_sp'],
                ]);
                $message = "อัปเดตสต็อกอะไหล่ {$data['sp_name']} เรียบร้อยแล้ว";
            } else {
                StockSparePart::create([
                    'sku_code' => $data['sku_code'] ?? 'ไม่พบรหัสสินค้า',
                    'sku_name' => $data['sku_name'] ?? 'ไม่พบชื่อสินค้า',
                    'sp_code' => $data['sp_code'],
                    'sp_name' => $data['sp_name'],
                    'qty_sp' => $data['qty_sp'],
                    'old_qty_sp' =>  $data['qty_sp'],
                    'is_code_cust_id' => $data['is_code_cust_id'],
                ]);
                $message = "บันทึกสต็อกอะไหล่ {$data['sp_name']} สำเร็จ";
            }
            DB::commit(); // บันทึก Transaction
            return Redirect::route('stockSp.list', [
                'is_code_cust_id' => $data['is_code_cust_id']
            ])->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack(); // ยกเลิก Transaction ถ้าเกิดข้อผิดพลาด
            return Redirect::route('stockSp.list', [
                'is_code_cust_id' => $data['is_code_cust_id']
            ])->with('error', $e->getMessage());
        }
    }

    public function searchSku($sp_code, $is_code_cust_id)
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

    public function storeManySp(Request $request)
    {
        try {
            DB::beginTransaction();

            // ตรวจสอบว่ามีข้อมูลที่ส่งมาหรือไม่
            if (!$request->has('spList') || !is_array($request->spList)) {
                throw new \Exception('ไม่มีรายการอะไหล่ที่ส่งมา');
            }

            $spList = $request->spList;
            $isCodeCustId = $request->input('is_code_cust_id');

            if (!$isCodeCustId) {
                throw new \Exception('ไม่พบรหัสร้านค้า');
            }

            foreach ($spList as $sp) {
                if (!isset($sp['sp_code'], $sp['sp_name'], $sp['qty_sp'])) {
                    throw new \Exception('ข้อมูลอะไหล่ไม่ครบถ้วน');
                }

                $check = StockSparePart::where('is_code_cust_id', $isCodeCustId)
                    ->where('sp_code', $sp['sp_code'])
                    ->first();

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
                        'old_qty_sp' =>  $sp['qty_sp'],
                        'is_code_cust_id' => $isCodeCustId,
                    ]);
                }
            }

            // ตรวจสอบบิล
            $checkBill = Bill::where('is_code_cust_id', $isCodeCustId)
                ->where('bill_no', $request->barcode)
                ->first();

            if ($checkBill) {
                if ($checkBill->status === true) {
                    throw new \Exception('บิลนี้ถูกบันทึกแล้ว');
                } else {
                    $checkBill->update(['status' => true]);
                }
            } else {
                Bill::create([
                    'bill_no' => $request->barcode,
                    'is_code_cust_id' => $isCodeCustId
                ]);
            }

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
