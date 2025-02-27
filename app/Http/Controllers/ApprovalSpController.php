<?php

namespace App\Http\Controllers;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalSpController extends Controller
{
    public function index(): Response
    {
        $listSp = SparePart::query()
            ->where('approve','yes')
            ->where('approve_status','no')
            ->orderBy('id')
            ->get();
        return Inertia::render('ApprovalSpPage/ApprovalSp', [
            'listSp' => $listSp,
        ]);
    }

    public function updateStatus ($spId,$approve_status): JsonResponse
    {
        try {
            DB::beginTransaction();
            $sp = SparePart::query()->where('id',$spId)->first();
            $sp->approve_status = $approve_status === 'yes' ? 'yes' : 'no';
            $sp->update();
            $status = 200;
            $message = 'อัพเดท สถานะสำเร็จ';
            DB::commit();
        }catch (\Exception $e){
            $message = $e->getMessage();
            $status = 400;
            DB::rollBack();
        } finally {
            return response()->json([
                'status' => 'error',
                'message' => $message
            ],$status);
        }

    }
}
