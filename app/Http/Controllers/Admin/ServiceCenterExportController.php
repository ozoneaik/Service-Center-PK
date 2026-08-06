<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaleInformation;
use App\Models\StoreInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ServiceCenterExportController extends Controller
{
    public function index(): Response
    {
        $shops = StoreInformation::where('shop_type', 'service_center')
            ->orderBy('shop_name')
            ->get();

        $saleMap = SaleInformation::pluck('name', 'sale_code');

        $shops = $shops->map(function ($shop) use ($saleMap) {
            $shop->sale_name = $shop->sale_id ? ($saleMap[$shop->sale_id] ?? null) : null;
            return $shop;
        });

        return Inertia::render('Admin/ServiceCenter/ServiceCenterList', [
            'shops' => $shops,
        ]);
    }

    public function toggleFilter(string $is_code_cust_id): JsonResponse
    {
        $shop = StoreInformation::where('is_code_cust_id', $is_code_cust_id)->firstOrFail();
        $shop->show_in_report_filter = !$shop->show_in_report_filter;
        $shop->save();

        return response()->json([
            'is_code_cust_id'       => $shop->is_code_cust_id,
            'show_in_report_filter' => $shop->show_in_report_filter,
        ]);
    }

    public function toggleActive(string $is_code_cust_id): JsonResponse
    {
        $shop = StoreInformation::where('is_code_cust_id', $is_code_cust_id)->firstOrFail();
        $shop->is_active = $shop->is_active === 'Y' ? 'N' : 'Y';
        $shop->save();

        return response()->json([
            'is_code_cust_id' => $shop->is_code_cust_id,
            'is_active'       => $shop->is_active,
        ]);
    }

    public function exportExcel(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $shops = StoreInformation::where('shop_type', 'service_center')
            ->where('is_active', 'Y')
            ->orderBy('shop_name')
            ->get();

        $saleMap = SaleInformation::pluck('name', 'sale_code');

        $data = [[
            'ชื่อร้าน',
            'รหัสร้านค้า',
            'ที่อยู่',
            'เซลล์ที่ดูแล',
            'สถานะศูนย์ซ่อม',
            'แสดงในตัวกรอง Report',
        ]];

        foreach ($shops as $shop) {
            $data[] = [
                $shop->shop_name,
                $shop->is_code_cust_id,
                $shop->address,
                $shop->sale_id ? ($saleMap[$shop->sale_id] ?? $shop->sale_id) : '-',
                $shop->is_active === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน',
                $shop->show_in_report_filter ? 'แสดง' : 'ซ่อน',
            ];
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('ศูนย์ซ่อม');

        foreach ($data as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                $cell = $colLetter . ($rowIndex + 1);

                if ($colIndex === 1) {
                    $sheet->setCellValueExplicit($cell, (string) $value, DataType::TYPE_STRING);
                } else {
                    $sheet->setCellValue($cell, $value);
                }
            }
        }

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = 'ServiceCenter_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path($fileName);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }
}
