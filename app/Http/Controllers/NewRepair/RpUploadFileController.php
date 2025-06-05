<?php

namespace App\Http\Controllers\NewRepair;

use App\Http\Controllers\Controller;
use App\Models\FileUpload;
use App\Models\MenuFileUpload;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RpUploadFileController extends Controller
{
    public function detail(Request $request): JsonResponse
    {
        $job_id = $request->get('job_id');
//        $menu_claims = MenuFileUpload::query()->where('group', 'ภาพประกอบสำหรับการเคลม')->orderBy('id')->get();
//        $menu_repairs = MenuFileUpload::query()->where('group', 'สำหรับศูนย์ซ่อมใช้ภายใน')->orderBy('id')->get();
        $file_upload = $this->FileSelected($job_id);
        return response()->json([
            'message' => "upload file $job_id",
            'file_upload' => $file_upload,
        ]);
    }

    private function FileSelected($job_id): Collection
    {
        $lists = MenuFileUpload::query()->select('menu_name', 'id')->get();
        foreach ($lists as $list) {
            $files = FileUpload::query()->where('job_id', $job_id)->where('menu_id', $list->id)->get();
            $list['list'] = $files;
        }
        return $lists;
    }
}
