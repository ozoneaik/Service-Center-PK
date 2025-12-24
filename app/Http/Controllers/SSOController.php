<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // เอาไว้ดู Log เวลาเทส
use App\Models\User;

class SSOController extends Controller
{
    public function login(Request $request)
    {
        // 1. รับ Token ที่ส่งมาจาก URL
        $token = $request->query('token');

        if (!$token) {
            return abort(403, 'Token Not Found');
        }

        // 2. ยิง API กลับไปตรวจสอบที่ "ระบบจำลอง (System 1)"
        try {
            $response = Http::post('http://localhost:9000/api_verify.php', [
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return abort(500, 'Cannot connect to System 1: ' . $e->getMessage());
        }

        // 3. ตรวจสอบผลลัพธ์
        if ($response->successful()) {
            $result = $response->json();

            // เช็คว่า valid = true ไหม
            if (isset($result['valid']) && $result['valid'] === true) {

                // ได้ข้อมูล User มาจาก System 1
                $userCodeFromSys1 = $result['user']['user_code']; // ได้ค่า 'sale01'

                // 4. ค้นหา User ใน Database ของเรา (System 2)
                $user = User::where('user_code', $userCodeFromSys1)->first();

                if ($user) {
                    // 5. พบ User -> สั่ง Login (สร้าง Session)
                    Auth::login($user);

                    // 6. Redirect ไปหน้าประวัติการเคลม (ตามที่คุณต้องการ)
                    return redirect()->route('spareClaim.history');
                } else {
                    return abort(403, "User Code: {$userCodeFromSys1} ไม่พบในระบบเคลมอะไหล่");
                }
            }
        }

        return abort(403, 'Token Invalid or Expired');
    }
}