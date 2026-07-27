<?php

use App\Models\ListMenu;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Move existing order menus from group 10 to group 11
        ListMenu::withTrashed()
            ->whereIn('redirect_route', ['dealerRepair.orders.diagram', 'dealerRepair.orders.history'])
            ->where('group', 10)
            ->update(['group' => 11]);

        // Insert main_menu header for group 11 if not exists
        $exists = ListMenu::withTrashed()
            ->whereNull('redirect_route')
            ->where('group', 11)
            ->exists();

        if (!$exists) {
            ListMenu::create([
                'menu_name'      => 'สั่งซื้ออะไหล่',
                'group'          => 11,
                'main_menu'      => true,
                'redirect_route' => null,
            ]);
        }

        // Reset sort_order for the moved items
        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.orders.diagram')
            ->where('group', 11)
            ->update(['sort_order' => 1]);

        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.orders.history')
            ->where('group', 11)
            ->update(['sort_order' => 2]);
    }

    public function down(): void
    {
        ListMenu::withTrashed()
            ->whereIn('redirect_route', ['dealerRepair.orders.diagram', 'dealerRepair.orders.history'])
            ->where('group', 11)
            ->update(['group' => 10]);

        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.orders.diagram')
            ->where('group', 10)
            ->update(['sort_order' => 8]);

        ListMenu::withTrashed()
            ->where('redirect_route', 'dealerRepair.orders.history')
            ->where('group', 10)
            ->update(['sort_order' => 9]);

        ListMenu::withTrashed()
            ->whereNull('redirect_route')
            ->where('group', 11)
            ->delete();
    }
};
