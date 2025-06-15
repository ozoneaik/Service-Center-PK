<?php

namespace App\Http\Controllers;

use App\Models\AccessoriesNote;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\Remark;
use App\Models\StoreInformation;
use App\Models\Symptom;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

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

        $user_key = User::query()->where('user_code',$product->user_key)->first();

        $store = StoreInformation::query()->where('is_code_cust_id',$product['is_code_key'])->first();

        return view('receiveJob',[
            'customer' => $customer,
            'remark' => $remark,
            'product' => $product,
            'accessory' => $accessory,
            'behavior' => $behavior,
            'symptom' => $symptom,
            'user_key' => $user_key,
            'store' => $store,
        ]);
//        return Inertia::render('ReportRepair/ReceiveSpPdf', ['job' => $job, 'behaviors' => $behaviorToString]);
    }
}

//        logStamp::query()->create(['description' => Auth::user()->user_code . " ได้ดูใบรับสินค้า $job_id"]);
//        $job = JobList::query()->where('job_id', $job_id)
//            ->leftJoin('users', 'users.user_code', '=', 'job_lists.user_key')
//            ->leftJoin('store_information as store', 'store.is_code_cust_id', '=', 'users.is_code_cust_id')
//            ->select(
//                'job_lists.*', 'users.name as username', 'users.user_code', 'store.*',
//            )
//            ->first();
////        dd($job['address']);
//        $job['address'] = htmlspecialchars_decode($job['address']);
//        $behaviors = Behavior::query()->where('job_id', $job_id)->get();
//        $symptom = Symptom::query()->where('job_id', $job_id)->first();
//        $job['symptom'] = $symptom->symptom;
//        $behaviorToString = '';
//        foreach ($behaviors as $key => $behavior) {
//            if ($key === 0) {
//                $behaviorToStr
////                $behaviorToing = $behaviorToString . $behavior->cause_name;
//            } else {String = $behaviorToString . ' / ' . $behavior->cause_name;
//            }
//        }
