<?php

namespace App\Http\Controllers;

use App\Models\AccessoriesNote;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\JobList;
use App\Models\Remark;
use App\Models\StoreInformation;
use App\Models\Symptom;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Http\RedirectResponse;
use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Illuminate\Http\Request;

class genQuPdfController extends Controller
{
    // public function genReCieveSpPdf(Request $request, $job_id): View|Factory|Application
    // {
    //     try {
    //         $customer = CustomerInJob::findByJobId($job_id);
    //         $remark = Remark::findByJobId($job_id);
    //         $symptom = Symptom::findByJobId($job_id);
    //         $product = JobList::query()->where('job_id', $job_id)->first();
    //         $accessory = AccessoriesNote::findByJobId($job_id);
    //         $behavior = Behavior::query()->where('job_id', $job_id)->first();

    //         $user_key = User::query()->where('user_code', $product->user_key)->first();

    //         $store = StoreInformation::query()->where('is_code_cust_id', $product['is_code_key'])->first();

    //         if (isset($request->print_barigan) && $request->print_barigan == 'on') {
    //             //เข้าสู่การปริ้น
    //             $connector = new NetworkPrintConnector(env('VITE_PRINTER_IP'), env('VITE_PRINTER_PORT'), 5);
    //             $printer = new Printer($connector);
    //             //ใช้ Raw ESC/POS Command สำหรับภาษาไทย
    //             $printer->getPrintConnector()->write("\x1b\x74\x12");
    //             // ตั้งค่าจัดกึ่งกลาง
    //             $printer->setJustification(Printer::JUSTIFY_CENTER);
    //             $printer->setEmphasis(true);
    //             $printer->setTextSize(2, 2);
    //             $printer->text("ศูนย์บริการ PCS\n");
    //             $printer->setEmphasis(false);
    //             //barCode
    //             // เนื้อหา
    //             $printer->setTextSize(1, 1);
    //             $printer->text("\n\n");
    //             $printer->setBarcodeHeight(60);
    //             $printer->setBarcodeWidth(2);
    //             // $printer->setBarcodeTextPosition(Printer::BARCODE_TEXT_BELOW);
    //             $barcode_text = "{B" . $job_id;
    //             //        $new_code = '001'. substr($job_id, -4);
    //             //        $barcode_text = "{B" . $new_code;
    //             $printer->barcode($barcode_text, Printer::BARCODE_CODE128);
    //             $printer->text("\n\n");
    //             // เนื้อหา
    //             $indent = "\n    ";
    //             $printer->setJustification(Printer::JUSTIFY_CENTER);
    //             $printer->setTextSize(2, 2);
    //             $printer->text($job_id . "\n");
    //             $printer->setJustification(Printer::JUSTIFY_LEFT);
    //             $printer->setTextSize(1, 1);
    //             $printer->text($indent . "ชื่อร้าน: " . $store['shop_name']);
    //             $printer->text($indent . "เบอร์โทร: " . $store['phone']);
    //             $printer->text($indent . str_repeat("-", 32));
    //             $printer->text($indent . "วันที่: " . Carbon::now()->format('d/m/y'));
    //             $printer->text($indent . "ชื่อลูกค้า: " . $customer['name']);
    //             $printer->text($indent . "เบอร์โทรติดต่อ: " . $customer['phone']);
    //             $printer->text($indent . "S/N: " . $product['serial_id']);
    //             $printer->text($indent . "สินค้า: " . $product['pid'] . $product['p_name']);
    //             $printer->text($indent . "อาการ: " . $symptom ?? '-');
    //             $printer->text($indent . "ผู้รับงาน: " . $user_key['name']);
    //             $printer->text($indent . "อุปกรณ์เสริม: " . $accessory ?? '-');
    //             $printer->text($indent . "หมายเหตุลูกค้า: " . $customer['remark'] ?? '-');
    //             $printer->text($indent . "หมายเหตุภายในศูนย์ซ่อม: " . $remark);
    //             $printer->text($indent . str_repeat("-", 32));
    //             $printer->feed(1);

    //             // ตัดกระดาษ
    //             $printer->cut();


