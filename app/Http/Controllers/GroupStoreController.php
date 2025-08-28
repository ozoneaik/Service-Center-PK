<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockSpRequest;
use App\Models\Bill;
use App\Models\GroupStore;
use App\Models\GroupStoreDt;
use App\Models\GroupStoreShop;
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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class GroupStoreController extends Controller
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
                ->where('stock_jobs.is_code_cust_id', '=', $shop['is_code_cust_id'])
                ->where('stock_jobs.job_status', 'processing')
                ->select(DB::raw('SUM(stock_job_details.sp_qty) as total_sp_qty'))
                ->value('total_sp_qty');
        }

        return Inertia::render('Stores/Manage/GroupStoreList', [
            'shops' => $shops
        ]);
    }

    public function storeGroupStore(Request $request)
    {
        // ตรวจสอบข้อมูลก่อน
        $validated = $request->validate([
            'group_name' => 'required|string|max:255',
            'selected_shops' => 'required|array',
            'selected_shops.*' => 'integer'
        ]);

        // บันทึกตาราง group_stores
        $group = GroupStore::create([
            'name' => $validated['group_name'],
        ]);

        // บันทึกตาราง group_stores_dt
        foreach ($validated['selected_shops'] as $shopId) {
            GroupStoreShop::create([
                'group_ids' => $group->id,
                'store_ids' => $shopId,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'สร้างกลุ่มร้านค้าเรียบร้อย',
            'data' => [
                'group' => $group,
                'shops' => $validated['selected_shops'],
            ]
        ]);
    }

    public function getGroup()
    {
        // ดึงทุกกลุ่มพร้อมร้านค้า
        $groups = GroupStore::with('details.store')->get();

        $data = $groups->map(function ($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'stores' => $group->details->pluck('store') // ดึงร้านจาก relation
            ];
        });

        return response()->json($data);
    }

    public function update(Request $request, $id)
    {

        $group = GroupStore::findOrFail($id);

        // อัพเดทชื่อกลุ่ม
        $group->update(['name' => $request->name]);

        // อัพเดท mapping ร้าน
        $storeIds = $request->store_ids ?? [];

        // ลบ mapping เก่าที่มีอยู่
        GroupStoreShop::where('group_ids', $id)->delete();

        // เพิ่ม mapping ใหม่
        foreach ($storeIds as $storeId) {
            GroupStoreShop::create([
                'group_ids' => $id,
                'store_ids' => $storeId,
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $group = GroupStore::findOrFail($id);

        // ลบรายละเอียดทั้งหมดใน group_stores_dt ที่เกี่ยวข้อง
        $group->details()->delete();

        // ลบตัว group
        $group->delete();

        return response()->json(['success' => true]);
    }
}
