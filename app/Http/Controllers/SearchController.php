<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\Remark;
use App\Models\SparePart;
use App\Models\SparePartWarranty;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
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
                    $searchResults['status'] !== 'SUCCESS' ?? throw new \Exception('ไม่พบ้อมูล');
                $searchResults['assets'][0]['selected']['behavior'] = $this->BehaviorSelected($request->sn);
                $searchResults['assets'][0]['selected']['remark'] = $this->RemarkSelected($request->sn);
                $sp = $this->SpSelected($request->sn);
                $searchResults['assets'][0]['selected']['sp_warranty'] = $sp['sp_warranty'];
                $searchResults['assets'][0]['selected']['sp'] = $sp['sp'];
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

    private function BehaviorSelected($sn): Collection
    {
        return Behavior::query()
            ->where('serial_id', $sn)
            ->select(
                'id',
                'catalog',
                'sub_catalog as subcatalog',
                'behavior_name as behaviorname',
                'cause_code as causecode',
                'cause_name as causename',
                'created_at',
                'updated_at'
            )
            ->get();
    }

    private function RemarkSelected($sn)
    {
        $remark = Remark::query()->where('serial_id', $sn)->first();
        return $remark->remark;
    }

    private function SpSelected($sn): array
    {
        $warranty = SparePartWarranty::query()->where('serial_id', $sn)
            ->select(
                'sp_code as spcode',
                'sp_name as spname',
                'price_per_unit',
                'qty',
                'created_at', 'updated_at'
            )->get();
        $not_warranty = SparePart::query()->where('serial_id', $sn)
            ->select(
                'sp_code as spcode',
                'sp_name as spname',
                'price_per_unit',
                'qty',
                'created_at', 'updated_at'
            )->get();
        return [
            'sp_warranty' => $warranty,
            'sp' => $not_warranty,
        ];
    }
}
