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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;

class genQuPdfController extends Controller
{
    public function genQuPdf(Request $request)
    {
        try {
            $data = [
                "serial" => $request['serial'],
                'req' => $request['req'],
                "regenqu" => "Y",
                "typeservice" => "SC",
                "docqu" => $request['docqu'],
                "custaddr" => $request['custaddr'],
                'custnamesc' => $request['custnamesc'],
                "sku" => $request['sku'],
                "assno" => "",
                "fgcode" => $request['fgcode'],
                "fgname" => $request['fgname'],
                "custcode" => $request['custcode'],
                "custname" => "custname",
                "docdate" => "",
                "custtel" => $request['custtel'],
                "empcode" => $request['empcode'],
                "empname" => $request['empname'],
                "remark" => $request['remark'],
                "cause_remark" => "",
                "docmt" => "",
                "emprepair" => ""
            ];

            $data = array_map(function ($item) {
                return is_string($item) ? mb_convert_encoding($item, 'UTF-8', 'auto') : $item;
            }, $data);


            $response = Http::post('http://192.168.0.13/genpdf/api/qu_ass', $data);
            if ($response->status() == 200) {
                $Json = $response->json();
                if (gettype($Json) === 'array' && $Json['status']) {
                    throw new \Exception($Json['message']);
                } else {
                    $status = 200;
                    $message = "ทำใบ QU สำเร็จ";
                    $pathUrl = trim($response->body(), '"');
                }
            } else {
                throw new \Exception('ไม่สามารถ ทำใบ QU สำเร็จ');
            }
        } catch (\Exception $exception) {
            $message = "Error: " . $exception->getMessage() . " on line " . $exception->getLine();
            $status = 400;
            $pathUrl = '';
        } finally {
            return response()->json([
                'status' => $status,
                'message' => $message,
                'pathUrl' => $pathUrl,
            ], $status);
        }
    }

    public function genReCieveSpPdf($job_id)
    {
        $customer = CustomerInJob::findByJobId($job_id);
        $remark = Remark::findByJobId($job_id);
        $symptom = Symptom::findByJobId($job_id);
        $product = JobList::query()->where('job_id', $job_id)->first();
        $accessory = AccessoriesNote::findByJobId($job_id);
        $behavior = Behavior::query()->where('job_id', $job_id)->first();

        $user_key = User::query()->where('user_code', $product->user_key)->first();

        $store = StoreInformation::query()->where('is_code_cust_id', $product['is_code_key'])->first();


        // เข้าสู่การปริ้น
        $connector = new NetworkPrintConnector(env('VITE_PRINTER_IP'), env('VITE_PRINTER_PORT'));
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
        $printer->text($indent . "อาการ: " . $symptom ?? '-');
        $printer->text($indent . "ผู้รับงาน: " . $user_key['name']);
        $printer->text($indent . "อุปกรณ์เสริม: " . $accessory ?? '-');
        $printer->text($indent . "หมายเหตุลูกค้า: " . $customer['remark'] ?? '-');
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
        $printer->text($indent . "อาการ: " . $symptom ?? '-');
        $printer->text($indent . "ผู้รับงาน: " . $user_key['name']);
        $printer->text($indent . "อุปกรณ์เสริม: " . $accessory ?? '-');
        $printer->text($indent . "หมายเหตุลูกค้า: " . $customer['remark'] ?? '-');
        $printer->text($indent . str_repeat("-", 32));
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        // พิมพ์ QR Code LINE
        $printer->qrCode("https://page.line.me/pumpkintools", Printer::QR_ECLEVEL_L, 6);
        $printer->feed(1);
        $printer->text("@line : pumpkinTools\n");
        // ตัดกระดาษ
        $printer->cut();

        $printer->close();


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
    }
}
