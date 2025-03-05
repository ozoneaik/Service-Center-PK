<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class genQuPdfController extends Controller
{
    public function genQuPdf(Request $request){
        try {
            $data = [
                'req' => $request['req'],
                "regenqu"=> "Y",
                "typeservice"=> "SC",
                "docqu"=> $request['docqu'],
                "custaddr" => $request['custaddr'],
                'custnamesc' => $request['custnamesc'],
                "sku"=> $request['sku'],
                "assno"=> "",
                "fgcode"=> $request['fgcode'],
                "fgname"=> $request['fgname'],
                "custcode"=> $request['custcode'],
                "custname"=> "custname",
                "docdate"=> "",
                "custtel"=> $request['custtel'],
                "empcode"=> "empcode",
                "empname"=> "empname",
                "remark"=> $request['remark'],
                "cause_remark"=> "",
                "docmt"=> "",
                "serial"=> $request['serial'],
                "emprepair"=> ""
            ];
            $response = Http::post('http://192.168.0.13/genpdf/api/qu_ass',$data);
            if ($response->status() == 200) {
                $Json = $response->json();
                if (gettype($Json) === 'array' && $Json['status']){
                    throw new \Exception($Json['message']);
                }else{
                    $status = 200;
                    $message = "ทำใบ QU สำเร็จ";
                    $pathUrl = trim($response->body(), '"');
                }
            }else{
                throw new \Exception('ไม่สามารถ ทำใบ QU สำเร็จ');
            }
        }catch (\Exception $exception){
            $message = "Error: " . $exception->getMessage() . " on line " . $exception->getLine();
            $status = 400;
            $pathUrl = '';
        }
        finally{
            return response()->json([
                'status' => $status,
                'message' => $message,
                'pathUrl' => $pathUrl,
            ],$status);
        }

    }
}
