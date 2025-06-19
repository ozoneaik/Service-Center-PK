<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use Mpdf\Config\ConfigVariables;
use Mpdf\Config\FontVariables;
use Mpdf\Mpdf;

class DomPdfController extends Controller
{
    public function index() {
        // 📌 ดึงค่า default ของ mpdf มาก่อน
        $defaultConfig = (new ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];

        $defaultFontConfig = (new FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        // 📌 สร้าง Mpdf instance โดยรวม path ฟอนต์ของเราเข้าไป
        $mpdf = new Mpdf([
            'fontDir' => array_merge($fontDirs, [storage_path('app/public/SaraBun')]),
            'fontdata' => $fontData + [
                    'sarabun' => [
                        'R' => 'Sarabun-Regular.ttf',
                    ]
                ],
            'default_font' => 'sarabun',
        ]);

        // 📄 ดึง HTML จาก Blade
        $html = view('domPdf',['shop_name' => 'Pumpkin Corporation'])->render();
        $mpdf->WriteHTML($html);

        // 📄 แสดงบน browser
        return response($mpdf->Output('', 'S'), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="thai.pdf"');
    }
}
