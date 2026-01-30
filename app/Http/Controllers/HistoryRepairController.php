<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\Remark;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HistoryRepairController extends Controller
{
    public function index(Request $request): Response
    {
        logStamp::query()->create(['description' => Auth::user()->user_code . " ดูเมนู ประวัติงานซ่อม"]);

        $query = JobList::query()
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            ->leftJoin('repair_men', 'job_lists.repair_man_id', '=', 'repair_men.id')
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->select('job_lists.*', 'customer_in_jobs.name', 'customer_in_jobs.phone', 'repair_men.technician_name', 'repair_men.technician_phone');

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

        // 📅 Filter by date range
        if ($request->filled('date_start') && $request->filled('date_end')) {
            $query->whereBetween('job_lists.created_at', [
                $request->date_start . " 00:00:00",
                $request->date_end . " 23:59:59"
            ]);
        } elseif ($request->filled('date_start')) {
            $query->whereDate('job_lists.created_at', '>=', $request->date_start);
        } elseif ($request->filled('date_end')) {
            $query->whereDate('job_lists.created_at', '<=', $request->date_end);
        }

        if ($request->filled('created_job_from')) {
            $query->where('job_lists.created_job_from', $request->created_job_from);
        }

        $jobs = $query->orderBy('job_lists.created_at', 'desc')->paginate(10);
        return Inertia::render('HistoryPage/HistoryMain', ['jobs' => $jobs]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(
            ['search' => 'required', 'type' => 'required'],
            ['search.required' => 'search is required', 'type.required' => 'search is required']
        );

        $search = CustomerInJob::query()
            ->leftJoin('job_lists', 'job_lists.job_id', '=', 'customer_in_jobs.job_id')
            ->where('phone', $request->get('search'))
            ->where('job_lists.status', 'success')
            ->select('job_lists.serial_id', 'job_lists.pid', 'job_lists.p_name', 'job_lists.image_sku', 'job_lists.warranty as warranty_status')
            ->groupBy('job_lists.serial_id', 'job_lists.pid', 'job_lists.p_name', 'job_lists.image_sku', 'job_lists.warranty')
            ->get();
        return response()->json($search);
    }

    public function detail($serial_id): JsonResponse
    {
        $response = Http::post(env('API_DETAIL'), [
            'sn' => $serial_id,
            'views' => 'single',
        ]);
        $searchResults = $response->json();
        $data = [];
        $hisSystem = $this->historyInSystem($serial_id);
        // dd($hisSystem);
        $data['history'] = $hisSystem;
        //        $data['detail'] = $searchResults['assets'][0] ?? [];
        // $data['history'] = array_merge($hisSystem, $searchResults['assets'][0]['history']);
        return response()->json([
            'message' => 'success',
            'history' => $data['history'] ?? [],
            'detail' => $data['detail'] ?? [],
        ]);
    }


    private function historyInSystem($serial_id)
    {
        $jobs = JobList::query()->where('serial_id', $serial_id)
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->orderBy('id', 'desc')
            ->get();
        $histories = [];
        foreach ($jobs as $key => $job) {
            $remark = Remark::query()->where('job_id', $job->job_id)->first();
            $histories[$key]['status'] = $job->status;
            $histories[$key]['close_job_by'] = $job->close_job_by;
            $histories[$key]['remark'] = $remark ? $remark->remark : 'ไม่มีข้อมูล';
            $histories[$key]['endservice'] = $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : 'N/A';
            $sparePart = SparePart::query()->where('job_id', $job->job_id)
                ->select('qty', 'sp_unit as unit', 'sp_code as spcode', 'sp_name as spname')->get();
            $histories[$key]['sparepart'] = $sparePart->toArray();
            $behavior = Behavior::query()->where('job_id', $job->job_id)->select('behavior_name as behaviorname')->get();
            $histories[$key]['behavior'] = $behavior->toArray();
        }
        return $histories;
    }

    //function Export Excel 
    public function exportExcel(Request $request)
    {
        $query = JobList::query()
            ->leftJoin('customer_in_jobs', 'customer_in_jobs.job_id', '=', 'job_lists.job_id')
            ->leftJoin('repair_men', 'job_lists.repair_man_id', '=', 'repair_men.id')
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->select(
                'job_lists.job_id',
                'job_lists.status',
                'job_lists.serial_id',
                'job_lists.pid',
                'job_lists.p_name',
                'job_lists.p_base_unit',
                'job_lists.p_cat_id',
                'job_lists.p_cat_name',
                'job_lists.p_sub_cat_name',
                'job_lists.fac_model',
                'job_lists.warranty',
                'job_lists.created_at',
                'job_lists.user_key',
                'job_lists.print_at',
                'job_lists.print_updated_at',
                'job_lists.close_job_at',
                'job_lists.close_job_by',
                'job_lists.updated_at',
                'job_lists.repair_man_id',
                'repair_men.technician_name'
            );

        // filters
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

        // 📅 Date filter
        if ($request->filled('date_start') && $request->filled('date_end')) {
            $query->whereBetween('job_lists.created_at', [
                $request->date_start . " 00:00:00",
                $request->date_end . " 23:59:59"
            ]);
        } elseif ($request->filled('date_start')) {
            $query->whereDate('job_lists.created_at', '>=', $request->date_start);
        } elseif ($request->filled('date_end')) {
            $query->whereDate('job_lists.created_at', '<=', $request->date_end);
        }

        if ($request->filled('created_job_from')) {
            $query->where('job_lists.created_job_from', $request->created_job_from);
        }

        $jobs = $query->orderBy('job_lists.created_at', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = [
            'เลขที่ JOB',
            'สถานะ JOB',
            'ซีเรียล',
            'รหัสสินค้า',
            'ชื่อสินค้า',
            'หน่วย',
            'หมวดหมู่ (S)',
            'หมวดหมู่',
            'หมวดหมู่ย่อย',
            'โมเดล',
            'สถานะรับประกัน',
            'วันที่-เวลา สร้าง',
            'ชื่อผู้สร้าง',
            'วันที่-เวลา พิมพ์',
            'วันที่-เวลา พิมพ์ล่าสุด',
            'วันที่-เวลา ปิด JOB',
            'ชื่อผู้ปิด JOB',
            'วันที่-เวลา อัพเดท',
            'ชื่อช่างผู้ซ่อม'
        ];
        $sheet->fromArray($headers, null, 'A1');

        $headerRange = 'A1:S1';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'name' => 'Angsana New',
                'size' => 14,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFA500'],
            ],
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
            $sheet->setCellValue("A{$row}", $job->job_id);
            $sheet->setCellValue("B{$row}", $statusLabels[$job->status] ?? $job->status);
            $sheet->setCellValueExplicit("C{$row}", (string) $job->serial_id, DataType::TYPE_STRING);
            $sheet->setCellValue("D{$row}", $job->pid);
            $sheet->setCellValue("E{$row}", $job->p_name);
            $sheet->setCellValue("F{$row}", $job->p_base_unit);
            $sheet->setCellValue("G{$row}", $job->p_cat_id);
            $sheet->setCellValue("H{$row}", $job->p_cat_name);
            $sheet->setCellValue("I{$row}", $job->p_sub_cat_name);
            $sheet->setCellValue("J{$row}", $job->fac_model);
            $sheet->setCellValue(
                "K{$row}",
                $job->warranty
                    ? 'อยู่ในรับประกัน'
                    : 'ไม่อยู่ในรับประกัน'
            );
            $sheet->setCellValue("L{$row}", $job->created_at ? $job->created_at->format('Y-m-d H:i:s') : '');
            $sheet->setCellValue("M{$row}", $job->user_key);
            $sheet->setCellValue("N{$row}", $job->print_at);
            $sheet->setCellValue("O{$row}", $job->print_updated_at);
            $sheet->setCellValue("P{$row}", $job->close_job_at);
            $sheet->setCellValue("Q{$row}", $job->close_job_by);
            $sheet->setCellValue("R{$row}", $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : '');
            $sheet->setCellValue("S{$row}", $job->technician_name);
            $row++;
        }

        $dataRange = "A1:S" . ($row - 1);
        $sheet->getStyle($dataRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle($dataRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        foreach (range('A', 'S') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $response = new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        });

        $fileName = 'ประวัติการซ่อม_' . now()->format('Ymd_His') . '.xlsx';

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', "attachment;filename=\"{$fileName}\"");
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }
}
