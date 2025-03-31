<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaleRequest;
use App\Models\SaleInformation;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(): Response
    {
        $sales = SaleInformation::query()->orderBy('id', 'desc')->get();
        return Inertia::render('Admin/Sales/SaleList', ['sales' => $sales]);
    }

    public function create()
    {
        return Inertia::render('Admin/Sales/AddSale');
    }

    public function store(SaleRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $data = $request->all();
            SaleInformation::query()->create($data);
            DB::commit();
            session()->flash('success', 'สร้าง sale สำเร็จ');
            return Redirect::route('Sales.index');
        } catch (Exception $e) {
            DB::rollBack();
            session()->flash('error', $e->getMessage());
            return Redirect::route('Sales.index');
        }
    }

    public function update(Request $request, $sale_code): RedirectResponse
    {
        try {
            $formData = $request->all();
            $sale = SaleInformation::query()->where('sale_code', $sale_code)->first();
            DB::beginTransaction();
            if (!$sale) {
                throw new Exception('ไม่พบข้อมูลเซลล์');
            } else {
                $sale->name = $formData['name'];
                $sale->save();
                DB::commit();
            }
            return redirect()->back()->with('success', 'อัพเดทข้อมูลเรียบร้อย');
        } catch (Exception $exception) {
            DB::rollBack();
            return redirect()->back()->with('error', $exception->getMessage());
        }
    }

    public function destroy($sale_code): RedirectResponse
    {
        try {
            $sale = SaleInformation::query()->where('sale_code', $sale_code)->first();
            DB::beginTransaction();
            if ($sale) {
                $sale->delete();
                DB::commit();
                session()->flash('success', 'ลบข้อมูลเสร็จสิ้น');
                return Redirect::route('Sales.index');
            } else throw new Exception("ไม่พบข้อมูลเซลล์รหัส $sale_code");
        } catch (Exception $exception) {
            DB::rollBack();
            session()->flash('error', $exception->getMessage());
            return Redirect::route('Sales.index');
        }

    }
}
