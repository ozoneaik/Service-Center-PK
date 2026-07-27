<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ListMenu::query()
            ->where('redirect_route', 'dealerRepair.send.list')
            ->where('group', 10)
            ->delete();
    }

    public function down(): void
    {
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.send.list')
            ->where('group', 10)
            ->restore();
    }
};
