<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
use App\Models\StoreInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SummaryUsedSparePartsController extends Controller
{
    //
    public function index(Request $request)
    {
        $exclude_shops = ['67132'];
        $shops = StoreInformation::whereNotIn('is_code_cust_id', $exclude_shops)
            ->select('is_code_cust_id', 'shop_name')
            ->orderBy('shop_name', 'asc')->get();
        $defaultShop = Auth::user()->is_code_cust_id;
        $selectedShop = $request->query('shop', $defaultShop);
        $search = $request->query('search');
        $filter = $request->query('filter');

        $currentShopName = StoreInformation::where('is_code_cust_id', $selectedShop)
            ->value('shop_name');

        // นับงานซ่อมจาก spare_parts + job_lists
        $jobCounts = SparePart::selectRaw("
            spare_parts.sp_code,
            SUM(CASE WHEN job_lists.status = 'pending' THEN 1 ELSE 0 END) AS process_count,
            SUM(CASE WHEN job_lists.status = 'success' THEN 1 ELSE 0 END) AS complete_count
        ")
            ->join('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
            ->where('job_lists.is_code_key', $selectedShop)
            ->groupBy('spare_parts.sp_code')
            ->get()
            ->keyBy('sp_code');

        // นับงานเบิกจาก stock_job_details + stock_jobs
        $withdrawCounts = StockJobDetail::selectRaw("
            stock_job_details.sp_code,
            SUM(CASE WHEN stock_jobs.job_status = 'processing' THEN 1 ELSE 0 END) AS withdraw_process,
            SUM(CASE WHEN stock_jobs.job_status = 'complete' THEN 1 ELSE 0 END) AS withdraw_complete
        ")
            ->join('stock_jobs', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
            ->where('stock_jobs.is_code_cust_id', $selectedShop)
            ->where('stock_jobs.type', 'เบิก')
            ->groupBy('stock_job_details.sp_code')
            ->get()
            ->keyBy('sp_code');

        $unitSub = DB::table('stock_job_details')
            ->select('sp_code', DB::raw('MAX(sp_unit) as sp_unit'))
            ->groupBy('sp_code');

        $query = StockSparePart::where('stock_spare_parts.is_code_cust_id', $selectedShop)
            ->leftJoinSub($unitSub, 'unit_table', function ($join) {
                $join->on('unit_table.sp_code', '=', 'stock_spare_parts.sp_code');
            })
            ->select(
                'stock_spare_parts.*',
                'unit_table.sp_unit'
            );

        // search sp_code / sp_name
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('stock_spare_parts.sp_code', 'LIKE', "%{$search}%")
                    ->orWhere('stock_spare_parts.sp_name', 'LIKE', "%{$search}%");
            });
        }

        if ($filter) {
            if ($filter === 'repair_complete') {
                $query->whereIn('stock_spare_parts.sp_code', function ($q) use ($selectedShop) {
                    $q->select('spare_parts.sp_code')
                        ->from('spare_parts')
                        ->join('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
                        ->where('job_lists.is_code_key', $selectedShop)
                        ->where('job_lists.status', 'success');
                });
            }

            if ($filter === 'repair_process') {
                $query->whereIn('stock_spare_parts.sp_code', function ($q) use ($selectedShop) {
                    $q->select('spare_parts.sp_code')
                        ->from('spare_parts')
                        ->join('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
                        ->where('job_lists.is_code_key', $selectedShop)
                        ->where('job_lists.status', 'pending');
                });
            }

            if ($filter === 'withdraw_process') {
                $query->whereIn('stock_spare_parts.sp_code', function ($q) use ($selectedShop) {
                    $q->select('stock_job_details.sp_code')
                        ->from('stock_job_details')
                        ->join('stock_jobs', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
                        ->where('stock_jobs.is_code_cust_id', $selectedShop)
                        ->where('stock_jobs.type', 'เบิก')
                        ->where('stock_jobs.job_status', 'processing');
                });
            }

            if ($filter === 'withdraw_complete') {
                $query->whereIn('stock_spare_parts.sp_code', function ($q) use ($selectedShop) {
                    $q->select('stock_job_details.sp_code')
                        ->from('stock_job_details')
                        ->join('stock_jobs', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
                        ->where('stock_jobs.is_code_cust_id', $selectedShop)
                        ->where('stock_jobs.type', 'เบิก')
                        ->where('stock_jobs.job_status', 'complete');
                });
            }
        }

        $spareParts = $query
            ->orderBy('stock_spare_parts.sp_code', 'asc')
            ->paginate(20)
            ->withQueryString()
            // ตรงนี้ต้อง use ทั้ง $jobCounts และ $withdrawCounts
            ->through(function ($sp) use ($jobCounts, $withdrawCounts) {
                $process  = $jobCounts[$sp->sp_code]->process_count ?? 0;
                $complete = $jobCounts[$sp->sp_code]->complete_count ?? 0;

                $wd_process  = $withdrawCounts[$sp->sp_code]->withdraw_process ?? 0;
                $wd_complete = $withdrawCounts[$sp->sp_code]->withdraw_complete ?? 0;

                return [
                    'id' => $sp->id,
                    'sp_code' => $sp->sp_code,
                    'sp_name' => $sp->sp_name,
                    'qty_sp' => $sp->qty_sp,
                    'sp_unit' => $sp->sp_unit,
                    'sku_code' => $sp->sku_code,

                    'process_count' => $process,
                    'complete_count' => $complete,

                    'withdraw_process' => $wd_process,
                    'withdraw_complete' => $wd_complete,

                    'total_used' => $process + $complete + $wd_process + $wd_complete,

                    'detail_url' => route('admin.summary-spare-parts.detail', [
                        'sp_code' => $sp->sp_code,
                        'shop'    => $sp->is_code_cust_id,
                    ]),
                ];
            });

        // สรุปยอดหน้า Card
        $totalWithdrawProcess  = $withdrawCounts->sum('withdraw_process');
        $totalWithdrawComplete = $withdrawCounts->sum('withdraw_complete');

        $totalProcess  = $jobCounts->sum('process_count');
        $totalComplete = $jobCounts->sum('complete_count');
        $totalAllRepair = $totalProcess + $totalComplete;
        $totalAllWithdraw = $totalWithdrawProcess + $totalWithdrawComplete;
        $totalAll = $totalProcess + $totalComplete + $totalWithdrawProcess + $totalWithdrawComplete;
        $totalList = $spareParts->total();

        return Inertia::render('Admin/SummaryUsedSP/SumUsedSpList', [
            'shops' => $shops,
            'selectedShop' => $selectedShop,
            'currentShopName' => $currentShopName,
            'spareParts'      => $spareParts,
            'isAdmin' => true,

            'summary' => [
                'total_list'             => $totalList,
                'total_process'          => $totalProcess,
                'total_complete'         => $totalComplete,
                'total_withdraw_process' => $totalWithdrawProcess,
                'total_withdraw_complete' => $totalWithdrawComplete,
                'total_all_repair'        => $totalAllRepair,
                'total_all_withdraw'      => $totalAllWithdraw,
                'total_all'               => $totalAll,
            ],
        ]);
    }

    public function detail(Request $request, $sp_code, $is_code_key)
    {
        $repair = SparePart::query()
            ->join('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'spare_parts.job_id')
            ->where('spare_parts.sp_code', $sp_code)
            ->where('job_lists.is_code_key', $is_code_key)
            ->select(
                'spare_parts.qty',
                'spare_parts.updated_at',
                'job_lists.job_id as ref_no',
                'job_lists.status',
                'job_lists.created_at as date',
                'customer_in_jobs.name as customer_name',
                'job_lists.close_job_by as updated_by',
                DB::raw("'repair' as type")
            )
            ->orderBy('spare_parts.updated_at', 'desc')
            ->get()
            ->toBase();

        $withdraw = DB::table('stock_job_details')
            ->join('stock_jobs', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
            ->where('stock_job_details.sp_code', $sp_code)
            ->where('stock_jobs.is_code_cust_id', $is_code_key)
            ->where('stock_jobs.type', 'เบิก')
            ->select(
                'stock_job_details.sp_qty as qty',
                'stock_job_details.updated_at',
                'stock_jobs.stock_job_id as ref_no',
                'stock_jobs.job_status as status',
                'stock_jobs.created_at as date',
                DB::raw("'-' as customer_name"),
                'stock_jobs.user_code_key as updated_by',
                DB::raw("'withdraw' as type")
            )
            ->orderBy('stock_job_details.updated_at', 'desc')
            ->get()
            ->toBase();

        // รวม 2 ส่วนเข้าด้วยกัน
        $withdraw = collect($withdraw);
        $merged = $repair->merge($withdraw)->sortByDesc('updated_at')->values();

        return response()->json([
            'details' => $merged,
            'sp_code' => $sp_code,
            'is_code_key' => $is_code_key,
        ]);
    }

    public function exportExcel(Request $request)
    {
        $selectedShop = $request->query('shop');
        $search = $request->query('search');

        // ดึงรายการอะไหล่ในร้าน
        $spareParts = StockSparePart::where('stock_spare_parts.is_code_cust_id', $selectedShop)
            ->select(
                'stock_spare_parts.sp_code',
                'stock_spare_parts.sp_name',
                DB::raw("(SELECT sp_unit 
                      FROM stock_job_details 
                      WHERE stock_job_details.sp_code = stock_spare_parts.sp_code 
                      LIMIT 1) as sp_unit")
            )
            ->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('stock_spare_parts.sp_code', 'LIKE', "%$search%")
                        ->orWhere('stock_spare_parts.sp_name', 'LIKE', "%$search%");
                });
            })
            ->orderBy('stock_spare_parts.sp_code', 'asc')
            ->get();

        // ดึงจำนวนงานซ่อม (process, complete)
        $jobCounts = SparePart::selectRaw("
            spare_parts.sp_code,
            SUM(CASE WHEN job_lists.status = 'pending' THEN 1 ELSE 0 END) AS process_count,
            SUM(CASE WHEN job_lists.status = 'success' THEN 1 ELSE 0 END) AS complete_count
        ")
            ->join('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
            ->where('job_lists.is_code_key', $selectedShop)
            ->groupBy('spare_parts.sp_code')
            ->get()
            ->keyBy('sp_code');

        // ดึงจำนวนงานเบิก (process, complete)
        $withdrawCounts = StockJobDetail::selectRaw("
            stock_job_details.sp_code,
            SUM(CASE WHEN stock_jobs.job_status = 'processing' THEN 1 ELSE 0 END) AS withdraw_process,
            SUM(CASE WHEN stock_jobs.job_status = 'complete' THEN 1 ELSE 0 END) AS withdraw_complete
        ")
            ->join('stock_jobs', 'stock_jobs.stock_job_id', '=', 'stock_job_details.stock_job_id')
            ->where('stock_jobs.is_code_cust_id', $selectedShop)
            ->where('stock_jobs.type', 'เบิก')
            ->groupBy('stock_job_details.sp_code')
            ->get()
            ->keyBy('sp_code');

        // เตรียม Excel
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $sheet->setCellValue('A1', 'รหัสอะไหล่');
        $sheet->setCellValue('B1', 'ชื่ออะไหล่');
        $sheet->setCellValue('C1', 'หน่วย');
        $sheet->setCellValue('D1', 'งานซ่อมสถานะกำลังดำเนินการ (process)');
        $sheet->setCellValue('E1', 'งานซ่อมสถานะปิดงานซ่อมแล้ว (complete)');
        $sheet->setCellValue('F1', 'งานเบิกสถานะกำลังดำเนินการ (process)');
        $sheet->setCellValue('G1', 'งานเบิกสถานะปิดงานเบิกแล้ว (complete)');
        $sheet->setCellValue('H1', 'รวม');

        // Body
        $row = 2;
        foreach ($spareParts as $sp) {

            $process  = $jobCounts[$sp->sp_code]->process_count ?? 0;
            $complete = $jobCounts[$sp->sp_code]->complete_count ?? 0;

            $wd_process  = $withdrawCounts[$sp->sp_code]->withdraw_process ?? 0;
            $wd_complete = $withdrawCounts[$sp->sp_code]->withdraw_complete ?? 0;

            $total = $process + $complete + $wd_process + $wd_complete;

            $sheet->setCellValue("A{$row}", $sp->sp_code);
            $sheet->setCellValue("B{$row}", $sp->sp_name);
            $sheet->setCellValue("C{$row}", $sp->sp_unit);
            $sheet->setCellValue("D{$row}", $process);
            $sheet->setCellValue("E{$row}", $complete);
            $sheet->setCellValue("F{$row}", $wd_process);
            $sheet->setCellValue("G{$row}", $wd_complete);
            $sheet->setCellValue("H{$row}", $total);

            $row++;
        }

        $fileName = "summary_spare_parts_" . date('Ymd_His') . ".xlsx";
        $writer = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            "Content-Type" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition" => "attachment; filename=\"{$fileName}\"",
        ]);
    }
}
