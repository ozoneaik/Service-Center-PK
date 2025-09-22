<?php

namespace App\Http\Controllers\Stocks;

use App\Http\Controllers\Controller;
use App\Models\StockJob;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
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
        $query = StockJob::query();

        if ($request->filled('searchJob')) {
            $query->where('stock_job_id', $request->searchJob);
        }

        if ($request->filled('searchJobStatus')) {
            $query->where('job_status', $request->searchJobStatus);
        }

        $jobs = $query
            ->where('stock_jobs.is_code_cust_id', Auth::user()->is_code_cust_id)
            ->leftJoin('users', 'users.is_code_cust_id', '=', 'stock_jobs.is_code_cust_id')
            ->select('stock_jobs.*', 'users.name as user_name')
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
        if ($is_code_cust_id !== Auth::user()->is_code_cust_id) {
            abort(403);
        }
        $job = StockJob::query()->where('stock_job_id', $stock_job_id)->first();
        $new_job_id = $stock_job_id;
        $job_detail = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->get();
        return Inertia::render('Stores/StockSp/CreateStockJob', [
            'new_job_id' => $new_job_id,
            'job' => $job,
            'job_type' => $job->type === 'เพิ่ม' ? 'add' : 'remove',
            'sp_list' => $job_detail
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
                } elseif ($stock_sp && $job['type'] === 'ลด') {
                    $stock_sp->qty_sp -= $detail->sp_qty;
                }
                $stock_sp->save();
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
            StockJob::query()->where('stock_job_id', $req['job_id'])->delete();
            StockJobDetail::query()->where('stock_job_id', $req['job_id'])->delete();

            $store_stock_job = StockJob::query()->create([
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

    public function detailReadonly($stock_job_id = null)
    {
        $job = StockJob::query()->where('stock_job_id', $stock_job_id)->first();
        $job_detail = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->get();
        if ($job && $job_detail && $job_detail[0]['is_code_cust_id'] === Auth::user()->is_code_cust_id) {
            return Inertia::render('Stores/StockSp/StockJobDetailReadonly', [
                'job' => $job,
                'job_detail' => $job_detail
            ]);
        } else {
            abort(403);
        }
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
