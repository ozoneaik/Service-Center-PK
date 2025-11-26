<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StoreInformation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class SummaryCenterRepairsController extends Controller
{
    //
    public function index(Request $request)
    {
        // รายชื่อร้านทั้งหมด (แต่ user จะเลือกไม่ได้)
        $shops = StoreInformation::orderBy('shop_name', 'asc')->get();

        $selectedShop = Auth::user()->is_code_cust_id;

        $currentShopName = StoreInformation::where('is_code_cust_id', $selectedShop)
            ->value('shop_name');

        $month = $request->query('month', date('Y-m'));
        $showAll = (int) $request->query('all', 0);

        // $jobs = JobList::query()
        //     ->whereIn('status', ['success', 'pending', 'canceled', 'send'])
        //     ->where('is_code_key', $selectedShop)
        //     ->whereMonth('created_at', substr($month, 5, 2))
        //     ->whereYear('created_at', substr($month, 0, 4))
        //     ->get();

        $jobsQuery = JobList::query()
            ->whereIn('status', ['success', 'pending', 'canceled', 'send'])
            ->where('is_code_key', $selectedShop);

        if ($showAll === 0) {
            $jobsQuery->whereMonth('created_at', substr($month, 5, 2))
                ->whereYear('created_at', substr($month, 0, 4));
        }

        $jobs = $jobsQuery->get();

        $stats = [
            'total' => $jobs->count(),
            'success' => $jobs->where('status', 'success')->count(),
            'pending' => $jobs->where('status', 'pending')->count(),
            'canceled' => $jobs->where('status', 'canceled')->count(),
            'send' => $jobs->where('status', 'send')->count(),
        ];

        //barChart data
        $groups = [
            'A. ยังไม่เริ่มงาน' => 0,
            'B. ภายในวัน' => 0,
            'C. 1 วัน' => 0,
            'D. 2 วัน' => 0,
            'E. 3 วัน' => 0,
            'F. มากกว่า 3 วัน' => 0,
        ];

        foreach ($jobs as $job) {

            if (!$job->close_job_at) {
                $groups['A. ยังไม่เริ่มงาน']++;
                continue;
            }

            $diff = Carbon::parse($job->created_at)->diffInDays(Carbon::parse($job->close_job_at));

            if ($diff == 0) {
                $groups['B. ภายในวัน']++;
            } elseif ($diff == 1) {
                $groups['C. 1 วัน']++;
            } elseif ($diff == 2) {
                $groups['D. 2 วัน']++;
            } elseif ($diff == 3) {
                $groups['E. 3 วัน']++;
            } else {
                $groups['F. มากกว่า 3 วัน']++;
            }
        }

        // ส่งไปหน้า UI แบบ array
        $barData = [];

        foreach ($groups as $label => $count) {
            $barData[] = ['name' => $label, 'value' => $count];
        }

        return Inertia::render('Reports/SummaryCenterRepairs/SumRepairsList', [
            'shops'             => $shops,
            'stats'             => $stats,
            'selectedShop'      => $selectedShop,
            'currentShopName'   => $currentShopName,
            'isAdmin'           => false,
            'barData'           => $barData,
            'selectedMonth'     => $month,
            'showAll'           => $showAll,
        ]);
    }

    public function exportExcel(Request $request)
    {
        $shop = $request->query('shop');
        $month = $request->query('month', date('Y-m'));
        $showAll = (int)$request->query('all', 0);

        // ดึงชื่อร้าน
        $shopName = StoreInformation::where('is_code_cust_id', $shop)->value('shop_name');

        // ดึงข้อมูลตามเดือนและร้านค้า
        // $jobs = JobList::query()
        //     ->where('is_code_key', $shop)
        //     ->whereIn('status', ['success', 'pending', 'canceled', 'send'])
        //     ->whereMonth('created_at', substr($month, 5, 2))
        //     ->whereYear('created_at', substr($month, 0, 4))
        //     ->orderBy('created_at', 'desc')
        //     ->get();

        $jobsQuery = JobList::query()
            ->where('is_code_key', $shop)
            ->whereIn('status', ['success', 'pending', 'canceled', 'send']);

        if ($showAll === 0) {
            $jobsQuery->whereMonth('created_at', substr($month, 5, 2))
                ->whereYear('created_at', substr($month, 0, 4));
        }

        $jobs = $jobsQuery->orderBy('created_at', 'desc')->get();

        // ชุดข้อมูลส่งออก
        $exportData = [];
        $exportData[] = ['ลำดับ', 'Job ID', 'ชื่อสินค้า', 'สถานะ', 'สร้างเมื่อ', 'ปิดงานเมื่อ'];

        foreach ($jobs as $key => $job) {
            $exportData[] = [
                $key + 1,
                $job->job_id,
                $job->p_name,
                $job->status,
                $job->created_at,
                $job->close_job_at,
            ];
        }

        // สร้างไฟล์ Excel
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($exportData as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {

                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                $cell = $colLetter . ($rowIndex + 1);

                if ($colIndex == 1) {
                    $sheet->setCellValueExplicit($cell, (string) $value, DataType::TYPE_STRING);
                } else {
                    $sheet->setCellValue($cell, $value);
                }
            }
        }

        // ตั้งชื่อไฟล์
        $cleanShopName = preg_replace('/[^A-Za-z0-9ก-๙]/u', '_', $shopName);
        $fileName = "SummaryRepair_{$cleanShopName}_{$month}.xlsx";

        // บันทึกไฟล์ชั่วคราว
        $filePath = storage_path($fileName);
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }

    public function detail(Request $request)
    {
        $shop = $request->query('shop');
        $status = $request->query('status');
        $showAll = (int)$request->query('all', 0);

        // ถ้า all=1 → month = null
        $month = $showAll ? null : $request->query('month');

        $currentShopName = StoreInformation::where('is_code_cust_id', $shop)->value('shop_name');

        $jobsQuery = JobList::query()
            ->where('is_code_key', $shop)
            ->whereIn('status', (array)$status);

        // filter เฉพาะกรณีเป็นรายเดือน
        if ($showAll === 0 && $month) {
            $jobsQuery->whereMonth('created_at', substr($month, 5, 2))
                ->whereYear('created_at', substr($month, 0, 4));
        }

        // ส่ง params กลับไปให้ pagination
        $params = [
            'shop' => $shop,
            'status' => $status,
            'all' => $showAll,
        ];

        if ($showAll === 0 && $month) {
            $params['month'] = $month;
        }

        $jobs = $jobsQuery
            ->orderBy('created_at', 'desc')
            ->paginate(50)
            ->appends($params);

        return Inertia::render('Admin/SummaryCenterRepairs/JobDetail', [
            'jobs' => $jobs,
            'status' => $status,
            'currentShopName' => $currentShopName,
            'shop' => $shop,
            'month' => $month,
            'isAdmin' => false,
        ]);
    }
}
