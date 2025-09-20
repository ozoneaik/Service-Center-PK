<?php

namespace App\Http\Controllers\Utils;

use App\Http\Controllers\Controller;
use App\Models\SubBase\DataFile;
use Illuminate\Http\Request;

class SparePartDetailController extends Controller
{
    public function detail($skusp)
    {
        try {
            $spare_part = DataFile::query()->where('skusp', $skusp)->select('skusp', 'skuspname', 'skuspunit')->first();
            if ($spare_part) {
                return response()->json([
                    'message' => 'ดึงรายการสําเร็จ',
                    'spare_part' => $spare_part
                ]);
            }else{
                throw new \Exception('ไม่พบรายการอะไหล่');
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'spare_part' => []
            ],400);
        }
    }
}