    //             // ตั้งค่าจัดกึ่งกลาง
    //             $printer->setJustification(Printer::JUSTIFY_CENTER);
    //             $printer->setEmphasis(true);
    //             $printer->setTextSize(2, 2);
    //             $printer->text("ศูนย์บริการ PCS\n");
    //             $printer->text("สำหรับลูกค้า\n");
    //             $printer->setEmphasis(false);
    //             // เนื้อหา
    //             $printer->setTextSize(1, 1);
    //             $printer->text("\n\n");
    //             $printer->setBarcodeHeight(60);
    //             $printer->setBarcodeWidth(2);
    //             //        $printer->setBarcodeTextPosition(Printer::BARCODE_TEXT_BELOW);
    //             $barcode_text = "{B" . $job_id;
    //             $printer->barcode($barcode_text, Printer::BARCODE_CODE128);
    //             $printer->text("\n\n");
    //             $indent = "\n    ";
    //             $printer->setTextSize(2, 2);
    //             $printer->setJustification(Printer::JUSTIFY_CENTER);
    //             $printer->text($job_id . "\n");
    //             $printer->setTextSize(1, 1);
    //             $printer->setJustification(Printer::JUSTIFY_LEFT);
    //             $printer->text($indent . "ชื่อร้าน: " . $store['shop_name']);
    //             $printer->text($indent . "เบอร์โทร: " . $store['phone']);
    //             $printer->text($indent . str_repeat("-", 32));
    //             $printer->text($indent . "วันที่: " . Carbon::now()->format('d/m/y'));
    //             $printer->text($indent . "S/N: " . $product['serial_id']);
    //             $printer->text($indent . "สินค้า: " . $product['pid'] . $product['p_name']);
    //             $printer->text($indent . "อาการ: " . $symptom ?? '-');
    //             $printer->text($indent . "ผู้รับงาน: " . $user_key['name']);
    //             $printer->text($indent . "อุปกรณ์เสริม: " . $accessory ?? '-');
    //             $printer->text($indent . "หมายเหตุลูกค้า: " . $customer['remark'] ?? '-');
    //             $printer->text($indent . str_repeat("-", 32));
    //             $printer->setJustification(Printer::JUSTIFY_CENTER);
    //             // พิมพ์ QR Code LINE
    //             $printer->qrCode("https://page.line.me/pumpkintools", Printer::QR_ECLEVEL_L, 6);
    //             $printer->feed(1);
    //             $printer->text("@line : pumpkinTools\n");
    //             // ตัดกระดาษ
    //             $printer->cut();

    //             $printer->close();
    //         }


    //     } catch (\Exception $e) {
    //         return view('receiveJob', [
    //             'customer' => $customer ?? null,
    //             'remark' => $remark ?? null,
    //             'product' => $product ?? null,
    //             'accessory' => $accessory ?? null,
    //             'behavior' => $behavior ?? null,
    //             'symptom' => $symptom ?? null,
    //             'user_key' => $user_key ?? null,
    //             'store' => $store ?? null,
    //         ]);
    //     }
    //     return view('receiveJob', [
    //         'customer' => $customer,
    //         'remark' => $remark,
    //         'product' => $product,
    //         'accessory' => $accessory,
    //         'behavior' => $behavior,
    //         'symptom' => $symptom,
    //         'user_key' => $user_key,
    //         'store' => $store,
    //     ]);
    // }

