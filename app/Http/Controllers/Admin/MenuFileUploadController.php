<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuFileUploadController extends Controller
{
    public function show() : JsonResponse
    {
        return response()->json([
            'list' => MenuFileUpload::query()->orderBy('id')->get()
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate(['menu_name' => 'required']);
            $create = MenuFileUpload::query()->create([
                'menu_name' => $request->menu_name
            ]);
            return response()->json([
                'message' => 'บันทึกข้อมูลสำเร็จ',
                'newMenu' => $create
            ]);
        }catch (\Exception $exception){
            return response()->json([
                'message' => $exception->getMessage()
            ]);
        }
    }

    public function update($id,Request $request): JsonResponse
    {
        $request->validate(['menu_name' => 'required']);
        $update = MenuFileUpload::query()->findOrFail($id);
        $update->update([
           'menu_name' => $request->menu_name
        ]);

        return response()->json([
            'message' => 'update successfully',
            'updateMenu' => $update
        ]);
    }

    public function destroy($id): JsonResponse{
        $delete = MenuFileUpload::query()->findOrFail($id)->delete();
        return response()->json([
            'message' => 'delete successfully',
            'deleteMenu' => $delete
        ]);
    }
}
