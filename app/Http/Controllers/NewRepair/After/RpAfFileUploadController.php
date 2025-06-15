<?php

namespace App\Http\Controllers\NewRepair\After;

use App\Http\Controllers\Controller;
use App\Models\FileUpload;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RpAfFileUploadController extends Controller
{
    public function index(Request $request)
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');

        // แก้ไข: เปลี่ยนจาก findByJobIdBefore เป็น findByJobIdAfter หรือใช้ menu_id = 2
        $file_afters = FileUpload::where('job_id', $job_id)
            ->where('menu_id', 2) // menu_id = 2 สำหรับไฟล์หลังซ่อม
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => basename($file->file_path),
                    'size' => 0, // ถ้าต้องการขนาดไฟล์จริง ต้องอ่านจาก storage
                    'type' => $this->getFileTypeFromPath($file->file_path),
                    'full_file_path' => Storage::url($file->file_path),
                    'file_path' => $file->file_path,
                    'created_at' => $file->created_at,
                ];
            });

        return response()->json([
            'message' => 'success',
            'file_afters' => $file_afters,
            'job_id' => $job_id,
            'serial_id' => $serial_id,
        ]);
    }

    public function store(Request $request)
    {
        $job_id = $request->get('job_id');
        $serial_id = $request->get('serial_id');

        // แก้ไข: รับข้อมูล file_uploads จาก JSON string
        $file_uploads_json = $request->get('file_uploads');
        $file_uploads = json_decode($file_uploads_json, true);

        if (!$file_uploads) {
            return response()->json([
                'message' => 'ไม่พบข้อมูลไฟล์',
                'error' => 'Invalid file_uploads data',
            ], 400);
        }

        try {
            $stored_files = [];
            $keep = [];

            // รวบรวม ID ของไฟล์ที่ต้องการเก็บไว้
            foreach ($file_uploads as $key => $file_data) {
                if (isset($file_data['id']) && is_numeric($file_data['id'])) {
                    $keep[] = $file_data['id'];
                }
            }

            // ลบไฟล์ที่ไม่ต้องการ (ไฟล์ที่ไม่อยู่ใน keep list)
            $this->deleteFile($job_id, $keep);

            // ประมวลผลไฟล์แต่ละไฟล์
            foreach ($file_uploads as $key => $file_data) {
                // ตรวจสอบว่าเป็นไฟล์ใหม่หรือไม่
                $uploaded_file = $request->file("file_uploads.{$key}.file");

                if ($uploaded_file && $uploaded_file instanceof UploadedFile) {
                    // ไฟล์ใหม่ที่ต้องอัปโหลด
                    $timestamp = now()->timestamp;
                    $random = rand(1000, 9999);
                    $original_name = pathinfo($uploaded_file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $uploaded_file->getClientOriginalExtension();
                    $new_filename = "{$timestamp}_{$random}_{$original_name}.{$extension}";

                    // บันทึกไฟล์ไปยัง storage/app/public/uploads
                    $file_path = $uploaded_file->storeAs('uploads', $new_filename, 'public');

                    // บันทึกข้อมูลลงฐานข้อมูล
                    $file_record = FileUpload::create([
                        'serial_id' => $serial_id,
                        'job_id' => $job_id,
                        'menu_id' => 2, // 2 = หลังซ่อม
                        'file_path' => $file_path,
                    ]);

                    $stored_files[] = [
                        'id' => $file_record->id,
                        'serial_id' => $serial_id,
                        'job_id' => $job_id,
                        'menu_id' => 2,
                        'file_path' => $file_path,
                        'full_file_path' => Storage::url($file_path),
                        'name' => $new_filename,
                        'original_name' => $uploaded_file->getClientOriginalName(),
                    ];

                    Log::info("File uploaded successfully: {$new_filename}");

                } elseif (isset($file_data['id']) && is_numeric($file_data['id'])) {
                    // ไฟล์เดิมที่มีอยู่แล้ว - เก็บไว้
                    $existing_file = FileUpload::find($file_data['id']);
                    if ($existing_file) {
                        $stored_files[] = [
                            'id' => $existing_file->id,
                            'serial_id' => $existing_file->serial_id,
                            'job_id' => $existing_file->job_id,
                            'menu_id' => $existing_file->menu_id,
                            'file_path' => $existing_file->file_path,
                            'full_file_path' => Storage::url($existing_file->file_path),
                            'name' => basename($existing_file->file_path),
                        ];
                    }
                }
            }

            return response()->json([
                'message' => 'บันทึกไฟล์สำเร็จ',
                'error' => null,
                'stored_files' => $stored_files,
                'total_files' => count($stored_files),
                'job_id' => $job_id,
                'serial_id' => $serial_id,
            ]);

        } catch (\Exception $e) {
            Log::error('File upload error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'job_id' => $job_id,
                'serial_id' => $serial_id,
            ]);

            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการบันทึกไฟล์: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ],
                'job_id' => $job_id,
                'serial_id' => $serial_id,
            ], 500);
        }
    }

    /**
     * ลบไฟล์ที่ไม่ต้องการออกจากฐานข้อมูลและ storage
     */
    private function deleteFile($job_id, $keep): void
    {
        // หาไฟล์ที่ต้องลบ
        $files_to_delete = FileUpload::where('job_id', $job_id)
            ->where('menu_id', 2) // เฉพาะไฟล์หลังซ่อม
            ->when(!empty($keep), function ($query) use ($keep) {
                return $query->whereNotIn('id', $keep);
            })
            ->get();

        foreach ($files_to_delete as $file) {
            // ลบไฟล์จาก storage
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
                Log::info("Deleted file from storage: {$file->file_path}");
            }

            // ลบข้อมูลจากฐานข้อมูล
            $file->delete();
            Log::info("Deleted file record from database: ID {$file->id}");
        }
    }

    /**
     * ระบุประเภทไฟล์จาก path
     */
    private function getFileTypeFromPath($file_path): string
    {
        $extension = pathinfo($file_path, PATHINFO_EXTENSION);
        $extension = strtolower($extension);

        $image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        $video_extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];

        if (in_array($extension, $image_extensions)) {
            return "image/{$extension}";
        } elseif (in_array($extension, $video_extensions)) {
            return "video/{$extension}";
        }

        return 'application/octet-stream';
    }
}
