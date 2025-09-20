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

    public function create($is_code_cust_id)
    {
        if ($is_code_cust_id !== Auth::user()->is_code_cust_id) {
            abort(403);
        }
        $new_job_id = 'JOB-STOCK' . time() . rand(0, 99999);
        return Inertia::render('Stores/StockSp/CreateStockJob', ['new_job_id' => $new_job_id]);
    }

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

    //    ------------------------------------ sp in job -------------------------------------------------------

    public function addSpInJob(Request $request, $stock_job_id): RedirectResponse
    {
        $validated = $request->validate([
            'sp_code' => 'required|string|max:50',
            'sp_name' => 'required|string|max:255',
            'sp_qty' => 'required|integer|min:0',

        ]);

        try {
            DB::beginTransaction();
            $stockPart = StockJobDetail::query()
                ->where('stock_job_id', $stock_job_id)
                ->where('sp_code', $validated['sp_code'])
                ->first();
            if ($stockPart) {
                $stockPart->update([
                    'is_code_cust_id' => Auth::user()->is_code_cust_id,
                    'user_code_key' => Auth::user()->user_code,
                    'sp_code' => $validated['sp_code'],
                    'sp_name' => $validated['sp_name'],
                    'sp_qty' => $validated['sp_qty'],
                    'updated_at' => now(),
                ]);

                $message = 'อัพเดทข้อมูลอะไหล่เรียบร้อยแล้ว';
            } else {
                StockJobDetail::query()->create([
                    'stock_job_id' => $stock_job_id,
                    'is_code_cust_id' => Auth::user()->is_code_cust_id,
                    'user_code_key' => Auth::user()->user_code,
                    'sp_code' => $validated['sp_code'],
                    'sp_name' => $validated['sp_name'],
                    'sku_code' => $request['sku_code'] ?? 'ไม่ได้ระบุรหัสสินค้า',
                    'sku_name' => $request['sku_name'] ?? 'ไม่ได้ระบุชื่อสินค้า',
                    'sp_qty' => $validated['sp_qty'],
                ]);
                $message = 'เพิ่มข้อมูลอะไหล่เรียบร้อยแล้ว';
            }
            DB::commit();
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('success', $message);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('error', 'ไม่พบข้อมูลที่ต้องการ');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('error', $e->getMessage());
        }
    }

    public function deleteSp($stock_job_id, $sp_code): RedirectResponse
    {
        try {
            $StockJobSp = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->where('sp_code', $sp_code)->first();
            DB::beginTransaction();
            $StockJobSp->delete();
            DB::commit();
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('success', "ลบข้อมูล $sp_code สำเร็จ");
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('error', 'ไม่พบข้อมูลที่ต้องการลบ');
        } catch (\Exception $exception) {
            DB::rollBack();
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('error', $exception->getMessage());
        }
    }

    public function endSpInJob(Request $request, $stock_job_id)
    {
        try {
            $spInJob = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->get();
            $updateStockJob = StockJob::query()->where('stock_job_id', $stock_job_id)->update([
                'job_status' => 'success',
                'closeJobAt' => Carbon::now()
            ]);
            DB::commit();
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('success', 'สำเร็จ');
        } catch (ModelNotFoundException $e) {
            //            dd($e,'ModelNotFoundException');
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('error', 'ไม่พบข้อมูล');
        } catch (\Exception $e) {
            //            dd($e,'Exception');
            return Redirect::route('stockJob.addSp', [$stock_job_id])->with('error', $e->getMessage());
        }
    }

    //    ------------------------------------ sp in job -------------------------------------------------------

    public function delete($stock_job_id): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $store = StockJob::query()->where('stock_job_id', $stock_job_id)->first();
            $store->delete();
            StockJobDetail::query()->where('stock_job_id', $stock_job_id)->delete();
            DB::commit();
            return Redirect::route('stockJob.index')->with('success', 'ลบ job สำเร็จ');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => "ไม่สามารถลบ job $stock_job_id ได้"]);
        }
    }

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
}
