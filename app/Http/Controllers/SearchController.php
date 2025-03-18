<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchRequest;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\Gp;
use App\Models\JobList;
use App\Models\MenuFileUpload;
use App\Models\Remark;
use App\Models\SparePart;
use App\Models\Symptom;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class SearchController extends Controller
{
    public function detail(SearchRequest $request): JsonResponse
    {
        try {
            $response = Http::post(env('API_DETAIL'), [
                'sn' => $request->sn,
                'views' => $request->views,
            ]);
            $createJob = $request->input('createJob');
            if ($response->status() === 200) {
                $searchResults = $response->json();
                $warrantyexpire = $searchResults['warrantyexpire'];
                $status = $searchResults['status'];
                if ($searchResults['status'] === 'Fail') {
                    throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $request->sn);
                }
                $searchResults = $searchResults['assets'][0];
                $searchResults['warranty_status'] = $warrantyexpire;
                $searchResults['job'] = $this->storeJob($searchResults,$createJob);
                if ($searchResults['job']['is_code_key'] !== Auth::user()->is_code_cust_id) {
                    throw new \Exception('สินค้าซีเรียลนี้ถูกสร้าง job โดยศูนย์บริการอื่นแล้ว และยังดำเนินการอยู่ หากสงสัย ติดต่อผู้ดูแลระบบ');
                }
                $job_id = $searchResults['job']['job_id'];
                $hisSystem = $this->historyInSystem($request->sn, $searchResults);
                $searchResults['history'] = array_merge($hisSystem,$searchResults['history']);
                $searchResults['selected']['behavior'] = $this->BehaviorSelected($job_id);
                $searchResults['selected']['symptom'] = $this->SymptomSelected($job_id);
                $searchResults['selected']['remark'] = $this->RemarkSelected($job_id);
                $searchResults['selected']['fileUpload'] = $this->FileSelected($job_id);
                $findGP = Gp::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();
                $searchResults['selected']['globalGP'] = $findGP ? $findGP->gp_val : 0;
                $searchResults['selected']['customerInJob'] = $this->CustomerInJob($request->sn, $job_id) ?? [];
                $sp = $this->SpSelected($job_id);
                $searchResults['selected']['sp_warranty'] = $sp['sp_warranty'];
                $searchResults['selected']['sp'] = $sp['sp'];
            } else {
                throw new \Exception('ไม่พบข้อมูล');
            }
            return response()->json([
                'status' => $status,
                'searchResults' => $searchResults,
                'auth_user' => Auth::user(),
                'message' => 'success',
                'time' => Carbon::now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'Fail',
                'searchResults' => [],
                'auth_user' => Auth::user(),
                'message' => $e->getMessage(),
                'time' => Carbon::now()
            ], 400);
        }
    }

    private function SymptomSelected($job_id)
    {
        $symptom = Symptom::query()->where('job_id', $job_id)->first();
        return $symptom ? $symptom->symptom : null;
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
                'sp_unit',
                'qty',
                'gp',
                'price_multiple_gp',
                'approve',
                'approve_status',
                'remark',
                'claim',
                'claim_remark',
                'sp_warranty as warranty',
                'created_at', 'updated_at'
            )->get();
        $sp_warranty = SparePart::query()->where('job_id', $job_id)->where('sp_warranty', true)
            ->select(
                'sp_code as spcode',
                'sp_name as spname',
                'price_per_unit',
                'sp_unit',
                'qty',
                'gp',
                'price_multiple_gp',
                'approve',
                'approve_status',
                'sp_warranty as warranty',
                'created_at', 'updated_at'
            )->get();
        return [
            'sp' => $sp,
            'sp_warranty' => $sp_warranty
        ];
    }

    private function storeJob($data,$createJob)
    {
        $job = JobList::query()
            ->where('serial_id', $data['serial'])
            ->orderBy('id', 'desc')
            ->first();
        if ($createJob){
//        if (!$job || $job->status === 'success') {
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
                'warranty' => $data['warranty_status'],
                'is_code_key' => Auth::user()->is_code_cust_id,
                'user_key' => Auth::user()->user_code,
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

    private function CustomerInJob($serial_id, $job_id)
    {
        $customerInJob = CustomerInJob::where('serial_id', $serial_id)->first();

        if ($customerInJob) {
            $getLatestJob = CustomerInJob::where('serial_id', $customerInJob->serial_id)
                ->orderBy('id', 'desc')
                ->first();

            if ($getLatestJob) {
                $getCurrentJob = CustomerInJob::where('job_id', $job_id)->first();

                if ($getCurrentJob) {
                    return $getCurrentJob;
                } else {
                    $new = CustomerInJob::create([
                        'job_id' => $job_id,
                        'serial_id' => $getLatestJob->serial_id,
                        'name' => $getLatestJob->name,
                        'phone' => $getLatestJob->phone,
                        'address' => $getLatestJob->address,
                        'remark' => $getLatestJob->remark,
                    ]);
                    return $new;
                }
            }
        }

        return [];
    }

    private function historyInSystem($serial_id, $searchResults)
    {
        $jobs = JobList::query()->where('serial_id', $serial_id)
            ->where('is_code_key', Auth::user()->is_code_cust_id)
            ->where('status', 'success')
            ->orderBy('id', 'desc')
            ->get();
        $histories = [];
        foreach ($jobs as $key => $job) {
            $remark = Remark::query()->where('job_id', $job->job_id)->first();
            $histories[$key]['status'] = $job->status;
            $histories[$key]['close_job_by'] = $job->close_job_by;
            $histories[$key]['remark'] = $remark ? $remark->remark : 'ไม่มีข้อมูล';
            $histories[$key]['endservice'] = $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : 'N/A';
            $sparePart = SparePart::query()->where('job_id', $job->job_id)
                ->select('qty', 'sp_unit as unit', 'sp_code as spcode', 'sp_name as spname')->get();
            $histories[$key]['sparepart'] = $sparePart->toArray();
            $behavior = Behavior::query()->where('job_id', $job->job_id)->select('behavior_name as behaviorname')->get();
            $histories[$key]['behavior'] = $behavior->toArray();
        }
        return $histories;
    }

}
