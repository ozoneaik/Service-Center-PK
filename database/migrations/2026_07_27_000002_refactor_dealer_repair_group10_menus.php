<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Rename group 10 main_menu header: 'แจ้งซ่อม' → 'ซ่อมสินค้า'
        ListMenu::withTrashed()
            ->where('group', 10)
            ->where('main_menu', true)
            ->whereNull('redirect_route')
            ->update(['menu_name' => 'ซ่อมสินค้า']);

        // Rename 'แจ้งซ่อมมายังพัมคิน' → 'แจ้งงานซ่อม' (keep same route)
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.index')
            ->where('group', 10)
            ->update(['menu_name' => 'แจ้งงานซ่อม']);

        // Soft-delete 'ประวัติการแจ้งซ่อมมายังพัมคิน' — ซ่อนจาก sidebar แต่ middleware access ยังทำงานได้
        ListMenu::query()
            ->where('redirect_route', 'dealerRepair.history')
            ->where('group', 10)
            ->delete();
    }

    public function down(): void
    {
        // Restore header name
        ListMenu::withTrashed()
            ->where('group', 10)
            ->where('main_menu', true)
            ->whereNull('redirect_route')
            ->update(['menu_name' => 'แจ้งซ่อม']);

        // Restore sub-menu name
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.index')
            ->where('group', 10)
            ->update(['menu_name' => 'แจ้งซ่อมมายังพัมคิน']);

        // Restore soft-deleted history menu
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.history')
            ->where('group', 10)
            ->restore();
    }
};
