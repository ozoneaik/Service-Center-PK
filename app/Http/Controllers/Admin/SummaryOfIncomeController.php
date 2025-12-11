<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\SparePart;
use App\Models\StoreInformation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SummaryOfIncomeController extends Controller
{
    //
    public function index(Request $request)
    {
        $exclude_shops = ['67132'];
        $shops = StoreInformation::whereNotIn('is_code_cust_id', $exclude_shops)
            ->select('is_code_cust_id', 'shop_name')
            ->orderBy('shop_name', 'asc')->get();
        // $shops = StoreInformation::orderBy('shop_name', 'asc')->get();
        $defaultShop = Auth::user()->is_code_cust_id;
        $selectedShop = $request->query('shop', $defaultShop);
        $currentShopName = StoreInformation::where('is_code_cust_id', $selectedShop)
            ->value('shop_name');
        $selectedStatus = $request->query('status', '');

        $startDate = null;
        $endDate = null;

        if ($request->has('start_date') || $request->has('end_date')) {
            // ถ้ามีการส่งมา แต่เป็นค่าว่าง = แสดงทั้งหมด
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $startDate = Carbon::parse($request->start_date);
                $endDate = Carbon::parse($request->end_date);
            }
            // ถ้าส่งมาแต่ว่างเปล่า = null (แสดงทั้งหมด)
        } else {
            // ถ้าไม่มีการส่ง query parameters มาเลย (ครั้งแรก) = ใช้ default เป็นเดือนปัจจุบัน
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
        }

        $summary = JobList::query()
            ->where('job_lists.is_code_key', $selectedShop)
            ->when($selectedStatus !== '', fn($q) => $q->where('job_lists.status', $selectedStatus))
            ->when($startDate, fn($q) => $q->whereDate('job_lists.created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('job_lists.created_at', '<=', $endDate))
            ->leftJoin('spare_parts', 'spare_parts.job_id', '=', 'job_lists.job_id')
            ->leftJoin('start_up_costs', 'start_up_costs.sku_code', '=', 'job_lists.pid')
            ->select(
                DB::raw('COUNT(DISTINCT job_lists.job_id) as total_jobs'),
                // DB::raw('SUM(COALESCE(spare_parts.price_multiple_gp, 0)) as total_sale_price'),
                DB::raw("SUM(CASE WHEN spare_parts.sp_code != 'SV001' THEN COALESCE(spare_parts.price_multiple_gp, 0) ELSE 0 END) as total_sale_price"),
                DB::raw("
                    SUM(
                        CASE 
                            WHEN spare_parts.sp_code = 'SV001'
                            THEN COALESCE(spare_parts.price_multiple_gp, 0)
                            ELSE 0 
                        END
                    ) AS total_service_fee
                "),
                DB::raw("
                    SUM(
                        CASE 
                            WHEN job_lists.warranty = true AND job_lists.status = 'success'
                            THEN COALESCE(start_up_costs.startup_cost, 0)
                            ELSE 0
                        END
                    ) AS total_startup_cost
                ")
            )
            ->first();
        $jobs = JobList::query()
            ->where('is_code_key', $selectedShop)
            ->when($selectedStatus !== '', function ($query) use ($selectedStatus) {
                $query->where('job_lists.status', $selectedStatus);
            })
            ->when($startDate, fn($q) => $q->whereDate('job_lists.created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('job_lists.created_at', '<=', $endDate))
            ->leftJoin('spare_parts', 'spare_parts.job_id', '=', 'job_lists.job_id')
            ->leftJoin('start_up_costs', 'start_up_costs.sku_code', '=', 'job_lists.pid')
            ->select(
                'job_lists.job_id',
                'job_lists.status',
                'job_lists.created_at',
                'job_lists.warranty',
                'job_lists.pid',
                // DB::raw('COUNT(spare_parts.id) as spare_count'),
                DB::raw("COUNT(CASE WHEN spare_parts.sp_code != 'SV001' THEN spare_parts.id END) as spare_count"),
                // DB::raw('SUM(COALESCE(spare_parts.price_multiple_gp,0)) as total_sale_price'),
                DB::raw("SUM(CASE WHEN spare_parts.sp_code != 'SV001' THEN COALESCE(spare_parts.price_multiple_gp, 0) ELSE 0 END) as total_sale_price"),
                DB::raw('SUM(COALESCE(spare_parts.stdprice_per_unit,0)) as total_std_price'),
                DB::raw('SUM(COALESCE(spare_parts.price_per_unit,0)) as total_price_per_unit'),
                DB::raw("
            SUM(
                CASE 
                    WHEN spare_parts.sp_code = 'SV001' 
                    THEN COALESCE(spare_parts.price_multiple_gp, 0)
                    ELSE 0 
                END
            ) AS service_fee
        "),
                DB::raw("
            CASE 
                WHEN job_lists.warranty = true AND job_lists.status = 'success'
                THEN COALESCE(start_up_costs.startup_cost, 0)
                ELSE 0
            END AS startup_cost
        ")
            )
            ->groupBy(
                'job_lists.job_id',
                'job_lists.status',
                'job_lists.created_at',
                'job_lists.warranty',
                'start_up_costs.startup_cost',
                'job_lists.pid'
            )
            ->orderBy('job_lists.created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
        return inertia('Admin/SummaryOfIncome/SoiList', [
            'shops' => $shops,
            'selectedShop' => $selectedShop,
            'currentShopName' => $currentShopName,
            'jobs' => $jobs,
            'isAdmin' => true,
            'selectedStatus' => $selectedStatus,
            'summary' => $summary,
            'start_date' => $startDate?->format('Y-m-d'),
            'end_date' => $endDate?->format('Y-m-d'),
        ]);
    }

    public function detail(Request $request, $job_id, $is_code_key)
    {
        $details = SparePart::query()->join('job_lists', 'job_lists.job_id', '=', 'spare_parts.job_id')
            ->leftjoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'spare_parts.job_id')
            ->where('spare_parts.job_id', $job_id)
            ->where('job_lists.is_code_key', $is_code_key)
            ->where('spare_parts.sp_code', '!=', 'SV001')
            ->select(
                'spare_parts.qty',
                'spare_parts.updated_at',
                'job_lists.pid',
                'spare_parts.sp_code',
                'spare_parts.sp_name',
                'spare_parts.price_multiple_gp',
                'spare_parts.stdprice_per_unit',
                'spare_parts.price_multiple_gp',
                'job_lists.job_id as ref_no',
                'job_lists.status',
                'job_lists.created_at as date',
                'customer_in_jobs.name as customer_name',
                'job_lists.close_job_by as updated_by',
                DB::raw("'repair' as type")
            )->orderBy('spare_parts.updated_at', 'desc')->get()->toBase();

        return response()->json([
            'details' => $details,
            'is_code_key' => $is_code_key,
        ]);
    }

    public function exportAll(Request $request, $is_code_key)
    {
        $selectedStatus = $request->query('status', '');
        $startDate = null;
        $endDate = null;

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
        }

        // 1. สร้าง Subquery เพื่อคำนวณค่ารวมต่อ Job ID (Service Fee, Startup Cost)
        $jobSummaryQuery = JobList::query()
            ->where('job_lists.is_code_key', $is_code_key)
            ->when(
                $selectedStatus !== '',
                fn($q) => $q->where('job_lists.status', $selectedStatus),
                fn($q) => $q->whereIn('job_lists.status', ['success', 'canceled'])
            )
            ->when($startDate, fn($q) => $q->whereDate('job_lists.created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('job_lists.created_at', '<=', $endDate))
            ->leftJoin('spare_parts', 'spare_parts.job_id', '=', 'job_lists.job_id')
            ->leftJoin('start_up_costs', 'start_up_costs.sku_code', '=', 'job_lists.pid')
            ->select(
                'job_lists.job_id',
                DB::raw("
                    SUM(
                        CASE 
                            WHEN spare_parts.sp_code = 'SV001'
                            THEN COALESCE(spare_parts.price_multiple_gp, 0)
                            ELSE 0 
                        END
                    ) AS total_service_fee
                "),
                // ใช้ MAX/MIN กับ CASE statement เพื่อให้สามารถรวมกลุ่มได้
                DB::raw("
                    MAX(
                        CASE 
                            WHEN job_lists.warranty = true AND job_lists.status = 'success'
                            THEN COALESCE(start_up_costs.startup_cost, 0)
                            ELSE 0
                        END
                    ) AS startup_cost
                ")
            )
            ->groupBy('job_lists.job_id');

        $jobs = JobList::query()
            ->where('job_lists.is_code_key', $is_code_key)
            ->when(
                $selectedStatus !== '',
                fn($q) => $q->where('job_lists.status', $selectedStatus),
                fn($q) => $q->whereIn('job_lists.status', ['success', 'canceled'])
            )
            ->when($startDate, fn($q) => $q->whereDate('job_lists.created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('job_lists.created_at', '<=', $endDate))
            ->leftJoin('spare_parts', 'spare_parts.job_id', '=', 'job_lists.job_id')
            // Join กับตารางลูกค้า
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            // Join กับ Job Summary Subquery
            ->leftJoinSub($jobSummaryQuery, 'job_summary', function ($join) {
                $join->on('job_lists.job_id', '=', 'job_summary.job_id');
            })
            ->select(
                'job_lists.job_id',
                'job_lists.created_at as job_date',
                'job_lists.status',
                'job_lists.warranty',
                'job_lists.pid',
                'customer_in_jobs.name as customer_name',
                'spare_parts.sp_code',
                'spare_parts.sp_name',
                'spare_parts.price_multiple_gp', // ราคาขายของอะไหล่/บริการ
                'spare_parts.qty',
                'spare_parts.updated_at',
                'job_lists.close_job_by as updated_by',
                'job_summary.total_service_fee', // ดึงค่ารวมจาก Subquery
                'job_summary.startup_cost'       // ดึงค่าตอบแทนจาก Subquery
            )
            ->orderBy('job_lists.created_at', 'desc')
            ->orderBy('job_lists.job_id', 'asc') // จัดเรียงตาม Job ID เพื่อให้ Grouping ใน PHP ง่ายขึ้น
            ->get()
            ->groupBy('job_id'); // จัดกลุ่มด้วย PHP collection เพื่อประมวลผลการ Export

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $headers = [
            'วันที่',
            'คำอธิบาย (job_id)',
            'สถานะงาน',
            'สถานะการรับประกัน',
            'รหัสสินค้า',
            'รหัสอะไหล่',
            'รายการอะไหล่',
            'ราคาขาย',
            'ชื่อลูกค้า',
            'จำนวน',
            'ค่าบริการ (SV001 รวม)',
            'ค่าตอบแทน',
            'อัพเดทเมื่อ',
            'ผู้ทำรายการ'
        ];

        $sheet->fromArray($headers, null, 'A1');
        $sheet->getStyle('A1:N1')->getFont()->setBold(true);
        $rowNumber = 2;

        foreach ($jobs as $jobId => $spares) {
            $firstRow = true;

            // ดึงค่ารวมจาก JobSummary ที่ Attach มากับแถวแรก
            $jobTotalServiceFee = $spares->first()->total_service_fee ?? 0;
            $jobStartupCost = $spares->first()->startup_cost ?? 0;

            foreach ($spares as $item) {

                // Helper สำหรับแปลสถานะ (เหมือนใน Frontend)
                $status_thai = match ($item->status) {
                    'pending' => 'กำลังดำเนินการซ่อม',
                    'success' => 'ปิดการซ่อมแล้ว',
                    'canceled' => 'ยกเลิกงานซ่อม',
                    'send' => 'ส่งไปยังศูนย์ซ่อม',
                    default => $item->status,
                };

                // ตรวจสอบว่ารายการอะไหล่นี้คือค่าบริการหรือไม่
                $is_service_fee_item = $item->sp_code === 'SV001';
                $date = $firstRow && $item->job_date
                    ? Carbon::parse($item->job_date)->format('d/m/Y')
                    : '';

                // $sheet->setCellValue('A' . $rowNumber, $firstRow ? optional($item->job_date)->format('d/m/Y') : '');
                $sheet->setCellValue('A' . $rowNumber, $date);
                $sheet->setCellValue('B' . $rowNumber, $item->job_id ?? '');
                $sheet->setCellValue('C' . $rowNumber, $status_thai ?? '');
                $sheet->setCellValue('D' . $rowNumber, ($item->warranty ? 'Yes' : 'No') ?? '');
                $sheet->setCellValue('E' . $rowNumber, $item->pid ?? '');

                // รายละเอียดอะไหล่/บริการ
                $sheet->setCellValue('F' . $rowNumber, $item->sp_code);
                $sheet->setCellValue('G' . $rowNumber, $item->sp_name);
                $sheet->setCellValue('H' . $rowNumber, (float) $item->price_multiple_gp); // ราคาขายของอะไหล่/บริการ

                $sheet->setCellValue('I' . $rowNumber, $item->customer_name ?? '');
                $sheet->setCellValue('J' . $rowNumber, (int) $item->qty);

                // แสดงค่าบริการรวม (total_service_fee) และค่าตอบแทนรวม (startup_cost) เฉพาะแถวแรกของ Job ID
                $sheet->setCellValue('K' . $rowNumber, $firstRow ? (float) $jobTotalServiceFee : '');
                $sheet->setCellValue('L' . $rowNumber, $firstRow ? (float) $jobStartupCost : '');

                $sheet->setCellValue('M' . $rowNumber, optional($item->updated_at)->format('d/m/Y H:i'));
                $sheet->setCellValue('N' . $rowNumber, $item->updated_by);

                // ตั้งค่ารูปแบบตัวเลข
                $sheet->getStyle('H' . $rowNumber)->getNumberFormat()->setFormatCode('#,##0.00');
                $sheet->getStyle('K' . $rowNumber)->getNumberFormat()->setFormatCode('#,##0.00');
                $sheet->getStyle('L' . $rowNumber)->getNumberFormat()->setFormatCode('#,##0.00');

                $lastRowOfCurrentJob = $rowNumber;
                $rowNumber++;
                $firstRow = false;
            }

            //เพิ่มเส้นประคั่นระหว่าง Job (เหมือนเดิม)
            $sheet->getStyle("A{$lastRowOfCurrentJob}:N{$lastRowOfCurrentJob}")
                ->applyFromArray([
                    'borders' => [
                        'bottom' => [ // ใช้ 'bottom' แทน 'top' เพื่อไม่ให้ต้องเว้นบรรทัด
                            'borderStyle' => Border::BORDER_DOTTED,
                        ]
                    ]
                ]);
        }

        foreach (range('A', 'N') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $storeName = StoreInformation::where('is_code_cust_id', $is_code_key)->value('shop_name') ?? 'Unknown';

        $dateRange = '';
        if ($startDate && $endDate) {
            $dateRange = $startDate->format('Ymd') . '_to_' . $endDate->format('Ymd');
        } else {
            $dateRange = 'ข้อมูลทั้งหมด';
        }

        $fileName = 'รายสรุปยอดรายรับ ศูนย์ซ่อม ร้าน_' . $storeName . '_' . $dateRange . '.xlsx';

        $response = new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment;filename="' . $fileName . '"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }
}
