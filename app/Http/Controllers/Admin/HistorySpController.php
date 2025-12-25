<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HistorySpController extends Controller
{
    public function index(Request $request){
        $query = JobList::query()
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            ->leftJoin('store_information as store','store.is_code_cust_id','=','job_lists.is_code_key')
//            ->whereMonth('job_lists.created_at', now()->month)
//            ->whereYear('job_lists.created_at', now()->year)
            ->select('job_lists.*', 'customer_in_jobs.name', 'customer_in_jobs.phone','store.shop_name');

        // ค้นหาตาม serial_id
        if ($request->filled('serial_id')) {
            $query->where('job_lists.serial_id', 'like', "%{$request->serial_id}%");
        }

        // ค้นหาตาม job_id
        if ($request->filled('job_id')) {
            $query->where('job_lists.job_id', 'like', "%{$request->job_id}%");
        }

        // ค้นหาตามเบอร์โทรศัพท์
        if ($request->filled('phone')) {
            $query->where('customer_in_jobs.phone', 'like', "%{$request->phone}%");
        }

        // ค้นหาตามชื่อลูกค้า
        if ($request->filled('name')) {
            $query->where('customer_in_jobs.name', 'like', "%{$request->name}%");
        }

        // ค้นหาตามสถานะการซ่อม
        if ($request->filled('status')) {
            $query->where('job_lists.status', $request->status);
        }

        $jobs = $query->orderBy('job_lists.id', 'desc')->paginate(100);

        return Inertia::render('HistoryPage/HistoryMain', ['jobs' => $jobs]);
    }

    public function exportExcel(Request $request)
    {
        $query = JobList::query()
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            ->leftJoin('store_information as store', 'store.is_code_cust_id', '=', 'job_lists.is_code_key')
            ->leftJoin('repair_men', 'job_lists.repair_man_id', '=', 'repair_men.id')
            ->select(
                'job_lists.*', // ดึงทุก field จาก job_lists เพื่อให้ได้ p_cat, print_at ฯลฯ ครบ
                'customer_in_jobs.name as cust_name',
                'customer_in_jobs.phone as cust_phone',
                'store.shop_name',
                'store.is_code_cust_id as shop_code',
                'repair_men.technician_name'
            );

        // Filter Logic (เหมือนเดิม)
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
        if ($request->filled('date_start') && $request->filled('date_end')) {
            $query->whereBetween('job_lists.created_at', [$request->date_start . " 00:00:00", $request->date_end . " 23:59:59"]);
        } elseif ($request->filled('date_start')) {
            $query->whereDate('job_lists.created_at', '>=', $request->date_start);
        } elseif ($request->filled('date_end')) {
            $query->whereDate('job_lists.created_at', '<=', $request->date_end);
        }

        $jobs = $query->orderBy('job_lists.created_at', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // หัวตาราง (รวม Admin + Fields จากตัวอย่าง User)
        $headers = [
            'เลขที่ JOB',
            'สถานะ JOB',
            'รหัสร้านค้า',   // Admin Only
            'ชื่อร้านค้า',    // Admin Only
            'ชื่อลูกค้า',     // Admin Only
            'เบอร์ลูกค้า',    // Admin Only
            'ซีเรียล',
            'รหัสสินค้า',
            'ชื่อสินค้า',
            'หน่วย',
            'หมวดหมู่ (S)',     // เพิ่มตามตัวอย่าง
            'หมวดหมู่',        // เพิ่มตามตัวอย่าง
            'หมวดหมู่ย่อย',      // เพิ่มตามตัวอย่าง
            'โมเดล',
            'สถานะรับประกัน',
            'วันที่-เวลา สร้าง',
            'ชื่อผู้สร้าง',      // เพิ่มตามตัวอย่าง
            'วันที่-เวลา พิมพ์',  // เพิ่มตามตัวอย่าง
            'วันที่-เวลา พิมพ์ล่าสุด', // เพิ่มตามตัวอย่าง
            'วันที่-เวลา ปิด JOB',
            'ชื่อผู้ปิด JOB',    // เพิ่มตามตัวอย่าง
            'วันที่-เวลา อัพเดท',
            'ชื่อช่างผู้ซ่อม'
        ];

        $sheet->fromArray($headers, null, 'A1');

        // คำนวณ Column สุดท้าย (มี 23 คอลัมน์ -> 'W')
        $lastCol = $this->col(count($headers));
        $headerRange = "A1:{$lastCol}1";

        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => ['bold' => true, 'name' => 'Angsana New', 'size' => 14],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFA500']],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(25);

        $statusLabels = [
            'pending'  => 'กำลังดำเนินการซ่อม',
            'success'  => 'ปิดการซ่อมแล้ว',
            'canceled' => 'ยกเลิกการซ่อมแล้ว',
            'send'     => 'ส่งไปยังศูนย์ซ่อม PK'
        ];

        $row = 2;
        foreach ($jobs as $job) {
            $colIndex = 1;

            // 1. Job ID
            $sheet->setCellValueExplicit($this->col($colIndex++) . $row, $job->job_id, DataType::TYPE_STRING);
            // 2. Status
            $sheet->setCellValue($this->col($colIndex++) . $row, $statusLabels[$job->status] ?? $job->status);

            // --- ส่วนของ Admin ---
            // 3. รหัสร้าน
            $sheet->setCellValueExplicit($this->col($colIndex++) . $row, $job->shop_code, DataType::TYPE_STRING);
            // 4. ชื่อร้าน
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->shop_name);
            // 5. ชื่อลูกค้า
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->cust_name);
            // 6. เบอร์ลูกค้า
            $sheet->setCellValueExplicit($this->col($colIndex++) . $row, $job->cust_phone, DataType::TYPE_STRING);
            // -------------------

            // 7. Serial
            $sheet->setCellValueExplicit($this->col($colIndex++) . $row, (string)$job->serial_id, DataType::TYPE_STRING);
            // 8. PID
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->pid);
            // 9. P Name
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->p_name);
            // 10. Unit
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->p_base_unit);

            // --- ส่วนที่เพิ่มมาตามตัวอย่าง User ---
            // 11. Cat ID
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->p_cat_id);
            // 12. Cat Name
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->p_cat_name);
            // 13. Sub Cat
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->p_sub_cat_name);
            // ----------------------------------

            // 14. Model
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->fac_model);
            // 15. Warranty
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->warranty ? 'อยู่ในรับประกัน' : 'ไม่อยู่ในรับประกัน');

            // 16. Created At
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->created_at ? $job->created_at->format('Y-m-d H:i:s') : '');
            // 17. User Key (Creator)
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->user_key);
            // 18. Print At
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->print_at);
            // 19. Print Updated At
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->print_updated_at);
            // 20. Close Job At
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->close_job_at);
            // 21. Close Job By
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->close_job_by);
            // 22. Updated At
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : '');
            // 23. Technician
            $sheet->setCellValue($this->col($colIndex++) . $row, $job->technician_name);

            $row++;
        }

        // จัด Format
        $dataRange = "A1:{$lastCol}" . ($row - 1);
        $sheet->getStyle($dataRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        foreach (range(1, count($headers)) as $colNum) {
            $sheet->getColumnDimension($this->col($colNum))->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'ประวัติการซ่อม_' . now()->format('Ymd_His') . '.xlsx';

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment;filename=\"{$fileName}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }

    // Helper function แปลงตัวเลขเป็นชื่อคอลัมน์ A, B, C...
    private function col($number)
    {
        return \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($number);
    }
}
