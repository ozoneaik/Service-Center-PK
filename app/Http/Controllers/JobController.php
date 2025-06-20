<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobRequest;
use App\Models\Behavior;
use App\Models\Cart;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\SparePart;
use App\Models\StockSparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{

    public function check(Request $request,$serial_id): JsonResponse
    {
        try {
            $query = JobList::query();
            if ($request->pid){
                $query = $query->where('pid', $request->pid);
            }
            $query->where('serial_id', $serial_id);
            $check = $query->orderBy('id', 'desc')->first();
            if ($check) {
                if ($check->status === 'pending') {
                    $message = 'พบ job กำลังดำเนินการ';
                    return response()->json(['message' => $message,]);
                }elseif ($check->status === 'send') {
                    if ($check->is_code_key !== Auth::user()->is_code_cust_id){
                        $message = 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น';
                        return response()->json(['message' => $message],400);
                    }else{
                        $message = 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin';
                        return response()->json(['message' => $message],400);
                    }

                }
                else {
                    $message = 'serial_id นี้เคยมีการซ่อมไปแล้ว';
                    return response()->json(['message' => $message,], 400);
                }
            } else {
                $message = 'ไม่พบประวัติการซ่อมจากระบบ';
                return response()->json(['message' => $message,], 200);
            }
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 500);
        }

    }

    public function update(JobRequest $request): JsonResponse
    {
        logStamp::query()->create(['description'=>Auth::user()->user_code." พยายามปิดงานซ่อม"]);
        $job_id = $request->input('job_id');
        try {
            DB::beginTransaction();
            $job = JobList::query()->where('job_id', $job_id)->first();
            $findSpApprove = SparePart::query()->where('job_id', $job_id)->get();
            // dd($job);
            foreach ($findSpApprove as $sp) {
                // if (($job->warranty === true) && (($sp->approve == 'yes') && ($sp->approve_status == 'no'))) {
                //     throw new \Exception('ตรวจพบอะไหล่ที่ยังไม่ถูก approve กรุณาตรวจสอบในปุ่มแจ้งเตือน');
                // }
                if ($sp->sp_warranty === true) {
                    $uploadedMenus = FileUpload::query()
                        ->where('job_id', $job_id)
                        ->whereIn('menu_id', [1, 2, 3])
                        ->pluck('menu_id')
                        ->toArray();

                    // ตรวจสอบว่าเมนูที่ต้องมีครบทั้ง 1, 2, 3 ขาดเมนูอะไรไปบ้าง
                    $missingMenus = array_diff([1, 2, 3], $uploadedMenus);

                    if (!empty($missingMenus)) {
                        $missingMenusText = implode(', ', $missingMenus);
                        if ($missingMenusText === '1') $missingMenusText = "สภาพสินค้าก่อนซ่อม";
                        elseif ($missingMenusText === '2') $missingMenusText = "สภาพสินค้าก่อนซ่อม";
                        elseif ($missingMenusText === '3') $missingMenusText = "ภาพอะไหล่ที่เสียส่งเคลม";
                        else $missingMenusText = "ไม่สามารถระบุได้";
                        throw new \Exception("เนื่องจาก job นี้มีการส่งเคลมอะไหล่ กรุณาตรวจสอบข้อมูลสำหรับการเคลมอะไหล่ให้ครบถ้วน ขาดเมนู: {$missingMenusText}");
                    }
                }
            }

            $findBehavior = Behavior::query()->where('job_id', $job_id)->get();
            $findUploadFile = FileUpload::query()->where('job_id', $job_id)->get();
            $findSparePart = SparePart::query()->where('job_id', $job_id)->get();
            $findCustomerInJob = CustomerInJob::query()->where('job_id', $job_id)->get();

            if (count($findBehavior) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกฟอร์มอาการอย่างน้อย 1 รายการ');
            } elseif (count($findUploadFile) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกฟอร์มรูปภาพอย่างน้อย 1 รายการ');
            } elseif (count($findSparePart) <= 0) {
                throw new \Exception('จำเป็นต้องเลือกอะไหล่อย่างน้อย 1 รายการ');
            } elseif (count($findCustomerInJob) <= 0) {
                throw new \Exception('จำเป็นต้องกรอกข้อมูลลูกค้า');
            }

            $spareParts = SparePart::query()->where('job_id', $job_id)->get();
            foreach ($spareParts as $item) {
                $checkStock = StockSparePart::query()
                    ->where('is_code_cust_id',Auth::user()->is_code_cust_id)
                    ->where('sp_code', $item['sp_code'])
                    ->first();
                if ($checkStock) {
                    if ($checkStock->qty_sp <= 0) {
                        Cart::query()
                            ->where('sku_code', $job['pid'])
                            ->where('remark','มาจากแจ้งซ่อม เนื่องจาก stock เป็น 0')
                            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                            ->where('sp_code', $item['sp_code'])->delete();
                        Cart::query()->create([
                            'is_code_cust_id' => Auth::user()->is_code_cust_id,
                            'user_code_key' => Auth::user()->user_code,
                            'sku_code' => $job['pid'],
                            'sku_name' => $job['p_name'],
                            'sp_code' => $item['sp_code'],
                            'sp_name' => $item['sp_name'],
                            'price_per_unit' => floatval($item['price_per_unit'] ?? 0),
                            'qty' => 1,
                            'sp_unit' => $item['sp_unit'],
                            'remark' => 'มาจากแจ้งซ่อม เนื่องจาก stock เป็น 0',
                        ]);
                    }else{
                        $StockSp = StockSparePart::query()
                            ->where('sp_code', $item['sp_code'])
                            ->where('is_code_cust_id',Auth::user()->is_code_cust_id)
                            ->first();
                        $StockSp->qty_sp = $StockSp->qty_sp - $item['qty'];
                        $StockSp->save();
                    }
                } else {
                    if ($item['sp_code'] !== 'SV001') {
                        Cart::query()
                            ->where('sku_code', $job['pid'])
                            ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                            ->where('sp_code', $item['sp_code'])->delete();
                        Cart::query()->create([
                            'is_code_cust_id' => Auth::user()->is_code_cust_id,
                            'user_code_key' => Auth::user()->user_code,
                            'sku_code' => $job['pid'],
                            'sku_name' => $job['p_name'],
                            'sp_code' => $item['sp_code'],
                            'sp_name' => $item['sp_name'],
                            'price_per_unit' => floatval($item['price_per_unit'] ?? 0),
                            'qty' => 1,
                            'sp_unit' => $item['spunit'] ?? 'อัน',
                            'remark' => 'มาจากแจ้งซ่อม เนื่องจาก stock เป็น 0',
                        ]);
                    }
                }
            }


            $job = JobList::query()->where('job_id', $job_id)->update(['status' => 'success']);
            $message = 'ปิดงานซ่อมสำเร็จ';
            $status = 200;
            logStamp::query()->create(['description'=>Auth::user()->user_code." ปิดงานซ่อมสำเร็จ"]);
            DB::commit();
        } catch (\Exception $e) {
            $status = 400;
            $message = $e->getMessage();
            DB::rollBack();
        } finally {
            return response()->json([
                'message' => $message,
                'job' => $job ?? [],
            ], $status);
        }
    }


    public function cancelJob($serial_id): JsonResponse
    {
        try {
            logStamp::query()->create(['description'=>Auth::user()->user_code." พยายามยกเลิกงานซ่อม"]);
            DB::beginTransaction();
            $job = JobList::query()->where('job_id', $serial_id)->first();
            if ($job->status === 'canceled') {
                throw new \Exception('จ็อบนี้เคยยกเลิกไปแล้ว');
            } else {
                $job->status = 'canceled';
                $job->save();
            }
            logStamp::query()->create(['description'=>Auth::user()->user_code." ยกเลิกงานซ่อมสำเร็จ"]);
            DB::commit();
            return response()->json([
                'message' => 'ยกเลิกการซ่อมสำเร็จ',
                'job' => $job ?? [],
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();
            return response()->json([
                'job' => [],
                'message' => $exception->getMessage(),
            ], 400);
        }

    }
}
