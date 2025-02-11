<?php

namespace App\Http\Controllers;


use App\Http\Requests\ClaimRequest;
use App\Models\Claim;
use App\Models\SparePartWarranty;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ClaimController extends Controller
{
    public function store(ClaimRequest $request): JsonResponse
    {

        $claim_id = 'C-' . Carbon::now()->timestamp;
        $selected = $request->input('selected');
        DB::beginTransaction();
        try {
            foreach ($selected as $key => $claim) {
                foreach ($claim['detail'] as $k => $value) {
                    $sp = SparePartWarranty::query()
                        ->where('job_id', $value['job_id'])
                        ->where('sp_code', $value['sp_code'])->first();
                    $sp->update(['status' => 'success']);
                    Claim::query()->create([
                        'claim_id' => $claim_id,
                        'serial_id' => $sp['serial_id'],
                        'job_id' => $sp['job_id'],
                        'sp_code' => $sp->sp_code,
                        'claim_submit_date' => Carbon::now(),
                        'qty' => $sp->qty,
                        'unit' => $sp->sp_unit,
                    ]);
                }
            }
            DB::commit();
            return response()->json([
                'message' => 'success'
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();
            return response()->json([
                'message' => $exception->getMessage()
            ], 400);
        }
    }

    public function history(): JsonResponse
    {
        return response()->json([
            'message' => 'success'
        ]);
    }
}
