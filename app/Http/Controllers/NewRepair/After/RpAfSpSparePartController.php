<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Dflydev\DotAccessData\Data;
use Illuminate\Http\Request;
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
            foreach ($spare_parts as $key=>$spare_part) {
                $created[$key] = SparePart::query()->create([
                    'serial_id' => $serial_id,
                    'job_id' => $job_id,
                    'sp_code' => $spare_part['spcode'],
                    'sp_name' => $spare_part['spname'],
                    'price_per_unit' => floatval($spare_part['price_per_unit'] ?? 0),
                    'gp' => $spare_part['gp'] ?? 0,
                    'sp_warranty' => $spare_part['sp_warranty'],
                    'approve' => $spare_part['approve'] ?? 'no',
                    'approve_status' => $spare_part['approve_status'] ?? 'yes',
                    'price_multiple_gp' => $spare_part['price_multiple_gp'],
                    'qty' => $spare_part['qty'] ?? 0,
                    'sp_unit' => $spare_part['spunit'] ?? 'อัน',
                    'claim' => $spare_part['spcode'] === 'SV001' ? false : (bool)$spare_part['claim'],
                    'claim_remark' => $spare_part['claim_remark'] ?? null,
                    'remark' => $spare_part['remark'] ?? null,
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'success',
                'error' => null,
                'job_id' => $job_id,
                'serial_id' => $serial_id,
                'spare_parts' => $spare_parts,
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
