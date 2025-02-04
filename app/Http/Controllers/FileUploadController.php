<?php

namespace App\Http\Controllers;

use App\Models\FileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileUploadController extends Controller
{
    public function list($serial_id): JsonResponse
    {
        try {
            $data = FileUpload::query()->where('serial_id', $serial_id)->get();
            return response()->json([
                'message' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'data' => []
            ], 400);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'message' => 'success',
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 400);
        }
    }

    private function UploadFile(){

    }
}
