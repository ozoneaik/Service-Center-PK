<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StartUpCost;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StartUpCostController extends Controller
{
    public function index(Request $request)
    {
        $query = StartUpCost::query();
        if (isset($request->sku_code)) {
            $query->where('sku_code', 'like', "%{$request->sku_code}%");
        }
        if (isset($request->sku_name)) {
            $query->where('sku_name', 'like', "%{$request->sku_name}%");
        }
        $StartUpCosts = $query->orderBy('id', 'desc')->paginate(100);
        return Inertia::render('Admin/StartUpCost/SucList', [
            'StartUpCosts' => $StartUpCosts,
        ]);
    }

    public function create(){
        return Inertia::render('Admin/StartUpCost/SucCreate');
    }

    public function store(Request $request){
        try{
            $request->validate([
                'sku_name' => ['required','unique:start_up_costs'],
                'startup_cost' => 'required',
            ],[
                'sku_code.required' => 'กรุณากรอก SKU Code',
                'sku_code.unique' => 'SKU Code นี้มีอยู่ในระบบแล้ว',
                'sku_name.required' => 'กรุณากรอก SKU Name',
                'startup_cost.required' => 'กรุณากรอก Startup Cost',
            ]);

            DB::beginTransaction();
            $start_up_cost = StartUpCost::query()->create([
                'image' => "https://images.dcpumpkin.com/images/product/500/".$request->sku_code.".jpg",
                'barcode' => $request->sku_code ?? null,
                'sku_code' => $request->sku_code,
                'sku_name' => $request->sku_name,
                'unit' => $request->unit ?? null,
                'amount' => $request->amount ?? null,
                'price_per_unit' => $request->price_per_unit ?? null,
                'discount' => $request->discount ?? null,
                'p_cat_name' => $request->p_cat_name ?? null,
                'startup_cost' => $request->startup_cost,
            ]);
            if ($start_up_cost) {
                DB::commit();
                return redirect()->back()->with('success', 'บันทึกข้อมูลสำเร็จ');
            }else{
                throw new Exception("ไม่สามารถบันทึกข้อมูลได้");
            }
        }catch(Exception $e){
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function delete($id)
    {
        try {
            DB::beginTransaction();
            $start_up_cost = StartUpCost::query()->where('id', $id)->first();
            if ($start_up_cost) {
                DB::commit();
                $start_up_cost->delete();
            } else {
                throw new Exception("ไม่พบข้อมูล");
            }
            return redirect()->route('startUpCost.index')->with('success', 'ลบข้อมูลสำเร็จ');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->route('startUpCost.index')->with('error', $e->getMessage());
        }
    }
}
