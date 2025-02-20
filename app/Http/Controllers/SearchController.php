<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\JobList;
use App\Models\MenuFileUpload;
use App\Models\Remark;
use App\Models\SparePart;
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
                $status = $searchResults['status'];
                if ($searchResults['status'] === 'Fail') {
                    throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $request->sn);
                }
                $searchResults = $searchResults['assets'][0];
                $searchResults['job'] = $this->storeJob($searchResults);
                $job_id = $searchResults['job']['job_id'];
                $searchResults['selected']['behavior'] = $this->BehaviorSelected($job_id);
                $searchResults['selected']['remark'] = $this->RemarkSelected($job_id);
                $searchResults['selected']['fileUpload'] = $this->FileSelected($job_id);
                $searchResults['selected']['globalGP'] = 10;
                $searchResults['selected']['customerInJob'] = $this->CustomerInJob($searchResults['job']['job_id']) ?? [];
                $sp = $this->SpSelected($job_id);
                $searchResults['selected']['sp_warranty'] = $sp['sp_warranty'];
                $searchResults['selected']['sp'] = $sp['sp'];
            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }
            return response()->json([
                'status' => $status,
                'searchResults' => $searchResults,
                'message' => 'success',
                'time' => Carbon::now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'Fail',
                'searchResults' => [],
                'message' => $e->getMessage(),
                'time' => Carbon::now()
            ], 400);
        }
    }

    private function BehaviorSelected($job_id): Collection
    {
        return Behavior::query()
            ->where('job_id', $job_id)
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

    private function RemarkSelected($job_id)
    {
        $remark = Remark::query()->where('job_id', $job_id)->first();
        return $remark ? $remark->remark : '';
    }

    private function SpSelected($job_id): array
    {
        $sp = SparePart::query()->where('job_id', $job_id)
            ->select(
                'sp_code as spcode',
                'sp_name as spname',
                'price_per_unit',
                'qty',
                'gp',
                'price_multiple_gp',
                'sp_warranty as warranty',
                'created_at', 'updated_at'
            )->get();
        $sp_warranty = SparePart::query()->where('job_id', $job_id)->where('sp_warranty', true)
            ->select(
                'sp_code as spcode',
                'sp_name as spname',
                'price_per_unit',
                'qty',
                'gp',
                'price_multiple_gp',
                'sp_warranty as warranty',
                'created_at', 'updated_at'
            )->get();
        return [
            'sp' => $sp,
            'sp_warranty' => $sp_warranty
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
                'user_id' => auth()->user()->is_code_cust_id,
                'status' => 'pending',
            ]);
        }
        return $job;
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

    private function CustomerInJob($job_id)
    {
        return CustomerInJob::query()->where('job_id', $job_id)->first();
    }
}
