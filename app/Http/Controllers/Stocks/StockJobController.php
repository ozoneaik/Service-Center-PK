<?php

namespace App\Http\Controllers\Stocks;

use App\Http\Controllers\Controller;
use App\Models\JobList;
use App\Models\SparePart;
use App\Models\StockJob;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
use App\Models\StoreInformation;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockJobController extends Controller
{
    // ไปยังหน้่าจัดการส็อก
    public function index(Request $request): Response
    {
        $query = StockJob::query()->where('type', '!=', 'เบิก');

        if ($request->filled('searchJob')) {
            $query->where('stock_job_id', $request->searchJob);
        }

        if ($request->filled('searchJobStatus')) {
            $query->where('job_status', $request->searchJobStatus);
        }

        $jobs = $query
            ->where('stock_jobs.is_code_cust_id', Auth::user()->is_code_cust_id)
            ->leftJoin('users', 'users.user_code', '=', 'stock_jobs.user_code_key')
            ->select(
                'stock_jobs.*',
                'users.name as user_name',
                'stock_jobs.doctype',
                'stock_jobs.ref_doc'
            )
            ->orderBy('stock_jobs.created_at', 'desc')
            ->get();
        foreach ($jobs as $job) {
            $total = StockJobDetail::query()->where('stock_job_id', $job->stock_job_id)->select('id')->get();
            $job->total_qty = count($total) ?? 0;
        }
        return Inertia::render('Stores/StockSp/StockJobs', [
            'jobs' => $jobs,
            'filters' => [
                'searchJob' => $request->searchJob,
                'searchJobStatus' => $request->searchJobStatus
            ]
        ]);
    }

    // ไปยังหน้าสร้าง job สต็อกอะไหล่ โดยสร้างเลข job ไว้ด้วย
    public function create($is_code_cust_id)
    {
        if ($is_code_cust_id !== Auth::user()->is_code_cust_id) {
            abort(403);
        }
        $new_job_id = 'JOB-STOCK' . time() . rand(0, 99999);
        return Inertia::render('Stores/StockSp/CreateStockJob', ['new_job_id' => $new_job_id]);
    }

    // ไปยังหน้าแก้ไข job สต็อกอะไหล่
    public function edit($stock_job_id, $is_code_cust_id)
    {

        $job = StockJob::query()->where('stock_job_id', $stock_job_id)->firstOrFail();
        if ($is_code_cust_id !== Auth::user()->is_code_cust_id) {
            abort(403);
        }

        if (in_array($job->job_status, ['deleted'])) {
            abort(403, "เอกสารสถานะจากการเบิก {$job->job_status} ไม่อนุญาตให้แก้ไข");
        }

        $new_job_id = $stock_job_id;
        $job_detail = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->get();

        $new_job_detail = [];
        foreach ($job_detail as $key_global => $jd) {
            $new_job_detail[$key_global] = $jd->toArray();

            // ✅ ดึงคงเหลือปัจจุบัน
            $sp_count = StockSparePart::query()
                ->where('sp_code', $jd->sp_code)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->value('qty_sp') ?? 0;

            // ✅ ตรวจสอบ job processing ที่ type=เพิ่ม (ยกเว้น job นี้)
            $stock_job_processing_positive_type = StockJob::query()
                ->where('type', 'เพิ่ม')
                ->where('stock_job_id', '!=', $stock_job_id)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('job_status', 'processing')
                ->get();

            $sp_count_already_positive_type = 0;
            foreach ($stock_job_processing_positive_type as $stock_job) {
                $stock_job_detail = StockJobDetail::query()
                    ->where('stock_job_id', $stock_job->stock_job_id)
                    ->where('sp_code', $jd->sp_code)
                    ->first();
                if ($stock_job_detail) {
                    $sp_count_already_positive_type += (int)$stock_job_detail->sp_qty;
                }
            }

            // ✅ ตรวจสอบ job processing ที่ type=ลด (ยกเว้น job นี้)
            $stock_job_processing_nagative_type = StockJob::query()
                ->where('type', 'ลด')
                ->where('stock_job_id', '!=', $stock_job_id)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('job_status', 'processing')
                ->get();

            $sp_count_already_nagative_type = 0;
            foreach ($stock_job_processing_nagative_type as $stock_job) {
                $stock_job_detail = StockJobDetail::query()
                    ->where('stock_job_id', $stock_job->stock_job_id)
                    ->where('sp_code', $jd->sp_code)
                    ->first();
                if ($stock_job_detail) {
                    $sp_count_already_nagative_type += (int)$stock_job_detail->sp_qty;
                }
            }

            // ✅ จำนวนอะไหล่ที่อยู่ระหว่างการซ่อม
            $job_pending = JobList::query()
                ->where('is_code_key', Auth::user()->is_code_cust_id)
                ->where('status', 'pending')
                ->get();

            $count_spare_part_job = 0;
            foreach ($job_pending as $j) {
                $spare_part = SparePart::query()
                    ->where('job_id', $j->job_id)
                    ->where('sp_code', $jd->sp_code)
                    ->first();
                if ($spare_part) {
                    $count_spare_part_job += (int)$spare_part->qty;
                }
            }

            // ✅ คำนวณ stock พร้อมใช้งาน (สูตรเดียวกับ countSp)
            $total_aready = (int)$sp_count - (int)($sp_count_already_nagative_type + $count_spare_part_job) + (int)$sp_count_already_positive_type;

            // ✅ บวกจำนวนของ job ปัจจุบันกลับเข้าไป (ให้ผู้ใช้แก้ไขได้)
            $total_aready += (int)$jd->sp_qty;

            $new_job_detail[$key_global]['count_sp'] = $sp_count;
            $new_job_detail[$key_global]['total_aready'] = $total_aready;
            $new_job_detail[$key_global]['sp_count_already_positive_type'] = $sp_count_already_positive_type;
            $new_job_detail[$key_global]['sp_count_already_nagative_type'] = $sp_count_already_nagative_type;
            $new_job_detail[$key_global]['total_after_total_if_add'] = $total_aready;
            $new_job_detail[$key_global]['total_after_total_if_remove'] = $total_aready;
        }

        return Inertia::render('Stores/StockSp/CreateStockJob', [
            'new_job_id' => $new_job_id,
            'job' => $job,
            'job_type' => $job->type === 'เพิ่ม' ? 'add' : 'remove',
            'sp_list' => $new_job_detail,
            'from' => 'edit'
        ]);
    }



    //อัพเดทสถานะ job สต็อกอะไหล่
    public function update($stock_job_id, Request $request)
    {
        try {
            $req = $request->all();
            if (!isset($req['job_status'])) {
                throw new \Exception('ไม่พบสถานะที่ต้องการอัพเดท');
            }
            DB::beginTransaction();
            $job = StockJob::query()->where('stock_job_id', $stock_job_id)->first();
            $job->job_status = $req['job_status'];

            $job_detail = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->get();
            foreach ($job_detail as $detail) {
                $stock_sp = StockSparePart::query()->where('sp_code', $detail->sp_code)->first();
                if ($stock_sp && $job['type'] === 'เพิ่ม') {
                    $stock_sp->qty_sp += $detail->sp_qty;
                    $stock_sp->save();
                } elseif ($stock_sp && $job['type'] === 'ลด') {
                    $stock_sp->qty_sp -= $detail->sp_qty;
                    $stock_sp->save();
                }
                // if ($stock_sp) {
                //     if ($job['type'] === 'เพิ่ม') {
                //         $stock_sp->qty_sp += $detail->sp_qty;
                //     } elseif ($job['type'] === 'ลด') {
                //         $stock_sp->qty_sp -= $detail->sp_qty;
                //     } elseif ($job['type'] === 'เบิก') {
                //         // ต้องลดสต็อกเหมือนขาลด
                //         $stock_sp->qty_sp -= $detail->sp_qty;
                //     }

                //     $stock_sp->save();
                // }
            }
            $job->save();
            DB::commit();
            $message = 'อัพเดทสถานะเอกสาร ' . $stock_job_id . ' เป็น ' . ($req['job_status'] === 'complete' ? 'ปรับปรุงแล้ว' : $req['job_status']) . ' เรียบร้อย';
            return redirect()->route('stockJob.index', ['is_code_cust_id' => $job->is_code_cust_id])->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return  redirect()->back()->with('error', $e->getMessage());
        }
    }

    // สร้าง job ของ สต็อกอะไหล่
    public function store(Request $request)
    {
        try {
            $req = $request['dataToSave'];
            DB::beginTransaction();
            // StockJob::query()->where('stock_job_id', $req['job_id'])->delete();
            StockJobDetail::query()->where('stock_job_id', $req['job_id'])->delete();

            $store_stock_job = StockJob::query()->updateOrCreate([
                'stock_job_id' => $req['job_id'],
            ], [
                'stock_job_id' => $req['job_id'],
                'is_code_cust_id' => Auth::user()->is_code_cust_id,
                'user_code_key' => Auth::user()->user_code,
                'job_status' => 'processing',
                'type' => $req['job_type'] === 'add' ? 'เพิ่ม' : 'ลด',
            ]);


            if ($store_stock_job) {
                $new_stock_job_detail = [];
                foreach ($req['list'] as $key => $sp) {
                    $new_stock_job_detail[$key] = StockJobDetail::query()->create([
                        'stock_job_id' => $store_stock_job->stock_job_id,
                        'is_code_cust_id' => Auth::user()->is_code_cust_id,
                        'user_code_key' => Auth::user()->user_code,
                        'sp_code' => $sp['sp_code'],
                        'sp_name' => $sp['sp_name'],
                        'sp_qty' => $sp['sp_qty'],
                        'sp_unit' => $sp['sp_unit'] ?? null,
                        'sku_name' => 'ไม่มีข้อมูล',
                        'sku_code' => 'ไม่มีข้อมูล',
                        'total_after_total_if_add' => $sp['total_after_total_if_add'] ?? 0,
                        'total_after_total_if_remove' => $sp['total_after_total_if_remove'] ?? 0
                    ]);
                }
            } else {
                throw new \Exception('เกิดข้อผิดพลาดในการบันทึกข้อมูล store_stock_job');
            }


            // dd($store_stock_job->toArray(),$new_stock_job_detail);
            DB::commit();
            return redirect()->route('stockJob.index')->with('success', 'บันทึกข้อมูลสําเร็จ');
        } catch (\Exception $e) {
            dd($e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
            DB::rollBack();
        }
    }


    // เพิ่มอะไหล่จากการสแกนบิล
    public function bill($barcode): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(10)->post(env('VITE_API_BILL'), [
                'cust' => Auth::user()->is_code_cust_id,
                'bill' => $barcode,
            ]);
            $responseJson = $response->json();
            if ($response->successful()) {
                if ($responseJson['status'] === 'success') {
                    $assets = $responseJson['assets'];
                    $listSp = $assets['listSp'];
                    foreach ($listSp as &$sp) {
                        $sp['default_qty_sp'] = $sp['qty_sp'] ?? 0;
                    }
                    return response()->json([
                        'message' => $responseJson['message'],
                        'barcode' => $barcode,
                        'listSp' => $listSp,
                    ]);
                } else throw new \Exception('ไม่พบหมายเลขบิลนี้ หรือ หมายเลขบิลไม่ตรงกับข้อมูลร้าน');
            } else throw new \Exception('มีปัญหาเกี่ยวกับบิลนี้ กรุณาลองอีกครั้ง');
        } catch (ConnectionException $e) {
            return response()->json([
                'barcode' => $barcode,
                'listSp' => [],
                'message' => 'ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาลองอีกครั้ง',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'barcode' => $barcode,
                'listSp' => [],
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    // ค้นหาข้อมูลอะไหล่
    public function searchSp($sp_code)
    {
        try {
            $response = Http::post(env('VITE_API_ORDER'), [
                'pid' => $sp_code,
                'view' => 'single'
            ]);

            if ($response->successful() && $response->status() === 200) {

                $res_json = $response->json();
                if ($res_json['status'] === 'SUCCESS') {
                    $p_name = $res_json['assets'][0]['pname'];
                } else {
                    throw new \Exception('ไม่พบผลการค้นหา');
                }

                return response()->json([
                    'message' => 'ดึงข้อมูลสำเร็จ',
                    'sp_code' => $sp_code,
                    'sp_name' => $p_name,
                    'error' => null
                ]);
            }
        } catch (\Exception $e) {
            $sp_name = null;
            return response()->json([
                'message' => 'เกิดข้อผิดพลาด',
                'sp_code' => $sp_code,
                'sp_name' => $sp_name,
                'error' => $e->getMessage() . " บรรทัดที่=>" . $e->getLine() . " ไฟล์=>" . $e->getFile()
            ], 400);
        }
    }

    // public function detailReadonly($stock_job_id = null)
    // {
    //     $job = StockJob::query()->where('stock_job_id', $stock_job_id)->first();
    //     $job_detail = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->get();
    //     if ($job && $job_detail && $job_detail[0]['is_code_cust_id'] === Auth::user()->is_code_cust_id) {
    //         return Inertia::render('Stores/StockSp/StockJobDetailReadonly', [
    //             'job' => $job,
    //             'job_detail' => $job_detail
    //         ]);
    //     } else {
    //         abort(403);
    //     }
    // }
    public function detailReadonly($stock_job_id = null)
    {
        $job = StockJob::query()->where('stock_job_id', $stock_job_id)->firstOrFail();
        $raw = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->get();

        if ($raw->isEmpty() || $raw[0]['is_code_cust_id'] !== Auth::user()->is_code_cust_id) {
            abort(403);
        }

        // $details = $raw->map(function ($jd) use ($job) {
        //     $sp_count = StockSparePart::query()
        //         ->where('sp_code', $jd->sp_code)
        //         ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
        //         ->value('qty_sp') ?? 0;

        //     // แยก job processing ขาเพิ่ม ขาลด (ไม่รวม job ปัจจุบัน)
        //     $posJobs = StockJob::query()
        //         ->where('type', 'เพิ่ม')
        //         ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
        //         ->where('job_status', 'processing')
        //         ->where('stock_job_id', '!=', $job->stock_job_id) 
        //         ->get();

        //     $negJobs = StockJob::query()
        //         ->where('type', 'ลด')
        //         ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
        //         ->where('job_status', 'processing')
        //         ->where('stock_job_id', '!=', $job->stock_job_id)
        //         ->get();

        //     $pos = 0;
        //     $neg = 0;
        //     foreach ($posJobs as $j) {
        //         $d = StockJobDetail::query()
        //             ->where('stock_job_id', $j->stock_job_id)
        //             ->where('sp_code', $jd->sp_code)
        //             ->first();
        //         if ($d) $pos += (int)$d->sp_qty;
        //     }
        //     foreach ($negJobs as $j) {
        //         $d = StockJobDetail::query()
        //             ->where('stock_job_id', $j->stock_job_id)
        //             ->where('sp_code', $jd->sp_code)
        //             ->first();
        //         if ($d) $neg += (int)$d->sp_qty;
        //     }

        //     // งานซ่อมค้าง
        //     $pendingJobs = JobList::query()
        //         ->where('is_code_key', Auth::user()->is_code_cust_id)
        //         ->where('status', 'pending')
        //         ->get();

        //     $inRepair = 0;
        //     foreach ($pendingJobs as $pj) {
        //         $sp = SparePart::query()
        //             ->where('job_id', $pj->job_id)
        //             ->where('sp_code', $jd->sp_code)
        //             ->first();
        //         if ($sp) $inRepair += (int)$sp->qty;
        //     }

        //     // สต็อกพร้อมใช้งาน "ก่อน" ปรับครั้งนี้
        //     $available = (int)$sp_count - (int)($neg + $inRepair) + (int)$pos;

        //     // หลังปรับ (เพิ่ม/ลด)
        //     $after = $job->type === 'เพิ่ม'
        //         ? $available + (int)$jd->sp_qty
        //         : $available - (int)$jd->sp_qty;

        //     $arr = $jd->toArray();
        //     $arr['count_sp'] = $sp_count;
        //     $arr['total_aready'] = $available;
        //     $arr['stock_after'] = $after;
        //     return $arr;
        // });

        $details = $raw->map(function ($jd) use ($job) {

            // 1) STOCK จริงจาก stock_spare_part (หลัง complete ทั้งหมดแล้ว)
            $sp_count = StockSparePart::query()
                ->where('sp_code', $jd->sp_code)
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->value('qty_sp') ?? 0;

            // 2) งาน "processing" ประเภท เพิ่ม (ไม่รวมใบปัจจุบัน)
            $posJobs = StockJob::query()
                ->where('type', 'เพิ่ม')
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('job_status', 'processing')
                ->where('stock_job_id', '!=', $job->stock_job_id)
                ->get();

            $pos = 0;
            foreach ($posJobs as $j) {
                $d = StockJobDetail::query()
                    ->where('stock_job_id', $j->stock_job_id)
                    ->where('sp_code', $jd->sp_code)
                    ->first();
                if ($d) $pos += (int)$d->sp_qty;
            }

            // 3) งาน "processing" ประเภท ลด (ไม่รวมใบปัจจุบัน)
            $negJobs = StockJob::query()
                ->where('type', 'ลด')
                ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                ->where('job_status', 'processing')
                ->where('stock_job_id', '!=', $job->stock_job_id)
                ->get();

            $neg = 0;
            foreach ($negJobs as $j) {
                $d = StockJobDetail::query()
                    ->where('stock_job_id', $j->stock_job_id)
                    ->where('sp_code', $jd->sp_code)
                    ->first();
                if ($d) $neg += (int)$d->sp_qty;
            }

            // 4) งานซ่อมที่ pending
            $pendingJobs = JobList::query()
                ->where('is_code_key', Auth::user()->is_code_cust_id)
                ->where('status', 'pending')
                ->get();

            $inRepair = 0;
            foreach ($pendingJobs as $pj) {
                $sp = SparePart::query()
                    ->where('job_id', $pj->job_id)
                    ->where('sp_code', $jd->sp_code)
                    ->first();
                if ($sp) $inRepair += (int)$sp->qty;
            }

            if ($job->job_status === 'complete') {
                // available = stock จริง ณ ตอนนี้
                $available = (int)$sp_count;

                // after = stock จริง ไม่บวกเพิ่มอีก
                $after = (int)$sp_count;
            } else {

                // ใบกำลัง processing → ใช้สูตรปกติ
                $available = (int)$sp_count - (int)$neg - (int)$inRepair + (int)$pos;

                $after = $job->type === 'เพิ่ม'
                    ? $available + (int)$jd->sp_qty
                    : $available - (int)$jd->sp_qty;
            }

            // ส่งค่ากลับไปยังหน้า UI
            $arr = $jd->toArray();
            $arr['count_sp'] = $sp_count;      
            $arr['total_aready'] = $available; 
            $arr['stock_after'] = $after;

            return $arr;
        });

        return Inertia::render('Stores/StockSp/StockJobDetailReadonly', [
            'job' => $job,
            'job_detail' => $details,
            'doc_type'   => $job->doctype,
            'ref_doc'    => $job->ref_doc,
        ]);
    }

    public function delete($stock_job_id)
    {
        try {
            $job = StockJob::query()->where('stock_job_id', $stock_job_id)->first();
            if (!$job) {
                throw new ModelNotFoundException("ไม่พบข้อมูลเอกสารนี้");
            };
            DB::beginTransaction();
            StockJobDetail::query()->where('stock_job_id', $stock_job_id)->delete();
            $job->delete();
            DB::commit();
            return redirect()->route('stockJob.index')->with('success', "ลบเอกสาร " . $job['stock_job_id'] . " เรียบร้อย");
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroy($stock_job_id)
    {
        dd('destroy');
    }
}
