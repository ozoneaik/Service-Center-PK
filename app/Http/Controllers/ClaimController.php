<?php

namespace App\Http\Controllers;


use App\Http\Requests\ClaimRequest;
use App\Models\SparePartWarranty;
use Illuminate\Http\JsonResponse;

class ClaimController extends Controller
{
    public function store(ClaimRequest $request): JsonResponse
    {
        $selected = $request->input('selected');
        foreach ($selected as $key => $claim) {
            foreach ($claim['detail'] as $k => $value) {
                SparePartWarranty::query()->where('job_id', $value['job_id'])
                    ->where('sp_code', $value['sp_code'])->update([
                        'status' => 'success',
                    ]);
            }
        }
        return response()->json([
            'message' => 'success'
        ]);
    }

    public function history() : JsonResponse{
        return response()->json([
           'message' => 'success'
        ]);
    }
}
