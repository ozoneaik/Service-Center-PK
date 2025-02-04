<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SearchController extends Controller
{
    public function detail(Request $request): JsonResponse
    {
        try {
            $response = Http::post(env('API_DETAIL'), [
                'sn' => $request->sn,
                'views' => $request->views,
            ]);
            if ($response->status() === 200) {
                $searchResults = $response->json();
                if ($searchResults['status'] !== 'SUCCESS') {
                    throw new \Exception('ไม่พบ้อมูล');
                }
            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }
            return response()->json([
                'searchResults' => $searchResults,
                'message' => 'success',
                'time' => Carbon::now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'searchResults' => [],
                'message' => $e->getMessage(),
                'time' => Carbon::now()
            ], 400);
        }
    }

}
