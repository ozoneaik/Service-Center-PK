<?php

namespace App\Http\Controllers\ClaimSpManage;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\ClaimDetail;
use Inertia\Inertia;

class ClaimSpController extends Controller
{
    public function index($status)
    {
        if(!isset($status)) $status = 'pending';
        $claimList = Claim::query()
            ->leftJoin('users', 'users.is_code_cust_id', '=', 'claims.user_id')
            ->whereRaw('users.id = (SELECT MAX(id) FROM users WHERE users.is_code_cust_id = claims.user_id)')
            ->where('claims.status',$status)
            ->orderBy('claims.id', 'desc')
            ->select('claims.*', 'users.shop_name', 'users.is_code_cust_id', 'users.address')
            ->paginate(100);
        return Inertia::render('SpareClaim/Manage/ClaimList', ['claimList' => $claimList,'statusClaim' => $status]);
    }
    public function detail($claim_id)
    {
        $detail = ClaimDetail::query()->where('claim_id', $claim_id)->orderBy('id', 'desc')->get();
        $claim = Claim::query()
            ->leftJoin('users', 'users.is_code_cust_id', '=', 'claims.user_id')
            ->whereRaw('users.id = (SELECT MAX(id) FROM users WHERE users.is_code_cust_id = claims.user_id)')
            ->where('claim_id', $claim_id)
            ->orderBy('claims.id', 'desc')
            ->select('claims.*', 'users.shop_name', 'users.is_code_cust_id', 'users.address')
            ->first();
        // dd($detail->toArray());
        return Inertia::render('SpareClaim/Manage/ClaimDetail', ['detail' => $detail, 'claim' => $claim]);
    }

    public function updateByIdSp($claimDetail_id, $status)
    {
        $claim_detail = ClaimDetail::find($claimDetail_id); // ค้นหาข้อมูลก่อน
        if ($claim_detail) {
            $claim_detail->update([
                'status' => $status,
                'claim_qty' => $claim_detail->claim_qty,
            ]);
            return response()->json([
                'message' => 'update สำเร็จ'
            ]);
        } else {
            return response()->json([
                'message' => 'ไม่พบรหัส id ที่ต้องการ update'
            ], 400);
        }
    }

    public function updateAll($claim_id, $status)
    {
        $claim = Claim::query()->where('id', $claim_id)->first();
        if ($claim) {
            $claim->update(['status' => $status,]);
            $details = ClaimDetail::where('claim_id', $claim->claim_id)->get();
            foreach ($details as $detail) {
                $detail->update(['status' => $status]);
            }
            return response()->json([
                'message' => 'update สำเร็จ'
            ]);
        } else {
            return response()->json([
                'message' => 'ไม่พบรหัส id ที่ต้องการ update'
            ], 400);
        }
    }
}
