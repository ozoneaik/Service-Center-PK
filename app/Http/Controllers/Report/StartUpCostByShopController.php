<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StartUpCost;
use App\Models\StoreInformation;
use App\Models\User;
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
        $selected_shop = $request->query('shop');
        $shop = $selected_shop ?? Auth::user()->is_code_cust_id;

        // รายชื่อร้านทั้งหมด
        $exclude_shops = ['67132'];
        $shops = StoreInformation::whereNotIn('is_code_cust_id', $exclude_shops)
            ->select('is_code_cust_id', 'shop_name')
            ->get();
        // $shops = StoreInformation::select('is_code_cust_id', 'shop_name')->get();
        $current_shop_name = StoreInformation::where('is_code_cust_id', Auth::user()->is_code_cust_id)
            ->value('shop_name');

        $jobs = JobList::query()
            // ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('is_code_key', $shop)
            ->where('status', 'success')
            ->where('warranty', true)
            ->orderBy('created_at', 'desc')
            ->paginate(100);

        $jobs_all = JobList::query()
            // ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('is_code_key', $shop)
            ->where('status', 'success')
            ->where('warranty', true)
            ->orderBy('created_at', 'desc')
            ->get();

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
            'Reports/StartUpCostByShop/SucBsList',
            [
                'jobs' => $jobs,
                'total_start_up_cost' => $total_start_up_cost,
                'shops' => $shops,
                'selected_shop' => $shop,
                'current_shop_name' => $current_shop_name,
                'is_admin' => Auth::user()->role === 'admin'
            ]
        );
    }

    public function exportExcel(Request $request)
    {
        $shop = $request->query('shop');

        $jobs = JobList::query()
            ->where('is_code_key', $shop)
            ->where('status', 'success')
            ->where('warranty', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $exportData = [];
        $exportData[] = [
            'ลำดับ',
            'Job ID',
            'PID',
            'ชื่อสินค้า',
            'Serial',
            'ค่าเปิดเครื่อง (บาท)',
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
                $job->created_at,
                $job->updated_at
            ];
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($exportData as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {

                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);

                // ถ้าเป็น Serial หรือ PID → บังคับเป็น Text
                if ($colIndex == 3 || $colIndex == 4) {   // หรือปรับตามลำดับจริงของคุณ
                    $sheet->setCellValueExplicit(
                        $colLetter . ($rowIndex + 1),
                        (string)$value,
                        DataType::TYPE_STRING
                    );
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
