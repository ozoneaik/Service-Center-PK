<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // เปลี่ยน redirect_route ของเมนู "แจ้งงานซ่อม" จาก dealerRepair.index → dealerRepair.history
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.index')
            ->where('group', 10)
            ->update(['redirect_route' => 'dealerRepair.history']);
    }

    public function down(): void
    {
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.history')
            ->where('group', 10)
            ->update(['redirect_route' => 'dealerRepair.index']);
    }
};
