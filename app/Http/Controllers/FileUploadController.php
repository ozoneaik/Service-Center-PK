<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadFileRequest;
use App\Models\FileUpload;
use App\Models\MenuFileUpload;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class FileUploadController extends Controller
{
    // public function list($serial_id): JsonResponse
    // {
    //     try {
    //         $data = FileUpload::query()->where('serial_id', $serial_id)->get();
    //         return response()->json([
    //             'message' => 'success',
    //             'data' => $data
    //         ]);
    //     } catch (\Exception $exception) {
    //         return response()->json([
    //             'message' => $exception->getMessage(),
    //             'data' => []
    //         ], 400);
    //     }
    // }

    // public function store(UploadFileRequest $request): JsonResponse
    // {
    //     $data = $request;
    //     $serial_id = $data['serial_id'];
    //     $job_id = $data['job_id'];
    //     $list = $data['list'];
    //     $menu = $data['list'];
    //     $keep = [];
    //     $count = 0;
    //     foreach ($menu as $mk => $m) {
    //         if (isset($m['list'])) {
    //             foreach ($m['list'] as $k => $l) {
    //                 if (isset($l['file_path'])) {
    //                     $keep[$count] = $l['id'];
    //                 }
    //                 $count++;
    //             }
    //         }
    //     }
    //     $this->deleteFile($job_id, $keep);
    //     if (isset($list) && count($list) > 0) {
    //         foreach ($list as $key => $file) {
    //             foreach ($file['list'] as $key1 => $file1) {
    //                 if (isset($file1['image']) && $file1['image']->isValid()) {
    //                     // ตั้งชื่อไฟล์ใหม่ (สามารถเปลี่ยนแปลงได้)
    //                     $fileName = time() . rand(0, 9999) . '_' . $file1['image']->getClientOriginalName();
    //                     // บันทึกไฟล์ในโฟลเดอร์ public/uploads
    //                     $filePath = $file1['image']->storeAs('uploads', $fileName, 'public');
    //                     // แสดง path ของไฟล์ที่ถูกบันทึก
    //                     FileUpload::query()->create([
    //                         'job_id' => $job_id,
    //                         'menu_id' => $menu[$key]['id'],
    //                         'file_path' => $filePath,
    //                         'serial_id' => $serial_id
    //                     ]);
    //                 }
    //             }
    //         }
    //     }
    //     $new_data = $this->FileSelected($job_id);
    //     return response()->json([
    //         'message' => 'success',
    //         'data' => $new_data
    //     ]);
    // }

    // private function deleteFile($job_id, $keep): void
    // {
    //     FileUpload::query()->where('job_id', $job_id)->whereNotIn('id', $keep)->delete();
    // }

    // private function FileSelected($job_id): Collection
    // {
    //     $lists = MenuFileUpload::query()->select('menu_name', 'id')->get();
    //     foreach ($lists as $list) {
    //         $files = FileUpload::query()->where('job_id', $job_id)->where('menu_id', $list->id)->get();
    //         $list['list'] = $files;
    //     }
    //     return $lists;
    // }

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

    public function store(UploadFileRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $serial_id = $data['serial_id'] ?? null;
            $job_id = $data['job_id'] ?? null;

            // ตรวจสอบว่ามี key 'list' หรือไม่
            $list = $data['list'] ?? [];
            $menu = $data['list'] ?? [];

            if (empty($serial_id) || empty($job_id)) {
                return response()->json([
                    'message' => 'Missing required fields: serial_id or job_id',
                    'data' => []
                ], 400);
            }

            $keep = [];
            $count = 0;

            foreach ($menu as $mk => $m) {
                if (isset($m['list']) && is_array($m['list'])) {
                    foreach ($m['list'] as $k => $l) {
                        if (isset($l['file_path'])) {
                            $keep[$count] = $l['id'];
                        }
                        $count++;
                    }
                }
            }

            $this->deleteFile($job_id, $keep);

            if (!empty($list)) {
                foreach ($list as $key => $file) {
                    if (isset($file['list']) && is_array($file['list'])) {
                        foreach ($file['list'] as $key1 => $file1) {
                            if (isset($file1['image']) && $file1['image']->isValid()) {
                                // ตั้งชื่อไฟล์ใหม่ (สามารถเปลี่ยนแปลงได้)
                                $fileName = time() . rand(0, 9999) . '_' . $file1['image']->getClientOriginalName();
                                // บันทึกไฟล์ในโฟลเดอร์ public/uploads
                                $filePath = $file1['image']->storeAs('uploads', $fileName, 'public');

                                // ตรวจสอบว่า menu[$key]['id'] มีค่าหรือไม่
                                if (!isset($menu[$key]['id'])) {
                                    throw new \Exception("Menu ID is missing for index: {$key}");
                                }

                                // แสดง path ของไฟล์ที่ถูกบันทึก
                                FileUpload::query()->create([
                                    'job_id' => $job_id,
                                    'menu_id' => $menu[$key]['id'],
                                    'file_path' => $filePath,
                                    'serial_id' => $serial_id
                                ]);
                            }
                        }
                    }
                }
            }

            $new_data = $this->FileSelected($job_id);
            return response()->json([
                'message' => 'บันทึกข้อมูลสำเร็จ',
                'data' => $new_data
            ]);
        } catch (\Exception $exception) {
            // Log the exception for debugging
            Log::error('File upload error: ' . $exception->getMessage());

            return response()->json([
                'message' => 'Error: ' . $exception->getMessage(),
                'data' => []
            ], 500);
        }
    }

    private function deleteFile($job_id, $keep): void
    {
        // ป้องกันการลบไฟล์ทั้งหมด หากไม่มีไฟล์ที่ต้องการเก็บ
        if (empty($keep)) {
            return;
        }

        FileUpload::query()->where('job_id', $job_id)->whereNotIn('id', $keep)->delete();
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
