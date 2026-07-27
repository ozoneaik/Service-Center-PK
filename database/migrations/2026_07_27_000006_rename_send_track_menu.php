<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.send.track')
            ->where('group', 10)
            ->update(['menu_name' => 'ส่งงานซ่อม']);
    }

    public function down(): void
    {
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.send.track')
            ->where('group', 10)
            ->update(['menu_name' => 'ติดตามสถานะส่งซ่อมพัมคิน']);
    }
};
