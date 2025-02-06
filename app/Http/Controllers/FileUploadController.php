<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadFileRequest;
use App\Models\FileUpload;
use Illuminate\Http\JsonResponse;

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
                'message' => $exception->geextMessage(),
                'data' => []
            ], 400);
        }
    }

    public function store(UploadFileRequest $request)
    {
        $list = $request->file('list');
        $menu = $request->input('list');
        dump($list);
    }

    private function UploadFile($files){

    }
}
