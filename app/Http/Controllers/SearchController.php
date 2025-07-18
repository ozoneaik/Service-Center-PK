<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchRequest;
use App\Models\Behavior;
use App\Models\CustomerInJob;
use App\Models\FileUpload;
use App\Models\Gp;
use App\Models\JobList;
use App\Models\logStamp;
use App\Models\MenuFileUpload;
use App\Models\Remark;
use App\Models\SparePart;
use App\Models\Symptom;
use App\Models\WarrantyProduct;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{

    public function index(): Response
    {
        return Inertia::render('NewRepair/Repair');
    }

    public function detail(SearchRequest $request): JsonResponse
    {
        try {
            logStamp::query()->create(['description' => Auth::user()->user_code . " ค้นหา sn $request->sn"]);
            $result = substr($request->sn, 0, 4);
            if ($result === '9999') {
                return $this->searchSku($request->sn);
            }
            $response = Http::post(env('API_DETAIL'), [
                'sn' => $request->sn,
                'views' => $request->views,
            ]);

            if (!$response->successful()) throw new \Exception('ขาดการติดต่อกับ API');
            $createJob = $request->input('createJob');
            if ($response->status() === 200) {

                $searchResults = $response->json();
                $skus = $searchResults['skuset'];
                $warrantyexpire = $searchResults['warrantyexpire'];
                $status = $searchResults['status'];
                if ($searchResults['status'] === 'Fail') {
                    throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $request->sn . ' กรุณาติดต่อเบอร์ 02-8995928 ต่อ 266');
                }

                if (count($skus) > 1) {
                    $sku = $request->pid;
                    if ($sku) {
                        $searchResults = $searchResults['assets'][$sku];
                    } else {
                        $list_sku = [];
                        foreach ($skus as $key => $value) {
                            $list_sku[$key]['pname'] = $searchResults['assets'][$value]['pname'];
                            $list_sku[$key]['pid'] = $searchResults['assets'][$value]['pid'];
                        }
                        return response()->json([
                            'message' => 'ตรวจพบสินค้า ' . count($skus) . ' รายการ',
                            'list_sku' => $list_sku
                        ], 202);
                    }

                } else {
                    $searchResults = $searchResults['assets'][$searchResults['skuset'][0]];
                }


                // ตรวจในฐานข้อมูลก่อนว่า มีใน warrantyProduct มั้ย
                $findWarranty = WarrantyProduct::query()->where('serial_id', $request->sn)->first();
                if ($findWarranty) {
                    $dateWarranty = Carbon::parse($findWarranty->date_warranty);
                    $expireDate = Carbon::parse($findWarranty->expire_date);
                    $now = Carbon::now();
                    if ($now->greaterThanOrEqualTo($dateWarranty) && $now->lessThanOrEqualTo($expireDate)) {
                        $searchResults['warranty_status'] = true;
                    } else $searchResults['warranty_status'] = false;
                } else $searchResults['warranty_status'] = $warrantyexpire;

                $sku = $sku ?? null;

                $searchResults['job'] = $this->storeJob($searchResults, $createJob, $sku);
                if ($searchResults['job']['is_code_key'] !== Auth::user()->is_code_cust_id) {
                    throw new \Exception('สินค้าซีเรียลนี้ถูกสร้าง job โดยศูนย์บริการอื่นแล้ว และยังดำเนินการอยู่ หากสงสัย ติดต่อผู้ดูแลระบบ');
                }
                $job_id = $searchResults['job']['job_id'];
                $hisSystem = $this->historyInSystem($request->sn, $searchResults);
                $searchResults['history'] = array_merge($hisSystem, $searchResults['history']);
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
        } catch (RequestException $e) {
            // กรณี API ไม่ตอบสนอง หรือเชื่อมต่อไม่ได้
            return response()->json([
                'status' => 'error',
                'message' => 'ขาดการติดต่อกับ API กรุณาตรวจสอบเครือข่าย',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'Fail',
                'searchResults' => [],
                'auth_user' => Auth::user(),
                'message' => $e->getMessage() . $e->getFile() . $e->getLine(),
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


        $query = Behavior::query()
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
        return $query;
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

    private function storeJob($data, $createJob, $sku)
    {
        $query = JobList::query();
        $query = $query->where('serial_id', $data['serial']);
        if ($sku) {
            $query->where('pid', $sku);
        }

        $job = $query
            ->where('serial_id', $data['serial'])
            ->orderBy('id', 'desc')
            ->first();

        if ($createJob) {
//        if (!$job || $job->status === 'success') {
            $is_code_4_digit = substr(Auth::user()->is_code_cust_id, 0, 4);
            $job = JobList::query()->create([
                'serial_id' => $data['serial'],
                'job_id' => "JOB-" . Carbon::now()->timestamp . 'C' . $is_code_4_digit,
                'pid' => $data['pid'],
                'p_name' => $data['pname'],
                'p_base_unit' => $data['pbaseunit'],
                'p_cat_id' => $data['pcatid'],
                'p_cat_name' => $data['pCatName'],
                'p_sub_cat_name' => $data['pSubCatName'],
                'fac_model' => $data['facmodel'] === null || $data['facmodel'] === '' ? null : $data['facmodel'],
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
        $customerInJob = CustomerInJob::query()->where('serial_id', $serial_id)->first();

        if ($customerInJob) {
            $getLatestJob = CustomerInJob::query()->where('serial_id', $customerInJob->serial_id)
                ->orderBy('id', 'desc')
                ->first();

            if ($getLatestJob) {
                $getCurrentJob = CustomerInJob::query()->where('job_id', $job_id)->first();
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
            ->whereNot('status', 'pending')
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

    // ค้นหา job โดย sku
    private function searchSku($serial_id): JsonResponse
    {
        try {
            $job = JobList::query()->where('serial_id', $serial_id)->first();
            $job = $job->toArray();
            $body = ['pid' => $job['pid'], 'view' => 'single'];
            $response = Http::post(env('VITE_API_ORDER'), $body);
            if ($response->successful()) {
                $responseJson = $response->json();
                if ($responseJson['status'] == 'SUCCESS') {
                    $job_id = $job['job_id'];
                    $jobTemp = $job;
                    $job = $responseJson['assets'][0];
                    $job['job'] = $jobTemp;
                    $job['serial'] = $serial_id;
                    $job['job_id'] = $job_id;
                } else {
                    throw new \Exception("ไม่เจอข้อมูลรหัสสินค้านี้");
                }
            } else {
                throw new \Exception('เกิดปัญหากับ API');
            }
            $job['history'] = [];
            $job['selected']['behavior'] = $this->BehaviorSelected($job['job_id']);
            $job['selected']['symptom'] = $this->SymptomSelected($job['job_id']);
            $job['selected']['remark'] = $this->RemarkSelected($job['job_id']);
            $job['selected']['fileUpload'] = $this->FileSelected($job['job_id']);
            $findGP = Gp::query()->where('is_code_cust_id', Auth::user()->is_code_cust_id)->first();
            $job['selected']['globalGP'] = $findGP ? $findGP->gp_val : 0;
            $job['selected']['customerInJob'] = $this->CustomerInJob($serial_id, $job['job_id']) ?? [];
            $sp = $this->SpSelected($job['job_id']);
            $job['selected']['sp_warranty'] = $sp['sp_warranty'];
            $job['selected']['sp'] = $sp['sp'];
            return response()->json([
                'status' => 'SUCCESS',
                'searchResults' => $job,
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

    public function searchFromHistory(Request $request)
    {
        try {
            $serial_id = $request->input('serial_id');
            $job_id = $request->input('job_id');

            $job_find = JobList::query()->where('job_id', $job_id)->first();
            if (!$job_find) throw  new  \Exception('ไม่พบ job นี้');
            $job = [];


            if (str_starts_with($serial_id, '9999')){
                $pid = $job_find['pid'];
                $find_data_from_api = Http::post(env('VITE_API_ORDER'), [
                    'pid' => $pid,
                    'view' => 'single',
                ]);
                if ($find_data_from_api->successful()) {
                    $responseJson = $find_data_from_api->json();
                    if ($responseJson['status'] == 'SUCCESS') {
                        $warrantyexpire = $responseJson['warrantyexpire'] ?? false;
                        // ตรวจในฐานข้อมูลก่อนว่า มีใน warrantyProduct มั้ย
                        $findWarranty = WarrantyProduct::query()->where('serial_id', $serial_id)->first();
                        if ($findWarranty) {
                            $dateWarranty = Carbon::parse($findWarranty->date_warranty);
                            $expireDate = Carbon::parse($findWarranty->expire_date);
                            $now = Carbon::now();
                            if ($now->greaterThanOrEqualTo($dateWarranty) && $now->lessThanOrEqualTo($expireDate)) {
                                $responseJson['warranty_status'] = true;
                            } else $responseJson['warranty_status'] = false;
                        } else $responseJson['warranty_status'] = $warrantyexpire;


                        $job = $responseJson['assets'][0];
                        $job['warranty_status'] = $responseJson['warranty_status'];
                        $job['job_id'] = $job_id;
                        $job['serial'] = $serial_id;
                        $job['history'] = [];
                        $job['selected']['behavior'] = $this->BehaviorSelected($job_id) ?? [];
                        $job['selected']['symptom'] = $this->SymptomSelected($job_id) ?? [];
                        $job['selected']['remark'] = $this->RemarkSelected($job_id) ?? [];
                        $job['selected']['fileUpload'] = $this->FileSelected($job_id) ?? [];
                        $job['selected']['customerInJob'] = $this->CustomerInJob($serial_id, $job_id) ?? [];
                        $sp = $this->SpSelected($job['job_id']);
                        $job['selected']['sp_warranty'] = $sp['sp_warranty'];
                        $job['selected']['sp'] = $sp['sp'];
                        $job['job'] = $job_find;

                    } else {
                        throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $serial_id . ' กรุณาติดต่อเบอร์ 02-8995928 ต่อ 266');
                    }
                }
            }else{
                $find_data_from_api = Http::post(env('API_DETAIL'), [
                    'sn' => $serial_id,
                    'view' => 'single',
                ]);
                if ($find_data_from_api->successful()) {
                    $responseJson = $find_data_from_api->json();
                    if ($responseJson['status'] == 'SUCCESS') {
                        $warrantyexpire = $responseJson['warrantyexpire'];
                        // ตรวจในฐานข้อมูลก่อนว่า มีใน warrantyProduct มั้ย
                        $findWarranty = WarrantyProduct::query()->where('serial_id', $serial_id)->first();
                        if ($findWarranty) {
                            $dateWarranty = Carbon::parse($findWarranty->date_warranty);
                            $expireDate = Carbon::parse($findWarranty->expire_date);
                            $now = Carbon::now();
                            if ($now->greaterThanOrEqualTo($dateWarranty) && $now->lessThanOrEqualTo($expireDate)) {
                                $responseJson['warranty_status'] = true;
                            } else $responseJson['warranty_status'] = false;
                        } else $responseJson['warranty_status'] = $warrantyexpire;


                        $job = $responseJson['assets'][$job_find->pid];
                        $job['warranty_status'] = $responseJson['warranty_status'];
                        $job['job_id'] = $job_id;
                        $job['serial'] = $serial_id;
                        $job['history'] = [];
                        $job['selected']['behavior'] = $this->BehaviorSelected($job_id) ?? [];
                        $job['selected']['symptom'] = $this->SymptomSelected($job_id) ?? [];
                        $job['selected']['remark'] = $this->RemarkSelected($job_id) ?? [];
                        $job['selected']['fileUpload'] = $this->FileSelected($job_id) ?? [];
                        $job['selected']['customerInJob'] = $this->CustomerInJob($serial_id, $job_id) ?? [];
                        $sp = $this->SpSelected($job['job_id']);
                        $job['selected']['sp_warranty'] = $sp['sp_warranty'];
                        $job['selected']['sp'] = $sp['sp'];
                        $job['job'] = $job_find;

                    } else {
                        throw new \Exception('ไม่พบข้อมูลซีเรียล : ' . $serial_id . ' กรุณาติดต่อเบอร์ 02-8995928 ต่อ 266');
                    }
                }
            }


            return response()->json([
                'message' => 'success',
                'request' => $request->all(),
                'job' => $job ?? [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage() . $e->getLine() . $e->getFile(),
                'error' => $e->getMessage() . $e->getLine() . $e->getFile(),
            ],400);
        }
    }

}



