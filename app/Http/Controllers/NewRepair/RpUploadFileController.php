<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Models\MenuFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RpUploadFileController extends Controller
{
    public function detail(Request $request): JsonResponse
    {
        $job_id = $request->get('job_id');
        $menu_claims = MenuFileUpload::query()->where('group', 'ภาพประกอบสำหรับการเคลม')->orderBy('id')->get();
        $menu_repairs = MenuFileUpload::query()->where('group', 'สำหรับศูนย์ซ่อมใช้ภายใน')->orderBy('id')->get();
        return response()->json([
            'message' => "upload file $job_id",
            'menu_claims' => $menu_claims,
            'menu_repairs' => $menu_repairs,
        ]);
    }
}
