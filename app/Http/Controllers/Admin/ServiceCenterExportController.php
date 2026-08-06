<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaleInformation;
use App\Models\StoreInformation;
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

    public function exportExcel(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $shops = StoreInformation::where('shop_type', 'service_center')
            ->orderBy('shop_name')
            ->get();

        $saleMap = SaleInformation::pluck('name', 'sale_code');

        $data = [[
            'ชื่อร้าน',
            'รหัสร้านค้า',
            'ที่อยู่',
            'เซลล์ที่ดูแล',
            'สถานะศูนย์ซ่อม',
        ]];

        foreach ($shops as $shop) {
            $data[] = [
                $shop->shop_name,
                $shop->is_code_cust_id,
                $shop->address,
                $shop->sale_id ? ($saleMap[$shop->sale_id] ?? $shop->sale_id) : '-',
                $shop->is_active === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน',
            ];
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('ศูนย์ซ่อม');

        foreach ($data as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                $cell = $colLetter . ($rowIndex + 1);

                // รหัสร้านค้า → บังคับเป็น text
                if ($colIndex === 1) {
                    $sheet->setCellValueExplicit($cell, (string) $value, DataType::TYPE_STRING);
                } else {
                    $sheet->setCellValue($cell, $value);
                }
            }
        }

        // ปรับความกว้างคอลัมน์
        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = 'ServiceCenter_' . date('Ymd_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path($fileName);
        $writer->save($filePath);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }
}
