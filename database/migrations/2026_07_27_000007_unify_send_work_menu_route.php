<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // dealer: เปลี่ยน dealerRepair.send.track → sendWork.index
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.send.track')
            ->update(['redirect_route' => 'sendWork.index']);

        // sale: เปลี่ยน sale.dealer.jobs.index → sendWork.index (ถ้ามี record นี้ในระบบ)
        ListMenu::withTrashed()
            ->where('redirect_route', 'sale.dealer.jobs.index')
            ->update(['redirect_route' => 'sendWork.index', 'menu_name' => 'ส่งงานซ่อม']);
    }

    public function down(): void
    {
        ListMenu::withTrashed()
            ->where('redirect_route', 'sendWork.index')
            ->where('group', 10)
            ->update(['redirect_route' => 'dealerRepair.send.track']);

        // ไม่ restore sale record เพราะไม่ทราบ group เดิม
    }
};
