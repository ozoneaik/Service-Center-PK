<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\MenuFileUpload;
use App\Models\Remark;
use App\Models\SparePart;
use App\Models\SparePartWarranty;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
                if ($searchResults['status'] === 'Fail') {
                    throw new \Exception('ไม่พบข้อมูลซีเรียล : '.$request->sn);
                }
                $searchResults['assets'][0]['job'] = $this->storeJob($searchResults['assets'][0]);
                $searchResults['assets'][0]['selected']['behavior'] = $this->BehaviorSelected($request->sn);
                $searchResults['assets'][0]['selected']['remark'] = $this->RemarkSelected($request->sn);
                $searchResults['assets'][0]['selected']['fileUpload'] = $this->FileSelected($request->sn);
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
        return $remark ? $remark->remark : '';
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

    private function storeJob($data)
    {
        $job = JobList::query()->where('serial_id', $data['serial'])->first();
        if (!$job) {
            $job = JobList::query()->create([
                'serial_id' => $data['serial'],
                'job_id' => "JOB-" . Carbon::now()->timestamp,
                'pid' => $data['pid'],
                'p_name' => $data['pname'],
                'p_base_unit' => $data['pbaseunit'],
                'p_cat_id' => $data['pcatid'],
                'p_cat_name' => $data['pCatName'],
                'p_sub_cat_name' => $data['pSubCatName'],
                'fac_model' => $data['facmodel'],
                'image_sku' => $data['imagesku'],
                'user_id' => \auth()->user()->is_code_cust_id,
                'status' => 'pending',
            ]);
        } else {
            if ($job->status === 'success') {

            }
        }
        return $job;
    }

    private function FileSelected($sn): Collection
    {
        $lists = MenuFileUpload::query()->select('menu_name', 'id')->get();
        foreach ($lists as $list) {
            $files = FileUpload::query()->where('serial_id', $sn)->where('menu_id', $list->id)->get();
            $list['list'] = $files;
        }
        return $lists;
    }
}
