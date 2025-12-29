<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StockJob;
use App\Models\StoreInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WithdrawReportController extends Controller
{
    //Admin User
    public function index(Request $request)
    {
        // $shop = StoreInformation::orderBy('shop_name', 'asc')->get();
        $shop = StoreInformation::where('is_active', 'Y')
            ->orderBy('shop_name', 'asc')
            ->get();
        $defaultShop = Auth::user()->is_code_cust_id;
        $selectedShop = $request->query('shop', $defaultShop);
        $currentShopName = StoreInformation::where('is_code_cust_id', $selectedShop)->value('shop_name');
        $search = $request->query('search');
        $status = $request->query('status');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        // 1. Base Query สำหรับดึงข้อมูลลงตาราง
        $query = StockJob::query()
            ->select(
                'stock_jobs.job_status',
                'stock_jobs.stock_job_id',
                'stock_jobs.created_at',
                'stock_job_details.sp_code',       // รหัสสินค้า
                'stock_job_details.sp_name',      // ชื่อสินค้า
                'stock_job_details.sp_unit',      // หน่วย
                'stock_job_details.sp_qty',       // จำนวน
                'stock_job_details.stdprice_per_unit', // ราคาต่อหน่วย
                'stock_job_details.discount_percent'   // ส่วนลด (%)
            )
            ->leftJoin('stock_job_details', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
            ->where('stock_jobs.type', 'เบิก')
            ->where('stock_jobs.is_code_cust_id', $selectedShop);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('stock_spare_parts.sp_code', 'like', "%{$search}%")
                    ->orWhere('stock_spare_parts.sp_name', 'like', "%{$search}%");
            });
        }
        if ($status) {
            $query->where('stock_jobs.job_status', $status);
        }
        if ($startDate) {
            $query->whereDate('stock_jobs.created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('stock_jobs.created_at', '<=', $endDate);
        }

        $withdrawals = (clone $query)
            ->orderBy('stock_jobs.created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // 2. ส่วนคำนวณ Stats (Dashboard)
        // สร้าง Query พื้นฐานสำหรับนับ JOB (ไม่ Join details เพื่อไม่ให้นับซ้ำ)
        $jobQuery = StockJob::where('type', 'เบิก')
            ->where('is_code_cust_id', $selectedShop);

        $totalJobs = (clone $jobQuery)->count();
        $processJobs = (clone $jobQuery)->where('job_status', 'processing')->count();
        $completeJobs = (clone $jobQuery)->where('job_status', 'complete')->count();

        // คำนวณยอดเงินสุทธิ เฉพาะ Job ที่ Complete (complete)
        // สูตร: (จำนวน * ราคา) - ส่วนลด
        $totalNetAmount = StockJob::where('stock_jobs.type', 'เบิก')
            ->where('stock_jobs.is_code_cust_id', $selectedShop)
            ->where('stock_jobs.job_status', 'complete')
            ->join('stock_job_details', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
            ->sum(DB::raw('(stock_job_details.sp_qty * stock_job_details.stdprice_per_unit) - ((stock_job_details.sp_qty * stock_job_details.stdprice_per_unit) * (COALESCE(stock_job_details.discount_percent, 0) / 100))'));

        return Inertia::render('Admin/WithDrawReport/WDReportList', [
            'shops' => $shop,
            'selectedShop' => $selectedShop,
            'currentShopName' => $currentShopName,
            'isAdmin'        => true,
            'withdrawals' => $withdrawals,
            'stats' => [
                'total' => $totalJobs,
                'process' => $processJobs,
                'complete' => $completeJobs,
                'totalNet' => $totalNetAmount
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $defaultShop = Auth::user()->is_code_cust_id;
        $selectedShop = $request->query('shop', $defaultShop);
        $search = $request->query('search');
        $status = $request->query('status');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');


        // เพิ่มดูว่าเป็นศูนย์ไหน
        $query = StockJob::query()
            ->select(
                'store_information.shop_name',
                'stock_jobs.job_status',
                'stock_jobs.stock_job_id',
                'stock_jobs.created_at',
                'stock_job_details.sp_code',
                'stock_job_details.sp_name',
                'stock_job_details.sp_unit',
                'stock_job_details.sp_qty',
                'stock_job_details.stdprice_per_unit',
                'stock_job_details.discount_percent'
            )
            ->leftJoin('store_information', 'stock_jobs.is_code_cust_id', '=', 'store_information.is_code_cust_id')
            ->leftJoin('stock_job_details', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
            ->where('stock_jobs.type', 'เบิก')
            ->where('stock_jobs.is_code_cust_id', $selectedShop);

        // Filter Logic (เหมือน Index)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('stock_job_details.sp_code', 'like', "%{$search}%") // แก้เป็น stock_job_details หรือตารางที่ถูกต้อง
                    ->orWhere('stock_job_details.sp_name', 'like', "%{$search}%");
            });
        }
        if ($status) {
            $query->where('stock_jobs.job_status', $status);
        }
        if ($startDate) {
            $query->whereDate('stock_jobs.created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('stock_jobs.created_at', '<=', $endDate);
        }

        // เรียงลำดับ
        $query->orderBy('stock_jobs.created_at', 'desc');

        // ชื่อไฟล์
        $fileName = 'withdraw_report_' . date('Y-m-d_H-i-s') . '.csv';

        // สร้าง Stream Response
        return response()->streamDownload(function () use ($query) {
            $file = fopen('php://output', 'w');

            // **สำคัญ** ใส่ BOM เพื่อให้ Excel อ่านภาษาไทยออก
            fputs($file, "\xEF\xBB\xBF");

            // เขียน Header ของ CSV
            fputcsv($file, [
                'ศูนย์ซ่อม',
                'สถานะ',
                'เลขที่ใบงาน',
                'วันที่',
                'รหัสสินค้า',
                'ชื่อสินค้า',
                'หน่วย',
                'จำนวน',
                'ราคา/หน่วย',
                'ส่วนลด (%)',
                'ยอดสุทธิ (บาท)'
            ]);

            // ดึงข้อมูลแบบ Cursor (ประหยัดแรมสำหรับข้อมูลเยอะๆ)
            foreach ($query->cursor() as $row) {
                // คำนวณยอดสุทธิ
                $qty = floatval($row->sp_qty);
                $price = floatval($row->stdprice_per_unit);
                $discount = floatval($row->discount_percent);
                $netTotal = ($qty * $price) - (($qty * $price) * ($discount / 100));

                fputcsv($file, [
                    $row->shop_name,
                    $row->job_status,
                    $row->stock_job_id,
                    $row->created_at, // หรือ format วันที่ตามต้องการ
                    $row->sp_code,
                    $row->sp_name,
                    $row->sp_unit,
                    $qty,
                    $price,
                    $discount ? $discount . '%' : '-',
                    number_format($netTotal, 2, '.', '') // ไม่เอาลูกน้ำ เพื่อให้เอาไปคำนวณต่อใน Excel ได้ง่าย
                ]);
            }

            fclose($file);
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
