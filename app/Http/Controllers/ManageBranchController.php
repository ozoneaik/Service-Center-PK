<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmpRequest;
use App\Http\Requests\GpRequest;
use App\Models\Gp;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Ramsey\Uuid\Type\Integer;

class ManageBranchController extends Controller
{
    public function index(): Response
    {
        $is_code_cust_id = auth()->user()->is_code_cust_id;
        $listEmployeeThatBranch = User::query()
            ->where('role', 'service')
            ->where('is_code_cust_id', $is_code_cust_id)
            ->orderBy('id', 'desc')
            ->get();
        $gp = Gp::query()->where('is_code_cust_id',$is_code_cust_id)->first();
        if ($gp) $gp = $gp->gp_val; else $gp = 0;
        return Inertia::render('ManageBranchPage/Manage', [
            'listEmployeeThatBranch' => $listEmployeeThatBranch,
            'gp' => $gp,
            'user' => auth()->user()
        ]);
    }


    public function storeGp(GpRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            $is_code_cust_id = $request->input('is_code_cust_id');
            $gp_val = $request->input('gp_val');
            $gp = Gp::query()->where('is_code_cust_id', $is_code_cust_id)->first();
            if ($gp){
                $gp = Gp::query()->where('is_code_cust_id', $is_code_cust_id)
                    ->update([
                        'gp_val' => $gp_val,
                        'auth_key' => auth()->user()->id
                    ]);
                $message = "อัพเดท GP สำเร็จ";
            }else{
                $gp = Gp::query()->create([
                    'is_code_cust_id' => $is_code_cust_id,
                    'gp_val' => $gp_val,
                    'auth_key' => auth()->user()->id
                ]);
                $message = "สร้าง GP สำเร็จ";
            }
            $status = 200;
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $message = $e->getMessage();
            $status = 400;
        } finally {
            return response()->json([
                'message' => $message,
                'gp' => $gp ?? []
            ], $status);
        }
    }

    public function storeEmp(EmpRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            $status = 200;
            $message = 'บันทึกข้อมูลเสร็จสิ้น';
            $newEmp = User::query()->create([
                'user_code' => $request->input('user_code'),
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'is_code_cust_id' => auth()->user()->is_code_cust_id,
                'address' => auth()->user()->address,
                'phone' => auth()->user()->phone,
                'shop_name' => auth()->user()->shop_name,
                'role' => 'service',
                'admin_that_branch' => $request->input('role') === 'admin',
            ]);
            DB::commit();
        }catch (\Exception $e){
            DB::rollBack();
            $status = 400;
            $message = $e->getMessage();
        }finally {
            return response()->json([
                'message' => $message,
                'newEmp' => $newEmp ?? []
            ],$status);
        }
    }

    public function deleteEmployee() : int
    {
        return 0;
    }

}
