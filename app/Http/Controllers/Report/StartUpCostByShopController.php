<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StartUpCost;
use App\Models\StoreInformation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class StartUpCostByShopController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->role === 'acc') {
            return redirect()->route('report.start-up-cost-shop.index');
        }

        $selected_shop = $request->query('shop');
        $shop = $selected_shop ?? Auth::user()->is_code_cust_id;
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');
        $status = $request->query('status', 'All');

        $exclude_shops = ['67132'];
        $shops = StoreInformation::whereNotIn('is_code_cust_id', $exclude_shops)
            ->select('is_code_cust_id', 'shop_name')
            ->get();

        $current_shop_name = StoreInformation::where('is_code_cust_id', $shop)
            ->value('shop_name');

        $query = JobList::query()
            ->where('is_code_key', $shop)
            ->where('status', 'success')
            ->where('warranty', true)->where('stuc_status', 'Y');

        switch ($status) {
            case 'WaitJob':
                $query->where(function ($q) {
                    $q->whereNull('stuc_status')->orWhere('stuc_status', 'N');
                });
                break;
            case 'WaitCN':
                $query->where('stuc_status', 'Y')->whereNotNull('stuc_doc_no')->whereNull('cn_doc');
                break;
            case 'HasCN':
                $query->where('stuc_status', 'Y')->whereNotNull('cn_doc');
                break;
            case 'Paid':
                $query->where('stuc_status', 'P');
                break;
            case 'All':
            default:
                break;
        }

        if ($start_date && $end_date) {
            try {
                $start = Carbon::createFromFormat('Y-m', $start_date)->startOfMonth()->format('Y-m-d H:i:s');
                $end = Carbon::createFromFormat('Y-m', $end_date)->endOfMonth()->format('Y-m-d H:i:s');
                $query->whereBetween('close_job_at', [$start, $end]);
            } catch (\Exception $e) {
            }
        }

        $jobs = (clone $query)->orderBy('created_at', 'desc')->paginate(100);
        $jobs_all = (clone $query)->orderBy('created_at', 'desc')->get();

        foreach ($jobs as $key => $job) {
            $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
            $jobs[$key]['start_up_cost'] = $start_up_cost ? (float) $start_up_cost->startup_cost : 0;

            if ($job->stuc_status == 'P') {
                $jobs[$key]['display_status'] = 'paid'; // จ่ายแล้ว
            } elseif ($job->stuc_status == 'Y') {
                if ($job->cn_doc) {
                    $jobs[$key]['display_status'] = 'has_cn'; // มี CN
                } elseif ($job->stuc_doc_no) {
                    $jobs[$key]['display_status'] = 'wait_cn'; // รอ CN
                } else {
                    $jobs[$key]['display_status'] = 'wait_job'; // รอสร้าง Job
                }
            } else {
                $jobs[$key]['display_status'] = 'wait_job'; // Default
            }
        }

        $total_start_up_cost = 0;
        foreach ($jobs_all as $job) {
            $start_up_cost = StartUpCost::query()->where('sku_code', $job['pid'])->first();
            $total_start_up_cost += $start_up_cost ? (float) $start_up_cost->startup_cost : 0;
        }

        return Inertia::render(
            'Reports/StartUpCostByShop/SucBsList',
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
                    'status' => $status
                ]
            ]
        );
    }

    public function exportExcel(Request $request)
    {
        $shop = $request->query('shop');
        $status = $request->query('status');

        $query = JobList::query()
            ->where('is_code_key', $shop)
            ->where('status', 'success')
            ->where('warranty', true);

        switch ($status) {
            case 'WaitJob':
                $query->where(function ($q) {
                    $q->whereNull('stuc_status')->orWhere('stuc_status', 'N');
                });
                break;
            case 'WaitCN':
                $query->where('stuc_status', 'Y')->whereNotNull('stuc_doc_no')->whereNull('cn_doc');
                break;
            case 'HasCN':
                $query->where('stuc_status', 'Y')->whereNotNull('cn_doc');
                break;
            case 'Paid':
                $query->where('stuc_status', 'P');
                break;
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
            $start_up_cost = StartUpCost::query()->where('sku_code', $job->pid)->value('startup_cost') ?? 0;

            $statusText = 'รอสร้าง Job';
            if ($job->stuc_status == 'P') $statusText = 'ตัดชำระแล้ว';
            elseif ($job->stuc_status == 'Y') {
                if ($job->cn_doc) $statusText = 'สร้าง CN แล้ว';
                elseif ($job->stuc_doc_no) $statusText = 'รอสร้าง CN';
            }

            $exportData[] = [
                $index + 1,
                $job->job_id,
                $job->pid,
                $job->p_name,
                $job->serial_id,
                $start_up_cost,
                $statusText,
                $job->created_at,
                $job->updated_at
            ];
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($exportData as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                if ($colIndex == 2 || $colIndex == 4) {
                    $sheet->setCellValueExplicit($colLetter . ($rowIndex + 1), (string)$value, DataType::TYPE_STRING);
                } else {
                    $sheet->setCellValue($colLetter . ($rowIndex + 1), $value);
                }
            }
        }

        $shopName = StoreInformation::where('is_code_cust_id', $shop)->value('shop_name') ?? 'Shop';
        $cleanShopName = preg_replace('/[^A-Za-z0-9ก-๙]/u', '_', $shopName);
        $fileName = 'StartUpCost_' . $cleanShopName . '_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path($fileName);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }
}
