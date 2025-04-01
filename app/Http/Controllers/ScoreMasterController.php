<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScoreMasterRequest;
use App\Http\Requests\ScoreSkuRequest;
use App\Models\ScoreMaster;
use App\Models\SkuScore;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ScoreMasterController extends Controller
{
    /**
     * Master
     */
    public function index(): Response
    {
        $scoreMasters = ScoreMaster::query()->orderBy('id', 'desc')->get();
        return Inertia::render('Admin/Scores/Master/ScoreMasterList', ['scoreMasters' => $scoreMasters]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Scores/Master/ScoreMasterCreate');
    }

    public function store(ScoreMasterRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $data = $request->validated();
            $scoreMaster = ScoreMaster::query()->create([
                'range_value' => $data['range_value'],
                'range_name' => $data['range_name'],
                'condition' => $data['condition'],
                'group_product' => $data['group_product'],
            ]);
            DB::commit();
            return redirect()->route('ScoreMaster.create')->with('success', 'บันทึกข้อมูลสำเร็จ');
        } catch (\Exception $exception) {
            DB::rollBack();
            return redirect()->route('ScoreMaster.create')->with('error', $exception->getMessage());
        }

    }

    public function update(ScoreMasterRequest $request, $id): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $data = $request->validated();
            $scoreMaster = ScoreMaster::query()->findOrFail($id);
            if ($scoreMaster) {
                $scoreMaster = ScoreMaster::query()->update([
                    'range_value' => $data['range_value'],
                    'range_name' => $data['range_name'],
                    'condition' => $data['condition'],
                    'group_product' => $data['group_product'],
                ]);
                DB::commit();
                return redirect()->route('ScoreMaster.index')->with('success', 'อัพเดทข้อมูลสำเร็จ');
            } else throw new \Exception('ไม่พบข้อมูล');
        } catch (\Exception $exception) {
            DB::rollBack();
            return redirect()->route('ScoreMaster.index')->with('error', $exception->getMessage());
        }
    }

    public function delete($id): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $scoreMaster = ScoreMaster::query()->findOrFail($id);
            if ($scoreMaster) {
                $scoreMaster->delete();
                DB::commit();
                return redirect()->route('ScoreMaster.index')->with('success', 'ลบข้อมูลสำเร็จ');
            } else throw new \Exception('ไม่พบข้อมูล');
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return redirect()->route('ScoreMaster.index')->with('error', 'ไม่พบข้อมูลที่ต้องการลบ');
        } catch (\Exception $exception) {
            DB::rollBack();
            return redirect()->route('ScoreMaster.index')->with('error', $exception->getMessage());
        }

    }

    /**
     * ------------------------------------------------------------------------------------------------------------
     */

    public function indexSku(): Response
    {
        $scoreSkus = SkuScore::query()->orderBy('id', 'desc')->get();
        return Inertia::render('Admin/Scores/ScoreSkuList', ['scoreSkus' => $scoreSkus]);
    }

    public function createSku(): Response
    {
        return Inertia::render('Admin/Scores/Master/ScoreSkuCreate');
    }

    public function storeSku(ScoreSkuRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $data = $request->validated();

            ScoreMaster::query()->create([
                'status' => $data['status'],
                'sku' => $data['sku'],
                'sku_name' => $data['sku_name'],
                'group_product_ref' => $data['group_product_ref'],
                'range_value_ref' => $data['range_value_ref'],
            ]);
            DB::commit();
            return redirect()->route('ScoreMaster.index')->with('success', 'บันทึกข้อมูลสำเร็จ');
        } catch (\Exception $exception) {
            DB::rollBack();
            return redirect()->route('ScoreMaster.index')->with('error', $exception->getMessage());
        }
    }

    public function updateSku(ScoreSkuRequest $request, $id): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $data = $request->validated();
            $scoreSku = SkuScore::query()->findOrFail($id);
            if ($scoreSku) {
                ScoreMaster::query()->update([
                    'status' => $data['status'],
                    'sku' => $data['sku'],
                    'sku_name' => $data['sku_name'],
                    'group_product_ref' => $data['group_product_ref'],
                    'range_value_ref' => $data['range_value_ref'],
                ]);
                DB::commit();
                return redirect()->route('ScoreMaster.index')->with('success', 'อัพเดทข้อมูลสำเร็จ');
            } else throw new \Exception('ไม่พบข้อมูล');
        } catch (\Exception $exception) {
            DB::rollBack();
            return redirect()->route('ScoreMaster.index')->with('error', $exception->getMessage());
        }
    }

    public function deleteSku($id): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $scoreSku = SkuScore::query()->findOrFail($id);
            if ($scoreSku) {
                $scoreSku->delete();
                DB::commit();
                return redirect()->route('ScoreMaster.index')->with('success', 'ลบข้อมูลสำเร็จ');
            } else throw new \Exception('ไม่พบข้อมูล');
        } catch (\Exception $exception) {
            DB::rollBack();
            return redirect()->route('ScoreMaster.index')->with('error', $exception->getMessage());
        }
    }
}
