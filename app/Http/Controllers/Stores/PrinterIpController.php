<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Models\PrinterIp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PrinterIpController extends Controller
{
    public function index($is_code_cust_id)
    {
        if (Auth::user()->is_code_cust_id !== $is_code_cust_id) {
            return Redirect::route('unauthorized');
        }

        $printer_ip = PrinterIp::query()->where('is_code_cust_id', $is_code_cust_id)->first();
        // dd($printer_ip);
        return Inertia::render('Stores/Printer/PrinterIp', ['ip_address_store' => $printer_ip]);
    }

    public function store_or_update(Request $request){
        $validated = $request->validate([
            'printer_ip' => 'required',
            'pc_ip' => 'required',
            'pc_port' => 'required',
            'is_code_cust_id' => 'required',
        ],[
            'printer_ip.required' => 'กรุณากรอก ip address เครื่องปริ้นต์',
            'pc_ip.required' => 'กรุณากรอก ip address เครื่องคอมพิวเดอร์',
            'pc_port.required' => 'กรุณากรอก port เครื่องคอมพิวเดอร์',
            'is_code_cust_id' => 'กรุณากรอก รหัสร้านค้า'
        ]);
        $data_saved = PrinterIp::query()->where('is_code_cust_id', $validated['is_code_cust_id'])->first();
        if ($data_saved) {
            $data_saved->printer_ip = $validated['printer_ip'];
            $data_saved->pc_ip = $validated['pc_ip'];
            $data_saved->pc_port = $validated['pc_port'];
            $data_saved->updated_by = Auth::user()->user_code;
            $data_saved->save();
        } else {
            $data_saved = new PrinterIp();
            $data_saved->is_code_cust_id = $validated['is_code_cust_id'];
            $data_saved->printer_ip = $validated['printer_ip'];
            $data_saved->pc_ip = $validated['pc_ip'];
            $data_saved->pc_port = $validated['pc_port'];
            $data_saved->created_by = Auth::user()->user_code;
            $data_saved->save();
        }

        return back()->with('success', 'บันทึกข้อมูลสําเร็จ');
        
    }
}
