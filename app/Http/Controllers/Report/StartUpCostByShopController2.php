<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StartUpCost;
use App\Models\StoreInformation;
use App\Models\User;
use Carbon\Carbon;
// use App\Models\User; // ไม่ได้ใช้เอาออกได้
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class StartUpCostByShopController2 extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'acc') {
            return redirect()->route('report.start-up-cost-shop2.index');
        }

        $selected_shop = $request->query('shop');
        $shop = $selected_shop ?? Auth::user()->is_code_cust_id;

        // รับค่าวันที่จาก Request
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');
        $status = $request->query('status');

        // รายชื่อร้านทั้งหมด
        $exclude_shops = ['67132'];
        $shops = StoreInformation::whereNotIn('is_code_cust_id', $exclude_shops)
            ->select('is_code_cust_id', 'shop_name')
            ->get();

        $current_shop_name = StoreInformation::where('is_code_cust_id', $shop)
            ->value('shop_name');

        $query = JobList::query()
            ->where('is_code_key', $shop)
            ->where('status', 'success')
            ->where('warranty', true)
            ->where('stuc_status', 'Y')
            ->whereNull('stuc_doc_no');

        // เพิ่มเงื่อนไขกรองวันที่ ถ้ามีการส่งมา
        if ($start_date && $end_date) {
            try {
                $start = Carbon::createFromFormat('Y-m', $start_date)->startOfMonth()->format('Y-m-d H:i:s');
                $end = Carbon::createFromFormat('Y-m', $end_date)->endOfMonth()->format('Y-m-d H:i:s');
                $query->whereBetween('close_job_at', [$start, $end]);
            } catch (\Exception $e) {
            }
        }

        // Clone query สำหรับ Paginate
        $jobs = (clone $query)->orderBy('created_at', 'desc')->paginate(15);

        // Clone query สำหรับหาผลรวม (Total)
        $jobs_all = (clone $query)->orderBy('created_at', 'desc')->get();

        foreach ($jobs as $key => $job) {
            $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
            $jobs[$key]['start_up_cost'] = $start_up_cost ? (float) $start_up_cost->startup_cost : 0;
        }

        $total_start_up_cost = 0;
        foreach ($jobs_all as $job) {
            $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
            $total_start_up_cost += $start_up_cost ? (float) $start_up_cost->startup_cost : 0;
        }

        return Inertia::render(
            'Reports/StartUpCostByShop/SucBsList2',
            [
                'jobs' => $jobs,
                'total_start_up_cost' => $total_start_up_cost,
                'shops' => $shops,
                'selected_shop' => $shop,
                'current_shop_name' => $current_shop_name,
                'is_admin' => Auth::user()->role === 'admin',
                'is_acc' => Auth::user()->role === 'acc',
                'filters' => [
                    'start_date' => $start_date,
                    'end_date' => $end_date,
                ]
            ]
        );
    }

    public function exportExcel(Request $request)
    {
        $shop = $request->query('shop');
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');

        $query = JobList::query()
            ->where('is_code_key', $shop)
            ->where('status', 'success')
            ->where('warranty', true)
            ->where('stuc_status', 'Y');

        // เพิ่มเงื่อนไขกรองวันที่สำหรับการ Export
        if ($start_date && $end_date) {
            try {
                $start = Carbon::createFromFormat('Y-m', $start_date)->startOfMonth()->format('Y-m-d H:i:s');
                $end = Carbon::createFromFormat('Y-m', $end_date)->endOfMonth()->format('Y-m-d H:i:s');
                $query->whereBetween('close_job_at', [$start, $end]);
            } catch (\Exception $e) {
            }
        }

        $jobs = $query->orderBy('created_at', 'desc')->get();
        $exportData = [];
        $exportData[] = [
            'ลำดับ',
            'Job ID',
            'PID',
            'ชื่อสินค้า',
            'Serial',
            'ค่าเปิดเครื่อง (บาท)',
            'สถานะ',
            'วันที่เปิดเครื่อง',
            'วันที่อัพเดท',
        ];

        foreach ($jobs as $index => $job) {
            $start_up_cost = StartUpCost::query()
                ->where('sku_code', $job->pid)
                ->value('startup_cost') ?? 0;

            $exportData[] = [
                $index + 1,
                $job->job_id,
                $job->pid,
                $job->p_name,
                $job->serial_id,
                $start_up_cost,
                $job->stuc_status,
                $job->created_at,
                $job->updated_at
            ];
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($exportData as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                if ($colIndex == 2 || $colIndex == 4) { // PID (index 2) and Serial (index 4)
                    $sheet->setCellValueExplicit($colLetter . ($rowIndex + 1), (string)$value, DataType::TYPE_STRING);
                } else {
                    $sheet->setCellValue($colLetter . ($rowIndex + 1), $value);
                }
            }
        }

        $shopName = StoreInformation::where('is_code_cust_id', $shop)->value('shop_name') ?? 'Shop';
        $cleanShopName = preg_replace('/[^A-Za-z0-9ก-๙]/u', '_', $shopName);

        // เพิ่มวันที่ในชื่อไฟล์
        $dateRangeStr = ($start_date && $end_date) ? "_{$start_date}_to_{$end_date}" : "";
        $fileName = 'StartUpCost_' . $cleanShopName . $dateRangeStr . '_' . date('Ymd_His') . '.xlsx';

        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path($fileName);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }

    public function createDoc(Request $request)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'acc') {
            return redirect()->route('report.start-up-cost-shop2.index');
        }

        $ids = $request->query('ids');
        $start_date = $request->query('start_date');
        if ($start_date) {
            $ym = date('Ym', strtotime($start_date));
        } else {
            $ym = date('Ym');
        }
        if (!$ids) {
            return redirect()->back()->with('error', 'กรุณาเลือกรายการก่อนสร้างเอกสาร');
        }

        $idArray = explode(',', $ids);

        // ดึงข้อมูล Job ตาม ID ที่ส่งมา
        $jobs = JobList::whereIn('job_id', $idArray)
            ->where('status', 'success')
            ->get();

        // คำนวณยอดรวม
        $totalCost = 0;
        foreach ($jobs as $job) {
            $start_up_cost = StartUpCost::where('sku_code', $job->pid)->value('startup_cost') ?? 0;
            $job->start_up_cost = $start_up_cost;
            $totalCost += $start_up_cost;
        }

        $prefix = 'CT-' . $ym . '-';

        // เช็คเลขที่สุดท้ายจากตาราง job_lists โดยตรง
        $lastDoc = DB::table('job_lists')
            ->where('stuc_doc_no', 'like', $prefix . '%')
            ->orderBy('stuc_doc_no', 'desc') // เรียงจากมากไปน้อย
            ->first();

        if ($lastDoc) {
            // ตัดเอาเลข 4 ตัวท้ายมาบวก 1
            // เช่น CT-202312-0001 -> ตัดเอา 0001 มาบวก 1
            $lastNumber = intval(substr($lastDoc->stuc_doc_no, -4));
            $nextNumber = $lastNumber + 1;
        } else {
            // ถ้ายังไม่มีของเดือนนี้ เริ่มที่ 1
            $nextNumber = 1;
        }

        $previewDocNo = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        // ---------------------------------------------

        return Inertia::render('Reports/StartUpCostByShop/CreateDoc', [
            'selected_jobs' => $jobs,
            'total_cost' => $totalCost,
            'preview_doc_no' => $previewDocNo,
            'start_date' => $start_date,
        ]);
    }

    public function storeDoc(Request $request)
    {
        $job_ids = $request->input('job_ids');
        $start_date = $request->input('start_date');
        if ($start_date) {
            $ym = date('Ym', strtotime($start_date));
        } else {
            $ym = date('Ym');
        }
        if (empty($job_ids)) {
            return redirect()->back()->with('error', 'ไม่พบรายการที่เลือก');
        }

        try {
            DB::beginTransaction();
            $prefix = 'CT-' . $ym . '-';
            $lastDoc = DB::table('job_lists')
                ->where('stuc_doc_no', 'like', $prefix . '%')
                ->orderBy('stuc_doc_no', 'desc')
                ->lockForUpdate()
                ->first();

            if ($lastDoc) {
                $lastNumber = intval(substr($lastDoc->stuc_doc_no, -4));
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }

            $docNo = $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);

            JobList::whereIn('job_id', $job_ids)
                ->update([
                    'stuc_doc_no' => $docNo,
                    'created_ct_doc_by' => Auth::user()->user_code,
                    'created_ct_doc_at' => now(),
                    'updated_ct_doc_at' => now(),
                ]);

            DB::commit();

            return redirect()->route('report.start-up-cost-shop.doc-list')
                ->with('success', "สร้างเอกสารเลขที่ $docNo เรียบร้อยแล้ว");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาด: ' . $e->getMessage());
        }
    }

    public function docList(Request $request)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'acc') {
            return redirect()->route('report.start-up-cost-shop2.index');
        }

        $selected_shop = $request->query('shop');
        $shop = $selected_shop ?? Auth::user()->is_code_cust_id;

        $exclude_shops = ['67132'];
        $shops = StoreInformation::whereNotIn('is_code_cust_id', $exclude_shops)
            ->select('is_code_cust_id', 'shop_name')
            ->get();

        $current_shop_name = StoreInformation::where('is_code_cust_id', $shop)->value('shop_name');
        $userMap = User::pluck('name', 'user_code')->toArray();

        $docs = JobList::query()
            ->where('is_code_key', $shop)
            ->whereNotNull('stuc_doc_no')
            ->select(
                'stuc_doc_no',
                'stuc_status',
                'cn_doc',
                DB::raw('MAX(created_ct_doc_at) as created_at'),
                DB::raw('MAX(created_ct_doc_by) as created_by'),
                DB::raw('COUNT(*) as job_count')
            )
            ->groupBy('stuc_doc_no', 'stuc_status', 'cn_doc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // คำนวณยอดเงินรวมของแต่ละเอกสาร (ต้องวนลูปเพราะราคาอยู่อีกตาราง)
        // หรือถ้าอยากเร็วอาจต้องใช้ Join แต่แบบนี้เข้าใจง่ายกว่าสำหรับเคสนี้
        foreach ($docs as $doc) {
            $doc->created_by_name = $userMap[$doc->created_by] ?? '-';
            $jobsInDoc = JobList::where('stuc_doc_no', $doc->stuc_doc_no)->get(['pid']);
            $total = 0;
            foreach ($jobsInDoc as $job) {
                $cost = StartUpCost::where('sku_code', $job->pid)->value('startup_cost') ?? 0;
                $total += $cost;
            }
            $doc->total_amount = $total;
        }

        return Inertia::render('Reports/StartUpCostByShop/DocList', [
            'docs' => $docs,
            'shops' => $shops,
            'selected_shop' => $shop,
            'current_shop_name' => $current_shop_name,
            'is_admin' => Auth::user()->role === 'admin',
            'is_acc' => Auth::user()->role === 'acc',
        ]);
    }

    // public function showDoc(Request $request, $doc_no)
    // {
    //     $shop = Auth::user()->is_code_cust_id;
    //     if (Auth::user()->role === 'admin' || Auth::user()->role === 'acc') {
    //         // อาจจะต้อง query หา shop_id จาก doc_no ก่อนถ้าต้องการ strict check
    //     }
    //     $userMap = User::pluck('name', 'user_code')->toArray();

    //     $jobs = JobList::query()
    //         ->where('stuc_doc_no', $doc_no)
    //         ->get();

    //     if ($jobs->isEmpty()) {
    //         return redirect()->back()->with('error', 'ไม่พบข้อมูลเอกสาร');
    //     }

    //     $totalCost = 0;
    //     foreach ($jobs as $job) {
    //         // $job->created_by_name = $userMap[$job->created_by] ?? '-';
    //         $start_up_cost = StartUpCost::where('sku_code', $job->pid)->value('startup_cost') ?? 0;
    //         $job->start_up_cost = $start_up_cost;
    //         $totalCost += $start_up_cost;
    //     }

    //     $shopId = $jobs->first()->is_code_key;
    //     $current_shop_name = StoreInformation::where('is_code_cust_id', $shopId)->value('shop_name');
    //     $created_by_name = $userMap[$jobs->first()->created_by] ?? '-';

    //     return Inertia::render('Reports/StartUpCostByShop/DocDetail', [
    //         'doc_no' => $doc_no,
    //         'jobs' => $jobs,
    //         'total_cost' => $totalCost,
    //         'current_shop_name' => $current_shop_name,
    //         'created_by_name' => $created_by_name,
    //         'created_at' => $jobs->first()->updated_at,
    //     ]);
    // }
    public function showDoc(Request $request, $doc_no)
    {
        // 1. ตรวจสอบสิทธิ์ (Security Check)
        // $shop = Auth::user()->is_code_cust_id;
        // if (Auth::user()->role === 'admin' || Auth::user()->role === 'acc') {
        //     // Logic สำหรับ Admin ดูข้ามร้านได้
        // }
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'acc') {
            return redirect()->route('report.start-up-cost-shop2.index');
        }

        $jobs = JobList::query()
            ->where('stuc_doc_no', $doc_no)
            ->get();

        if ($jobs->isEmpty()) {
            return redirect()->back()->with('error', 'ไม่พบข้อมูลเอกสาร');
        }

        $totalCost = 0;
        foreach ($jobs as $job) {
            $start_up_cost = StartUpCost::where('sku_code', $job->pid)->value('startup_cost') ?? 0;
            $job->start_up_cost = $start_up_cost;
            $totalCost += $start_up_cost;
        }
        $firstJob = $jobs->first();
        $current_shop_name = StoreInformation::where('is_code_cust_id', $firstJob->is_code_key)
            ->value('shop_name');
        $userCode = $firstJob->created_ct_doc_by ?? $firstJob->user_code;
        $created_by_name = User::where('user_code', $userCode)->value('name') ?? '-';

        $docDate = $jobs->max('created_ct_doc_at');
        $docStatus = $firstJob->stuc_status;
        return Inertia::render('Reports/StartUpCostByShop/DocDetail', [
            'doc_no' => $doc_no,
            'jobs' => $jobs,
            'doc_status' => $docStatus,
            'total_cost' => $totalCost,
            'current_shop_name' => $current_shop_name,
            'created_by_name' => $created_by_name,
            'created_at' => $docDate,
        ]);
    }
}
