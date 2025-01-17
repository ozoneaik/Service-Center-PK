<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class fetchApiController extends Controller
{
    public function getDetail (Request $request){
        $request->validate(['serialNumber' => 'required'],['serialNumber.required' => 'Serial Number is required']);
        $url = \env('API_GET_DETAIL');
        $response = Http::post($url, [
            'sn' => $request->serialNumber,
            'views' => 'single'
        ]);
        if ($response->successful()) {
            // ส่ง Response กลับในรูปแบบ JSON
            return response()->json($response->json());
        }
    
        // กรณีเกิดข้อผิดพลาด
        return response()->json([
            'error' => 'Failed to fetch details.',
            'details' => $response->body(),
        ], $response->status());
    }
}
