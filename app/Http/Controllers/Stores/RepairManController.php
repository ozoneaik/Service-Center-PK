<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Http\Requests\Stores\RepairMan\RpmStoreRequest;
use App\Models\RepairMan;
use App\Models\StoreInformation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RepairManController extends Controller
{

    // แสดงรายการช่าง
    public function index(Request $request, $is_code_cust_id)
    {
        $repair_mans = RepairMan::query()->where('is_code_cust_id', $is_code_cust_id)
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('Stores/RepairMain/RpmList', ['repair_mans' => $repair_mans, 'is_code_cust_id' => $is_code_cust_id]);
    }

    public function create($is_code_cust_id)
    {
        $store = StoreInformation::query()->where('is_code_cust_id', $is_code_cust_id)->first();
        return Inertia::render('Stores/RepairMain/RpmCreate', ['store' => $store]);
    }

    // เพิ่มช่าง
    public function store(RpmStoreRequest $request)
    {
        $validated = $request->all();
        RepairMan::create($validated);
        return redirect()
            ->route('repairMan.index', ['is_code_cust_id' => $validated['is_code_cust_id']])
            ->with('success', 'เพิ่มช่างซ่อมสำเร็จ');
    }

    public function edit($id)
    {
        $repair_man = RepairMan::query()->where('id', $id)->first();
        if ($repair_man) {
            $store = StoreInformation::query()->where('is_code_cust_id', $repair_man['is_code_cust_id'])->select('is_code_cust_id', 'shop_name')->first();
            return Inertia::render('Stores/RepairMain/RpmCreate', ['store' => $store, 'repair_man' => $repair_man]);
        } else {
            return abort(404);
        }
    }

    // แก้ไขช่าง
    public function update(RpmStoreRequest $request, $id)
    {
        $validated = $request->all();
        RepairMan::where('id', $id)->update($validated);
        return redirect()
            ->route('repairMan.index', ['is_code_cust_id' => $validated['is_code_cust_id']])
            ->with('success', 'แก้ไขช่างซ่อมสำเร็จ');
    }

    // ลบช่างแบบปลอดภัย
    public function delete($id)
    {
        RepairMan::where('id', $id)->delete();
        return redirect()
            ->route('repairMan.index', ['is_code_cust_id' => $id])
            ->with('success', 'ลบช่างซ่อมสำเร็จ');
    }

    // ลบช่างแบบถาวร
    public function destroy($id)
    {
        RepairMan::where('id', $id)->forceDelete();
        return redirect()
            ->route('repairMan.index', ['is_code_cust_id' => $id])
            ->with('success', 'ลบช่างซ่อมสำเร็จ');
    }
}