    public function genReCieveSpPdf(Request $request, $job_id): View|Factory|Application|RedirectResponse
    {
        try {
            $customer = CustomerInJob::findByJobId($job_id);
            if (!$customer || !isset($customer['name']) || !isset($customer['phone'])) {
                return redirect()->back()->with('error', "ข้อมูลไม่สมบูรณ์ ไม่พบข้อมูลลูกค้า (Job ID: {$job_id})");
            }
            // 2. ดึงข้อมูลสินค้า
            $product = JobList::query()->where('job_id', $job_id)->first();

            // [CHECK 2] ตรวจสอบว่ามีข้อมูลสินค้าหรือไม่
            if (!$product) {
                return redirect()->back()->with('error', "ไม่พบข้อมูลสินค้า (Job ID: {$job_id})");
            }

            // 3. ดึงข้อมูลส่วนอื่นๆ (ถ้าผ่านจุด Check มาแล้ว แสดงว่าข้อมูลหลักมีครบ)
            $remark = Remark::findByJobId($job_id);
            $symptom = Symptom::findByJobId($job_id);
            $accessory = AccessoriesNote::findByJobId($job_id);
            $behavior = Behavior::query()->where('job_id', $job_id)->first();

            $user_key = User::query()->where('user_code', $product->user_key)->first();

            $store = StoreInformation::query()->where('is_code_cust_id', $product['is_code_key'])->first();

            if (isset($request->print_barigan) && $request->print_barigan == 'on') {
                //เข้าสู่การปริ้น
                $connector = new NetworkPrintConnector(env('VITE_PRINTER_IP'), env('VITE_PRINTER_PORT'), 5);
                $printer = new Printer($connector);
                //ใช้ Raw ESC/POS Command สำหรับภาษาไทย
                $printer->getPrintConnector()->write("\x1b\x74\x12");
                // ตั้งค่าจัดกึ่งกลาง
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->setEmphasis(true);
                $printer->setTextSize(2, 2);
                $printer->text("ศูนย์บริการ PCS\n");
                $printer->setEmphasis(false);
                //barCode
                // เนื้อหา
                $printer->setTextSize(1, 1);
                $printer->text("\n\n");
                $printer->setBarcodeHeight(60);
                $printer->setBarcodeWidth(2);
                // $printer->setBarcodeTextPosition(Printer::BARCODE_TEXT_BELOW);
                $barcode_text = "{B" . $job_id;
                //        $new_code = '001'. substr($job_id, -4);
                //        $barcode_text = "{B" . $new_code;
                $printer->barcode($barcode_text, Printer::BARCODE_CODE128);
                $printer->text("\n\n");
                // เนื้อหา
                $indent = "\n    ";
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->setTextSize(2, 2);
                $printer->text($job_id . "\n");
                $printer->setJustification(Printer::JUSTIFY_LEFT);
                $printer->setTextSize(1, 1);
                $printer->text($indent . "ชื่อร้าน: " . $store['shop_name']);
                $printer->text($indent . "เบอร์โทร: " . $store['phone']);
                $printer->text($indent . str_repeat("-", 32));
                $printer->text($indent . "วันที่: " . Carbon::now()->format('d/m/y'));
                $printer->text($indent . "ชื่อลูกค้า: " . $customer['name']);
                $printer->text($indent . "เบอร์โทรติดต่อ: " . $customer['phone']);
                $printer->text($indent . "S/N: " . $product['serial_id']);
                $printer->text($indent . "สินค้า: " . $product['pid'] . $product['p_name']);
                $printer->text($indent . "อาการ: " . ($symptom ?? '-')); // ใส่ ?? ป้องกัน Error
                $printer->text($indent . "ผู้รับงาน: " . $user_key['name']);
                $printer->text($indent . "อุปกรณ์เสริม: " . ($accessory ?? '-')); // ใส่ ?? ป้องกัน Error
                $printer->text($indent . "หมายเหตุลูกค้า: " . ($customer['remark'] ?? '-')); // ใส่ ?? ป้องกัน Error
                $printer->text($indent . "หมายเหตุภายในศูนย์ซ่อม: " . $remark);
                $printer->text($indent . str_repeat("-", 32));
                $printer->feed(1);

                // ตัดกระดาษ
                $printer->cut();


                // ตั้งค่าจัดกึ่งกลาง
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->setEmphasis(true);
                $printer->setTextSize(2, 2);
                $printer->text("ศูนย์บริการ PCS\n");
                $printer->text("สำหรับลูกค้า\n");
                $printer->setEmphasis(false);
                // เนื้อหา
                $printer->setTextSize(1, 1);
                $printer->text("\n\n");
                $printer->setBarcodeHeight(60);
                $printer->setBarcodeWidth(2);
                //        $printer->setBarcodeTextPosition(Printer::BARCODE_TEXT_BELOW);
                $barcode_text = "{B" . $job_id;
                $printer->barcode($barcode_text, Printer::BARCODE_CODE128);
                $printer->text("\n\n");
                $indent = "\n    ";
                $printer->setTextSize(2, 2);
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->text($job_id . "\n");
                $printer->setTextSize(1, 1);
                $printer->setJustification(Printer::JUSTIFY_LEFT);
                $printer->text($indent . "ชื่อร้าน: " . $store['shop_name']);
                $printer->text($indent . "เบอร์โทร: " . $store['phone']);
                $printer->text($indent . str_repeat("-", 32));
                $printer->text($indent . "วันที่: " . Carbon::now()->format('d/m/y'));
                $printer->text($indent . "S/N: " . $product['serial_id']);
                $printer->text($indent . "สินค้า: " . $product['pid'] . $product['p_name']);
                $printer->text($indent . "อาการ: " . ($symptom ?? '-'));
                $printer->text($indent . "ผู้รับงาน: " . $user_key['name']);
                $printer->text($indent . "อุปกรณ์เสริม: " . ($accessory ?? '-'));
                $printer->text($indent . "หมายเหตุลูกค้า: " . ($customer['remark'] ?? '-'));
                $printer->text($indent . str_repeat("-", 32));
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                // พิมพ์ QR Code LINE
                $printer->qrCode("https://page.line.me/pumpkintools", Printer::QR_ECLEVEL_L, 6);
                $printer->feed(1);
                $printer->text("@line : pumpkinTools\n");
                // ตัดกระดาษ
                $printer->cut();

                $printer->close();
            }

            // 5. ส่งข้อมูลไปที่ View (ถ้าทุกอย่างผ่าน)
            return view('receiveJob', [
                'customer' => $customer,
                'remark' => $remark,
                'product' => $product,
                'accessory' => $accessory,
                'behavior' => $behavior,
                'symptom' => $symptom,
                'user_key' => $user_key,
                'store' => $store,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาด: ' . $e->getMessage());
        }
    }
}
