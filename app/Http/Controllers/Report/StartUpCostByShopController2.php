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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
            return redirect()->route('report.g-start-up-cost-shop.index');
        }

        $selected_shop = $request->query('shop', 'all');
        $is_all_shops = $selected_shop === 'all';
        $shop = $is_all_shops ? null : $selected_shop;

        // รับค่าวันที่จาก Request
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');
        $status = $request->query('status', 'WaitJob');

        // รายชื่อร้านทั้งหมด
        $shops = StoreInformation::where('is_active', 'Y')
            ->select('is_code_cust_id', 'shop_name')
            ->get();

        if ($is_all_shops) {
            $current_shop_name = 'ทั้งหมด';
        } else {
            $current_shop_name = StoreInformation::where('is_code_cust_id', $shop)
                ->value('shop_name');
        }

        $query = JobList::query()
            ->where('status', 'success')
            ->where('warranty', true)
            ->where('stuc_status', 'Y');

        if (!$is_all_shops) {
            $query->where('is_code_key', $shop);
        }

        switch ($status) {
            case 'WaitJob': // Y และยังไม่มีเลข CT
                $query->where('stuc_status', 'Y')->whereNull('stuc_doc_no');
                break;
            case 'WaitCN': // Y, มีเลข CT แล้ว, แต่ยังไม่มี CN
                $query->where('stuc_status', 'Y')
                    ->whereNotNull('stuc_doc_no')
                    ->whereNull('cn_doc');
                break;
            case 'HasCN': // Y และ มีเลข CN แล้ว
                $query->where('stuc_status', 'Y')->whereNotNull('cn_doc');
                break;
            case 'Paid': // สถานะเป็น P
                $query->where('stuc_status', 'P');
                break;
            case 'All':
            default:
                break;
        }

        // เพิ่มเงื่อนไขกรองวันที่ ถ้ามีการส่งมา
        if ($start_date && $end_date) {
            try {
                $start = Carbon::createFromFormat('Y-m', $start_date)->startOfMonth()->format('Y-m-d H:i:s');
                $end = Carbon::createFromFormat('Y-m', $end_date)->endOfMonth()->format('Y-m-d H:i:s');
                $query->whereBetween('close_job_at', [$start, $end]);
            } catch (\Exception $e) {
            }
        }

        $jobs = (clone $query)->orderBy('created_at', 'desc')->paginate(15);
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
                'selected_shop' => $selected_shop ?? $shop,
                'current_shop_name' => $current_shop_name,
                'is_admin' => Auth::user()->role === 'admin',
                'is_acc' => Auth::user()->role === 'acc',
                'filters' => [
                    'start_date' => $start_date,
                    'end_date' => $end_date,
                    'status' => $status,
                ]
            ]
        );
    }

    public function exportExcel(Request $request)
    {
        $shop = $request->query('shop');
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');
        $status = $request->query('status');
        $is_all_shops = $shop === 'all';

        $query = JobList::query()
            ->where('status', 'success')
            ->where('warranty', true)
            ->where('stuc_status', 'Y');

        if (!$is_all_shops) {
            $query->where('is_code_key', $shop);
        }

        switch ($status) {
            case 'WaitJob':
                $query->where('stuc_status', 'Y')->whereNull('stuc_doc_no');
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
        $shopCodes = $jobs->pluck('is_code_key')->unique();
        $shopMap = StoreInformation::whereIn('is_code_cust_id', $shopCodes)
            ->pluck('shop_name', 'is_code_cust_id')
            ->toArray();
        $exportData = [];
        $exportData[] = [
            'ลำดับ',
            'Job ID',
            'ร้านศูนย์ซ่อม',
            'PID',
            'ชื่อสินค้า',
            'Serial',
            'ค่าเปิดเครื่อง (บาท)',
            'สถานะ',
            'เอกสาร CT',
            'เอกสาร CN',
            'วันที่เปิดเครื่อง',
            'วันที่อัพเดท',
        ];

        foreach ($jobs as $index => $job) {
            $start_up_cost = StartUpCost::query()
                ->where('sku_code', $job->pid)
                ->value('startup_cost') ?? 0;

            $statusText = $job->stuc_status;
            if ($job->stuc_status == 'Y' && !$job->stuc_doc_no) $statusText = 'รอสร้าง CN';
            elseif ($job->stuc_status == 'Y' && $job->stuc_doc_no) $statusText = 'สร้าง CN แล้ว';
            elseif ($job->stuc_status == 'P') $statusText = 'ตัดชำระแล้ว';
            elseif (!$job->stuc_status) $statusText = 'รอสร้าง Job';

            $shopName = $shopMap[$job->is_code_key] ?? $job->is_code_key;

            $exportData[] = [
                $index + 1,
                $job->job_id,
                $shopName,
                $job->pid,
                $job->p_name,
                $job->serial_id,
                $start_up_cost,
                $statusText,
                $job->stuc_doc_no, // เพิ่มเลข CT ใน Excel
                $job->cn_doc,      // เพิ่มเลข CN ใน Excel
                $job->created_at,
                $job->updated_at
            ];
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($exportData as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                if ($colIndex == 3 || $colIndex == 5) { // PID (index 2) and Serial (index 4)
                    $sheet->setCellValueExplicit($colLetter . ($rowIndex + 1), (string)$value, DataType::TYPE_STRING);
                } else {
                    $sheet->setCellValue($colLetter . ($rowIndex + 1), $value);
                }
            }
        }

        if ($is_all_shops) {
            $cleanShopName = "All_Shops";
        } else {
            $shopName = StoreInformation::where('is_code_cust_id', $shop)->value('shop_name') ?? 'Shop';
            $cleanShopName = preg_replace('/[^A-Za-z0-9ก-๙]/u', '_', $shopName);
        }

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
            return redirect()->route('report.g-start-up-cost-shop.index');
        }

        $ids = $request->query('ids');
        $start_date = $request->query('start_date');
        $ym = $start_date ? date('Ym', strtotime($start_date)) : date('Ym');

        if (!$ids) {
            return redirect()->back()->with('error', 'กรุณาเลือกรายการก่อนสร้างเอกสาร');
        }

        $idArray = explode(',', $ids);

        // ดึงข้อมูล Job และ Join ร้านค้าเพื่อความง่าย
        $jobs = JobList::whereIn('job_id', $idArray)
            ->where('status', 'success')
            ->whereNull('stuc_doc_no')
            ->get();

        // 1. จัดกลุ่มตามร้านค้า
        $groupedJobs = $jobs->groupBy('is_code_key');

        // 2. เตรียมเลขเอกสาร CT รันนิ่ง
        $prefix = 'CT-' . $ym . '-';
        $lastDoc = DB::table('job_lists')
            ->where('stuc_doc_no', 'like', $prefix . '%')
            ->orderBy('stuc_doc_no', 'desc')
            ->first();

        $currentRunning = $lastDoc ? intval(substr($lastDoc->stuc_doc_no, -4)) : 0;

        // 3. เตรียมเลขเอกสาร Cover (ใบปะหน้า) รันนิ่ง
        $coverPrefix = 'CV-' . $ym . '-';
        $lastCover = DB::table('job_lists')
            ->where('stuc_cover_doc_no', 'like', $coverPrefix . '%')
            ->orderBy('stuc_cover_doc_no', 'desc')
            ->first();
        $coverNext = ($lastCover ? intval(substr($lastCover->stuc_cover_doc_no, -4)) : 0) + 1;
        $previewCoverDocNo = $coverPrefix . str_pad($coverNext, 4, '0', STR_PAD_LEFT);

        $previewData = [];
        $grandTotal = 0;

        foreach ($groupedJobs as $shopId => $shopJobs) {
            $shopName = StoreInformation::where('is_code_cust_id', $shopId)->value('shop_name') ?? 'Unknown Shop';
            $shopTotal = 0;

            // คำนวณยอดแต่ละร้าน
            foreach ($shopJobs as $job) {
                $cost = StartUpCost::where('sku_code', $job->pid)->value('startup_cost') ?? 0;
                $shopTotal += $cost;
            }

            // รันเลขที่เอกสารล่วงหน้าสำหรับ Preview
            $currentRunning++;
            $previewDocNo = $prefix . str_pad($currentRunning, 4, '0', STR_PAD_LEFT);

            $previewData[] = [
                'shop_id' => $shopId,
                'shop_name' => $shopName,
                'doc_no' => $previewDocNo, // เลข CT ของร้านนี้
                'total_cost' => $shopTotal,
                'job_count' => $shopJobs->count(),
                'job_ids' => $shopJobs->pluck('job_id')->toArray() // เก็บ ID เพื่อส่งไป Save
            ];

            $grandTotal += $shopTotal;
        }

        return Inertia::render('Reports/StartUpCostByShop/CreateDoc', [
            'preview_data' => $previewData, // ส่งข้อมูลที่จัดกลุ่มแล้วไป
            'preview_cover_doc_no' => $previewCoverDocNo, // ส่งเลขใบปะหน้าไป
            'total_cost' => $grandTotal,
            'start_date' => $start_date,
        ]);
    }

    public function storeDoc(Request $request)
    {
        $shop_groups = $request->input('shop_groups'); // รับ array ของกลุ่มร้านค้ามา
        $start_date = $request->input('start_date');
        $ym = $start_date ? date('Ym', strtotime($start_date)) : date('Ym');

        if (empty($shop_groups)) {
            return redirect()->back()->with('error', 'ไม่พบรายการ');
        }

        try {
            DB::beginTransaction();

            // 1. Generate Cover Doc No (ใบปะหน้า)
            $coverPrefix = 'CV-' . $ym . '-';
            $lastCover = DB::table('job_lists')
                ->where('stuc_cover_doc_no', 'like', $coverPrefix . '%')
                ->orderBy('stuc_cover_doc_no', 'desc')
                ->lockForUpdate()
                ->first();
            $coverNum = ($lastCover ? intval(substr($lastCover->stuc_cover_doc_no, -4)) : 0) + 1;
            $coverDocNo = $coverPrefix . str_pad($coverNum, 4, '0', STR_PAD_LEFT);

            $prefix = 'CT-' . $ym . '-';

            // 2. Loop แต่ละร้านค้า เพื่อสร้าง CT แยกใบ
            foreach ($shop_groups as $group) {
                $lastDoc = DB::table('job_lists')
                    ->where('stuc_doc_no', 'like', $prefix . '%')
                    ->orderBy('stuc_doc_no', 'desc')
                    ->lockForUpdate()
                    ->first();

                $nextNum = ($lastDoc ? intval(substr($lastDoc->stuc_doc_no, -4)) : 0) + 1;
                $docNo = $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

                // อัปเดต Job ทั้งหมดของร้านนี้
                JobList::whereIn('job_id', $group['job_ids'])
                    ->whereNull('stuc_doc_no')
                    ->update([
                        'stuc_doc_no' => $docNo,          // เลข CT แยกตามร้าน
                        'stuc_cover_doc_no' => $coverDocNo, // เลข Cover รวม (เหมือนกันทุกร้านในรอบนี้)
                        'created_ct_doc_by' => Auth::user()->user_code,
                        'created_ct_doc_at' => now(),
                        'updated_ct_doc_at' => now(),
                    ]);
            }

            DB::commit();

            return redirect()->route('report.start-up-cost-shop.doc-list')
                ->with('success', "สร้างเอกสารเรียบร้อยแล้ว (ใบปะหน้า: $coverDocNo)");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาด: ' . $e->getMessage());
        }
    }

    public function docList(Request $request)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'acc') {
            return redirect()->route('report.g-start-up-cost-shop.index');
        }

        // 1. จัดการตัวแปร Filter ร้านค้า (รองรับ 'all')
        $selected_shop = $request->query('shop', 'all');
        $is_all_shops = $selected_shop === 'all';
        $shop = $is_all_shops ? null : $selected_shop;

        // รับค่า Status (เผื่ออนาคตอยากกรองสถานะในหน้านี้ด้วย)
        $status = $request->query('status', 'WaitCN');

        $shops = StoreInformation::where('is_active', 'Y')
            ->select('is_code_cust_id', 'shop_name')
            ->get();

        if ($is_all_shops) {
            $current_shop_name = 'ทั้งหมด';
        } else {
            $current_shop_name = StoreInformation::where('is_code_cust_id', $shop)->value('shop_name');
        }

        $userMap = User::pluck('name', 'user_code')->toArray();

        // 2. สร้าง Query
        $query = JobList::query()
            ->whereNotNull('stuc_doc_no'); // เอาเฉพาะที่มีเลขเอกสารแล้ว

        // กรองร้านค้าถ้าไม่ได้เลือก All
        if (!$is_all_shops) {
            $query->where('is_code_key', $shop);
        }

        switch ($status) {
            case 'WaitCN': // มี CT แต่ยังไม่มี CN
                $query->where('stuc_status', 'Y')->whereNull('cn_doc');
                break;
            case 'HasCN': // มี CN แล้ว
                $query->where('stuc_status', 'Y')->whereNotNull('cn_doc');
                break;
            case 'Paid': // ตัดจ่ายแล้ว
                $query->where('stuc_status', 'P');
                break;
            case 'All':
            default:
                break;
        }

        // 3. Select ข้อมูล (เพิ่ม stuc_cover_doc_no และ is_code_key)
        $docs = $query->select(
            'stuc_doc_no',
            'stuc_cover_doc_no', // <--- เพิ่ม
            'is_code_key',       // <--- เพิ่ม (เพื่อหาชื่อร้าน)
            'stuc_status',
            'cn_doc',
            DB::raw('MAX(created_ct_doc_at) as created_at'),
            DB::raw('MAX(created_ct_doc_by) as created_by'),
            DB::raw('COUNT(*) as job_count')
        )
            ->groupBy('stuc_doc_no', 'stuc_cover_doc_no', 'is_code_key', 'stuc_status', 'cn_doc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // 4. วนลูปเพื่อใส่ข้อมูลเพิ่มเติม (ชื่อคน, ชื่อร้าน, ยอดเงิน)
        foreach ($docs as $doc) {
            $doc->created_by_name = $userMap[$doc->created_by] ?? '-';

            // หาชื่อร้านค้า
            $doc->shop_name = StoreInformation::where('is_code_cust_id', $doc->is_code_key)->value('shop_name') ?? '-';

            // คำนวณยอดเงิน
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
            'selected_shop' => $selected_shop, // ส่งค่าที่เลือกกลับไป (all หรือ รหัสร้าน)
            'current_shop_name' => $current_shop_name,
            'is_admin' => Auth::user()->role === 'admin',
            'is_acc' => Auth::user()->role === 'acc',
            'filters' => [
                'status' => $status
            ]
        ]);
    }

    public function exportDocList(Request $request)
    {
        // รับค่า Filter
        $shop = $request->query('shop');
        $status = $request->query('status');
        $is_all_shops = $shop === 'all';

        // สร้าง Query
        $query = JobList::query()
            ->whereNotNull('stuc_doc_no');

        if (!$is_all_shops) {
            $query->where('is_code_key', $shop);
        }

        switch ($status) {
            case 'WaitCN':
                $query->where('stuc_status', 'Y')->whereNull('cn_doc');
                break;
            case 'HasCN':
                $query->where('stuc_status', 'Y')->whereNotNull('cn_doc');
                break;
            case 'Paid':
                $query->where('stuc_status', 'P');
                break;
        }

        // ดึงข้อมูล
        $docs = $query->select(
            'stuc_doc_no',
            'stuc_cover_doc_no',
            'is_code_key',
            'stuc_status',
            'cn_doc',
            DB::raw('MAX(created_ct_doc_at) as created_at'),
            DB::raw('MAX(created_ct_doc_by) as created_by'),
            DB::raw('COUNT(*) as job_count')
        )
            ->groupBy('stuc_doc_no', 'stuc_cover_doc_no', 'is_code_key', 'stuc_status', 'cn_doc')
            ->orderBy('created_at', 'desc')
            ->get();

        // 4. เตรียมข้อมูลประกอบ (User & Shop Map) เพื่อลด Query ใน Loop
        $userMap = User::pluck('name', 'user_code')->toArray();
        $shopCodes = $docs->pluck('is_code_key')->unique();
        $shopMap = StoreInformation::whereIn('is_code_cust_id', $shopCodes)
            ->pluck('shop_name', 'is_code_cust_id')
            ->toArray();

        // เตรียมข้อมูลลง Excel
        $exportData = [];
        $exportData[] = [
            'เลขที่เอกสาร (Cover)',
            'เลขที่เอกสาร CT',
            'ร้านค้า',
            'เลขที่เอกสาร CN',
            'วันที่สร้าง',
            'จำนวนรายการ',
            'ยอดรวม (บาท)',
            'สถานะ',
            'ผู้สร้าง'
        ];

        foreach ($docs as $doc) {
            // คำนวณยอดเงินรวม
            $jobsInDoc = JobList::where('stuc_doc_no', $doc->stuc_doc_no)->get(['pid']);
            $total = 0;
            foreach ($jobsInDoc as $job) {
                $cost = StartUpCost::where('sku_code', $job->pid)->value('startup_cost') ?? 0;
                $total += $cost;
            }

            // แปลงสถานะ
            $statusText = 'ไม่ทราบสถานะ';
            if ($doc->stuc_status == 'P') {
                $statusText = 'ตัดชำระแล้ว';
            } elseif ($doc->stuc_status == 'Y') {
                $statusText = $doc->cn_doc ? 'สร้าง CN แล้ว' : 'รอสร้าง CN';
            }

            $exportData[] = [
                $doc->stuc_cover_doc_no,
                $doc->stuc_doc_no,
                $shopMap[$doc->is_code_key] ?? $doc->is_code_key,
                $doc->cn_doc,
                $doc->created_at,
                $doc->job_count,
                $total,
                $statusText,
                $userMap[$doc->created_by] ?? $doc->created_by
            ];
        }

        // สร้างไฟล์ Excel
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($exportData as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                $sheet->setCellValueExplicit($colLetter . ($rowIndex + 1), (string)$value, DataType::TYPE_STRING);
            }
        }

        $fileName = 'ข้อมูลค่าเปิดเครื่อง_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path($fileName);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }

    public function checkCnStatus(Request $request)
    {
        $doc_no = $request->input('doc_no');
        $shop_code = $request->input('shop_code');

        // ดึงค่า Config จาก .env
        $apiUrl = env('API_CHECK_CN_URL');
        $apiKey = env('API_KEY_CKECK_CN');

        Log::info("CheckCN: Start checking...", [
            'doc_no' => $doc_no,
            'shop_code' => $shop_code,
            'target_url' => $apiUrl // Log ดูว่ายิงไปถูก URL ไหม
        ]);

        if (!$doc_no || !$shop_code) {
            return redirect()->back()->with('error', 'ข้อมูลไม่ครบถ้วน');
        }

        if (!$apiUrl || !$apiKey) {
            Log::error("CheckCN: Missing API Configuration in .env");
            return redirect()->back()->with('error', 'การตั้งค่าระบบไม่สมบูรณ์ (API Config Missing)');
        }

        try {
            // ส่ง Request พร้อม Header API Key
            $response = Http::withHeaders([
                'X-Api-Key' => $apiKey
            ])->get($apiUrl, [
                'ct' => $doc_no,
                'cust_code' => $shop_code
            ]);

            Log::info("CheckCN: Request Sent", [
                'status' => $response->status(),
                'url' => $apiUrl
            ]);

            $data = $response->json();

            // เช็คว่า API ตอบกลับมาว่าเจอข้อมูล (exists = true)
            if (isset($data['exists']) && $data['exists'] === true) {

                $cn_no = $data['data']['cn_no'] ?? null;
                $rema_amnt = $data['data']['rema_amnt'] ?? null;

                if ($cn_no) {
                    $updateData = [
                        'cn_doc' => $cn_no,
                        'updated_at' => now()
                    ];

                    $message = "พบเลข CN: $cn_no และอัปเดตเรียบร้อยแล้ว";

                    Log::info("CheckCN: Checking remaining amount", ['rema_amnt' => $rema_amnt]);

                    // ตรวจสอบยอดคงเหลือ ถ้าเป็น 0 ให้เปลี่ยนสถานะเป็น P
                    if (!is_null($rema_amnt) && floatval($rema_amnt) == 0) {
                        $updateData['stuc_status'] = 'P';
                        $message = "พบเลข CN: $cn_no และอัปเดตสถานะเป็น 'ตัดชำระแล้ว' (ยอดคงเหลือ 0)";
                        Log::info("CheckCN: Condition matched -> Set status to 'P'");
                    }

                    Log::info("CheckCN: Updating Database for Job", [
                        'stuc_doc_no' => $doc_no,
                        'update_data' => $updateData
                    ]);

                    JobList::where('stuc_doc_no', $doc_no)
                        ->update($updateData);

                    return redirect()->back()->with('success', $message);
                } else {
                    Log::warning("CheckCN: 'exists' is true but 'cn_no' is null", ['response_data' => $data]);
                }
            }

            // กรณี API ตอบกลับมาแต่ไม่พบข้อมูล
            return redirect()->back()->with('error', 'ยังไม่พบเลข CN ในระบบปลายทาง');
        } catch (\Exception $e) {
            Log::error("CheckCN: Exception occurred", [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ API: ' . $e->getMessage());
        }
    }

    public function showDoc(Request $request, $doc_no)
    {
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'acc') {
            return redirect()->route('report.g-start-up-cost-shop.index');
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
        $cnDoc = $firstJob->cn_doc;
        return Inertia::render('Reports/StartUpCostByShop/DocDetail', [
            'doc_no' => $doc_no,
            'jobs' => $jobs,
            'doc_status' => $docStatus,
            'cn_doc' => $cnDoc,
            'total_cost' => $totalCost,
            'current_shop_name' => $current_shop_name,
            'created_by_name' => $created_by_name,
            'created_at' => $docDate,
        ]);
    }
}
