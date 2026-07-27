<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // ถ้า migration ก่อนหน้า forceDelete ไปแล้ว ต้อง re-create แบบ soft-deleted
        // เพื่อให้ middleware access ยังทำงานได้ แต่ไม่แสดงใน sidebar
        $exists = ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.history')
            ->where('group', 10)
            ->exists();

        if (!$exists) {
            ListMenu::create([
                'menu_name'      => 'ประวัติการแจ้งซ่อมมายังพัมคิน',
                'group'          => 10,
                'main_menu'      => false,
                'redirect_route' => 'dealerRepair.history',
                'sort_order'     => 3,
            ]);

            ListMenu::query()
                ->where('redirect_route', 'dealerRepair.history')
                ->where('group', 10)
                ->delete();
        }
    }

    public function down(): void
    {
        // ไม่ต้องทำอะไร — migration 000002 down() จัดการแล้ว
    }
};
