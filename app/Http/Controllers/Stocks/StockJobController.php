<?php

namespace App\Http\Controllers\Stocks;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockJobRequest;
use App\Models\StockJob;
use App\Models\StockJobDetail;
use App\Models\StockSparePart;
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
    public function index(): Response
    {
        $jobs = StockJob::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)->get();
        return Inertia::render('Stores/StockSp/StockJobs', ['jobs' => $jobs]);
    }

    public function addSp($stock_job_id): Response
    {
        $jobDetail = StockJobDetail::query()->where('stock_job_id', $stock_job_id)->orderBy('id', 'desc')->get();
        $stockJob = StockJob::query()->where('stock_job_id',$stock_job_id)->first();
        return Inertia::render('Stores/StockSp/StockJobDetail', [
            'jobDetail' => $jobDetail,
            'stock_job_id' => $stock_job_id,
            'stockJob' => $stockJob,
        ]);
    }

    public function store(StockJobRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $stock_job_id = 'JOB-STOCK' . time() . rand(0, 99999);
            StockJob::query()->create([
                'stock_job_id' => $stock_job_id,
                'is_code_cust_id' => Auth::user()->is_code_cust_id,
                'user_code_key' => Auth::user()->user_code
            ]);
            DB::commit();
            return Redirect::route('stockJob.index')->with('success', 'สร้าง job สำเร็จ');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => 'มีข้อผิดพลาดในการสร้าง job']);
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
            foreach ($spInJob as $sp) {
                $findSp = StockSparePart::query()
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->where('sp_code', $sp->sp_code)
                    ->first();
                if ($findSp) {
                    $findSp->old_qty_sp = $findSp->qty_sp;
                    $findSp->qty_sp = $findSp->qty_sp + $sp->sp_qty;
                    $findSp->update();
                } else {
                    $newSp = StockSparePart::query()->create([
                        'sp_code' => $sp->sp_code,
                        'sku_code' => 'ไม่พบรหัสสินค้า',
                        'sku_name' => 'ไม่พบชื่อสินค้า',
                        'sp_name' => $sp->sp_name,
                        'qty_sp' => $sp->sp_qty,
                        'old_qty_sp' => $sp->sp_qty,
                        'is_code_cust_id' => Auth::user()->is_code_cust_id,
                    ]);
                }
            }
            $updateStockJob = StockJob::query()->where('stock_job_id', $stock_job_id)->update([
                'job_status' => 'success'
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
}
