<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use Mpdf\Config\ConfigVariables;
use Mpdf\Config\FontVariables;
use Mpdf\Mpdf;

class DomPdfController extends Controller
{
    public function index($group_job_id = null)
    {
        // 📌 ดึงค่า default ของ mpdf มาก่อน
        $defaultConfig = (new ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];

        $defaultFontConfig = (new FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        // 📌 สร้าง Mpdf instance โดยรวม path ฟอนต์ของเราเข้าไป
        $mpdf = new Mpdf([
            'fontDir' => array_merge($fontDirs, [
                storage_path('fonts/Sarabun')
            ]),
            'fontdata' => $fontData + [
                'sarabun' => [
                    'R' => 'Sarabun-Regular.ttf',
                ]
            ],
            'default_font' => 'sarabun',
            'tempDir' => storage_path('app/mpdf-temp'),
        ]);

        // ดึงข้อมูลจาก DB โดยอ้างอิงจาก JOB_ID
        if (isset($group_job_id)) {
            $group_job = JobList::query()->where('group_job', $group_job_id)->get();
        } else {
            $group_job = [];
        }


        // 📄 ดึง HTML จาก Blade
        $html = view(
            'domPdf',
            [
                'shop_name' => 'Pumpkin Corporation',
                'group_job' => $group_job,
                'group_job_id' => $group_job_id
            ]
        )->render();
        $mpdf->WriteHTML($html);

        // 📄 แสดงบน browser
        return response($mpdf->Output('', 'S'), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="thai.pdf"');
    }
}
