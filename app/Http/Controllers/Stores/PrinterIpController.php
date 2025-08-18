<?php

namespace App\Http\Controllers\Stores;

use App\Http\Controllers\Controller;
use App\Models\PrinterIp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PrinterIpController extends Controller
{
    public function index($is_code_cust_id){
        if (Auth::user()->is_code_cust_id !== $is_code_cust_id) {
            abort(403);
        }

        $printer_ip = PrinterIp::query()->where('is_code_cust_id', $is_code_cust_id)->first();
        // dd($printer_ip->toArray());
        return Inertia::render('Stores/Printer/PrinterIp',['printer_ip'=> $printer_ip]);
    }
}
