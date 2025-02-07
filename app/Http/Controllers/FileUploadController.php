<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadFileRequest;
use App\Models\FileUpload;
use App\Models\MenuFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

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
        $serial_id = $request->input('serial_id');
        $list = $request->file('list');
        $menu = $request->input('list');
        $keep = [];
//        dd($list,$menu);
        $count = 0;
        foreach ($menu as $mk=>$m) {
            if(isset($m['list'])){
                foreach ($m['list'] as $k=>$l){
                    if(isset($l['file_path'])){
                        $keep[$count] = $l['id'];
                    }
                    $count++;
                }
            }
        }

        $this->deleteFile($serial_id, $keep);
//        dd($keep); // [4,5]

        if (isset($list) && count($list) > 0){
            foreach ($list as $key=>$file) {
                foreach ($file['list'] as $key1=>$file1) {
                    if (isset($file1['image']) && $file1['image']->isValid()) {
                        // ตั้งชื่อไฟล์ใหม่ (สามารถเปลี่ยนแปลงได้)
                        $fileName = time() . '_' . $file1['image']->getClientOriginalName();

                        // บันทึกไฟล์ในโฟลเดอร์ public/uploads
                        $filePath = $file1['image']->storeAs('uploads', $fileName, 'public');

                        // แสดง path ของไฟล์ที่ถูกบันทึก
                        FileUpload::query()->create([
                            'menu_id' => $menu[$key]['id'],
                            'file_path' => $filePath,
                            'serial_id' => $serial_id
                        ]);
                    }

                }
            }
        }
        $new_data = $this->FileSelected($serial_id);
        return response()->json([
           'message' => 'success',
           'data' => $new_data
        ]);

    }

    private function UploadFile($files){

    }

    private function deleteFile($sn,$keep){
        FileUpload::query()->where('serial_id', $sn)->whereNotIn('id', $keep)->delete();
    }

    private function FileSelected($sn){
        $lists = MenuFileUpload::query()->select('menu_name','id')->get();
        foreach ($lists as $list){
            $files = FileUpload::query()->where('serial_id', $sn)->where('menu_id',$list->id)->get();
            $list['list'] = $files;
        }
        return $lists;
    }
}
