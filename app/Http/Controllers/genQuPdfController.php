<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\Symptom;
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
                "serial" => $request['serial'],
                "emprepair" => ""
            ];
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
        logStamp::query()->create(['description' => Auth::user()->user_code . " ได้ดูใบรับสินค้า $job_id"]);
        $job = JobList::query()->where('job_id', $job_id)
            ->leftJoin('users', 'users.user_code', '=', 'job_lists.user_key')
            ->leftJoin('store_information as store', 'store.is_code_cust_id', '=', 'users.is_code_cust_id')
            ->select(
                'job_lists.*', 'users.name as username', 'users.user_code', 'store.*',
            )
            ->first();
//        dd($job['address']);
        $job['address'] = htmlspecialchars_decode($job['address']);
        $behaviors = Behavior::query()->where('job_id', $job_id)->get();
        $symptom = Symptom::query()->where('job_id', $job_id)->first();
        $job['symptom'] = $symptom->symptom;
        $behaviorToString = '';
        foreach ($behaviors as $key => $behavior) {
            if ($key === 0) {
                $behaviorToString = $behaviorToString . $behavior->cause_name;
            } else {
                $behaviorToString = $behaviorToString . ' / ' . $behavior->cause_name;
            }
        }
        return Inertia::render('ReportRepair/ReceiveSpPdf', ['job' => $job, 'behaviors' => $behaviorToString]);
    }
}
