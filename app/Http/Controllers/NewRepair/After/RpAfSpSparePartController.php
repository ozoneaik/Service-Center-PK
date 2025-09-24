<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\CustomerInJob;
use App\Models\SparePart;
use App\Models\StockSparePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RpAfSpSparePartController extends Controller
{
    public function index(Request $request)
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');
        $spare_parts = SparePart::findByJobId($job_id);

        return response()->json([
            'message' => 'success',
            'job_id' => $job_id,
            'serial_id' => $serial_id,
            'spare_parts' => $spare_parts,
        ]);
    }

    public function store(Request $request)
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');
        $spare_parts = $request->get('spare_parts');


        try {

            DB::beginTransaction();

            // ลบอันเก่า
            SparePart::query()->where('job_id', $job_id)->delete();

            $created = [];
            // สร้างใหม่
            foreach ($spare_parts as $key => $spare_part) {
                $claim = $spare_part['claim'] ?? false;
                if (isset($spare_part['warranty']) && $spare_part['warranty'] === 'Y') {
                    $warranty = true;
                } elseif (isset($spare_part['warranty']) && $spare_part['warranty'] === 'N') {
                    $warranty = false;
                } elseif (isset($spare_part['sp_warranty']) && $spare_part['sp_warranty'] === 'Y') {
                    $warranty = true;
                } elseif (isset($spare_part['sp_warranty']) && $spare_part['sp_warranty'] === 'N') {
                    $warranty = false;
                } else {
                    $warranty = false;
                }
                $created[$key] = SparePart::query()->create([
                    'serial_id' => $serial_id,
                    'job_id' => $job_id,
                    'sp_code' => $spare_part['spcode'],
                    'sp_name' => $spare_part['spname'],
                    'price_per_unit' => floatval($spare_part['price_per_unit'] ?? 0),
                    'stdprice_per_unit' => floatval($spare_part['stdprice_per_unit'] ?? 0),
                    'gp' => $spare_part['gp'] ?? 0,
                    //                    'sp_warranty' => $spare_part['sp_warranty'],
                    'sp_warranty' => $warranty,
                    'approve' => $spare_part['approve'] ?? 'no',
                    'approve_status' => $spare_part['approve_status'] ?? 'yes',
                    'price_multiple_gp' => $spare_part['price_multiple_gp'],
                    'qty' => $spare_part['qty'] ?? 0,
                    'sp_unit' => $spare_part['spunit'] ?? 'อัน',
                    'claim' => $spare_part['spcode'] === 'SV001' ? false : $claim,
                    'claim_remark' => ($spare_part['remark_noclaim'] ?? null) === 'เคลมด่วน' ? 'เคลมด่วน' : ($spare_part['claim_remark'] ?? null),
                    'remark' => $spare_part['remark'] ?? null,
                    'remark_noclaim' => $spare_part['remark_noclaim'] ?? null,
                ]);

                $check_stock = StockSparePart::query()->where('sp_code', $spare_part['spcode'])
                    ->where('is_code_cust_id', Auth::user()->is_code_cust_id)
                    ->first();
                if (!$check_stock) {
                    StockSparePart::query()->create([
                        'is_code_cust_id' => Auth::user()->is_code_cust_id,
                        'sp_code' => $spare_part['spcode'],
                        'sp_name' => $spare_part['spname'],
                        'qty_sp' => 0,
                        'old_qty_sp' => 0,
                        'sku_code' => 'ไม่มีข้อมูล',
                        'sku_name' => 'ไม่มีข้อมูล',
                    ]);
                }
            }


            DB::commit();

            // ถ้า job มีการเลือกใบเสนอราคา
            $full_file_path_qu = '';
            $subremark1 = CustomerInJob::findByJobId($job_id);
            if ($subremark1['subremark1']) {
                $create_qu = app()->call('App\Http\Controllers\NewRepair\After\RpAfQuController@store', [
                    'job_id' => $job_id,
                ]);

                $data = json_decode($create_qu->getContent(), true);

                $full_file_path_qu = $data['full_file_path'];
            }
            return response()->json([
                'message' => 'success',
                'error' => null,
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'spare_parts' => $spare_parts,
                'full_file_path_qu' => $full_file_path_qu,
                'created' => $created,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage() . $e->getLine() . $e->getFile(),
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'spare_parts' => $spare_parts,
                'created' => [],
            ], 400);
        }
    }
}
