<?php

namespace App\Http\Controllers;

use App\Http\Requests\SymptomRequest;
use App\Models\Symptom;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SymptomController extends Controller
{
    public function store(SymptomRequest $request) : JsonResponse{
        $symptom = $request->input('symptom');
        $serial_id = $request->input('serial_id');
        $job_id = $request->input('job_id');
        try {
            DB::beginTransaction();
            Symptom::query()->where('job_id', $job_id)->where('serial_id', $serial_id)->delete();
            $new_symptom = Symptom::query()->create([
                'serial_id' => $serial_id,
                'job_id' => $job_id,
                'symptom' => $symptom,
            ]);
            DB::commit();
            $status = 200;
            $message = 'Symptom added successfully';
        }catch (\Exception $exception){
            DB::rollBack();
            $message = $exception->getMessage();
            $status = 400;
        }finally{
            return response()->json([
                'message' => $message,
                'status' => $status,
                'symptom' => $new_symptom ?? [],
            ],$status);
        }
    }
}
