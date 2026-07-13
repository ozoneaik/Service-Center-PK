<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\StoreInformation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HistoryDealersController extends Controller
{
    public function index(Request $request)
    {
        $dealerCodes = StoreInformation::where('shop_type', 'dealer')
            ->pluck('is_code_cust_id')
            ->toArray();

        $query = JobList::query()
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            ->leftJoin('store_information as store', 'store.is_code_cust_id', '=', 'job_lists.is_code_key')
            ->leftJoin('repair_men', 'job_lists.repair_man_id', '=', 'repair_men.id')
            ->whereIn('job_lists.is_code_key', $dealerCodes)
            ->select(
                'job_lists.*',
                'customer_in_jobs.name',
                'customer_in_jobs.phone',
                'store.shop_name',
                'repair_men.technician_name',
                'repair_men.technician_phone'
            );

        if ($request->filled('serial_id')) {
            $query->where('job_lists.serial_id', 'like', "%{$request->serial_id}%");
        }
        if ($request->filled('job_id')) {
            $query->where('job_lists.job_id', 'like', "%{$request->job_id}%");
        }
        if ($request->filled('phone')) {
            $query->where('customer_in_jobs.phone', 'like', "%{$request->phone}%");
        }
        if ($request->filled('name')) {
            $query->where('customer_in_jobs.name', 'like', "%{$request->name}%");
        }
        if ($request->filled('status')) {
            $query->where('job_lists.status', $request->status);
        }
        if ($request->filled('shops')) {
            $shops = $request->input('shops');
            if (is_array($shops) && count($shops) > 0) {
                $query->whereIn('job_lists.is_code_key', $shops);
            }
        }
        if ($request->filled('date_start') && $request->filled('date_end')) {
            $query->whereBetween('job_lists.created_at', [
                $request->date_start . ' 00:00:00',
                $request->date_end . ' 23:59:59',
            ]);
        } elseif ($request->filled('date_start')) {
            $query->whereDate('job_lists.created_at', '>=', $request->date_start);
        } elseif ($request->filled('date_end')) {
            $query->whereDate('job_lists.created_at', '<=', $request->date_end);
        }

        $jobs = $query->orderBy('job_lists.id', 'desc')->paginate(100);

        $stores = StoreInformation::where('shop_type', 'dealer')
            ->select('is_code_cust_id', 'shop_name')
            ->orderBy('shop_name')
            ->get();

        return Inertia::render('Admin/HistoryJobShop/Index', [
            'jobs'   => $jobs,
            'stores' => $stores,
        ]);
    }

    public function exportExcel(Request $request)
    {
        $dealerCodes = StoreInformation::where('shop_type', 'dealer')
            ->pluck('is_code_cust_id')
            ->toArray();

        $query = JobList::query()
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            ->leftJoin('store_information as store', 'store.is_code_cust_id', '=', 'job_lists.is_code_key')
            ->leftJoin('repair_men', 'job_lists.repair_man_id', '=', 'repair_men.id')
            ->whereIn('job_lists.is_code_key', $dealerCodes)
            ->select(
                'job_lists.*',
                'customer_in_jobs.name as cust_name',
                'customer_in_jobs.phone as cust_phone',
                'store.shop_name',
                'store.is_code_cust_id as shop_code',
                'repair_men.technician_name'
            );

        if ($request->filled('serial_id')) {
            $query->where('job_lists.serial_id', 'like', "%{$request->serial_id}%");
        }
        if ($request->filled('job_id')) {
            $query->where('job_lists.job_id', 'like', "%{$request->job_id}%");
        }
        if ($request->filled('phone')) {
            $query->where('customer_in_jobs.phone', 'like', "%{$request->phone}%");
        }
        if ($request->filled('name')) {
            $query->where('customer_in_jobs.name', 'like', "%{$request->name}%");
        }
        if ($request->filled('status')) {
            $query->where('job_lists.status', $request->status);
        }
        if ($request->filled('shops')) {
            $shops = $request->input('shops');
            if (is_array($shops) && count($shops) > 0) {
                $query->whereIn('job_lists.is_code_key', $shops);
            }
        }
        if ($request->filled('date_start') && $request->filled('date_end')) {
            $query->whereBetween('job_lists.created_at', [
                $request->date_start . ' 00:00:00',
                $request->date_end . ' 23:59:59',
            ]);
        } elseif ($request->filled('date_start')) {
            $query->whereDate('job_lists.created_at', '>=', $request->date_start);
        } elseif ($request->filled('date_end')) {
            $query->whereDate('job_lists.created_at', '<=', $request->date_end);
        }

        $jobs = $query->orderBy('job_lists.created_at', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = [
            'เลขที่ JOB', 'สถานะ JOB', 'รหัสร้านค้า', 'ชื่อร้านค้า',
            'ชื่อลูกค้า', 'เบอร์ลูกค้า', 'ซีเรียล', 'รหัสสินค้า', 'ชื่อสินค้า',
            'หน่วย', 'หมวดหมู่ (S)', 'หมวดหมู่', 'หมวดหมู่ย่อย', 'โมเดล',
            'สถานะรับประกัน', 'วันที่-เวลา สร้าง', 'วันที่-เวลา ปิด JOB',
            'ชื่อผู้ปิด JOB', 'วันที่-เวลา อัพเดท', 'ชื่อช่างผู้ซ่อม',
        ];

        $sheet->fromArray($headers, null, 'A1');

        $lastCol = $this->col(count($headers));
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font'      => ['bold' => true, 'name' => 'Angsana New', 'size' => 14],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFA500']],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(25);

        $statusLabels = [
            'pending'  => 'กำลังดำเนินการซ่อม',
            'success'  => 'ปิดการซ่อมแล้ว',
            'canceled' => 'ยกเลิกการซ่อมแล้ว',
            'send'     => 'ส่งไปยังศูนย์ซ่อม PK',
        ];

        $row = 2;
        foreach ($jobs as $job) {
            $c = 1;
            $sheet->setCellValueExplicit($this->col($c++) . $row, $job->job_id, DataType::TYPE_STRING);
            $sheet->setCellValue($this->col($c++) . $row, $statusLabels[$job->status] ?? $job->status);
            $sheet->setCellValueExplicit($this->col($c++) . $row, $job->shop_code, DataType::TYPE_STRING);
            $sheet->setCellValue($this->col($c++) . $row, $job->shop_name);
            $sheet->setCellValue($this->col($c++) . $row, $job->cust_name);
            $sheet->setCellValueExplicit($this->col($c++) . $row, $job->cust_phone, DataType::TYPE_STRING);
            $sheet->setCellValueExplicit($this->col($c++) . $row, (string) $job->serial_id, DataType::TYPE_STRING);
            $sheet->setCellValue($this->col($c++) . $row, $job->pid);
            $sheet->setCellValue($this->col($c++) . $row, $job->p_name);
            $sheet->setCellValue($this->col($c++) . $row, $job->p_base_unit);
            $sheet->setCellValue($this->col($c++) . $row, $job->p_cat_id);
            $sheet->setCellValue($this->col($c++) . $row, $job->p_cat_name);
            $sheet->setCellValue($this->col($c++) . $row, $job->p_sub_cat_name);
            $sheet->setCellValue($this->col($c++) . $row, $job->fac_model);
            $sheet->setCellValue($this->col($c++) . $row, $job->warranty ? 'อยู่ในรับประกัน' : 'ไม่อยู่ในรับประกัน');
            $sheet->setCellValue($this->col($c++) . $row, $job->created_at ? $job->created_at->format('Y-m-d H:i:s') : '');
            $sheet->setCellValue($this->col($c++) . $row, $job->close_job_at);
            $sheet->setCellValue($this->col($c++) . $row, $job->close_job_by);
            $sheet->setCellValue($this->col($c++) . $row, $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : '');
            $sheet->setCellValue($this->col($c++) . $row, $job->technician_name);
            $row++;
        }

        $dataRange = "A1:{$lastCol}" . ($row - 1);
        $sheet->getStyle($dataRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        foreach (range(1, count($headers)) as $colNum) {
            $sheet->getColumnDimension($this->col($colNum))->setAutoSize(true);
        }

        $writer   = new Xlsx($spreadsheet);
        $fileName = 'ประวัติการซ่อม_Dealer_' . now()->format('Ymd_His') . '.xlsx';

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment;filename=\"{$fileName}\"",
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    private function col($number)
    {
        return \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($number);
    }
}
