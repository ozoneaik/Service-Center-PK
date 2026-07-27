<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // ซ่อนเมนู 'เอกสารส่งซ่อมมายังพัมคิน' ออกจาก sidebar
        // route dealerRepair.send.doc อยู่ใน withoutMiddleware('menuAccess') แล้ว จึงยังเข้าถึงได้จากปุ่มในหน้า track
        ListMenu::query()
            ->where('redirect_route', 'dealerRepair.send.doc')
            ->where('group', 10)
            ->delete();
    }

    public function down(): void
    {
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.send.doc')
            ->where('group', 10)
            ->restore();
    }
};
