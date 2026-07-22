<?php

namespace Database\Seeders;

use App\Models\ListMenu;
use Illuminate\Database\Seeder;

class DealerRepairMenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            [
                'menu_name'       => 'แจ้งซ่อม',
                'group'           => 10,
                'main_menu'       => true,
                'redirect_route'  => null,
            ],
            [
                'menu_name'       => 'แจ้งซ่อมมายังพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.index',
            ],
            [
                'menu_name'       => 'ประวัติการแจ้งซ่อม',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.history',
            ],
            [
                'menu_name'       => 'ส่งซ่อมพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.send.list',
            ],
            [
                'menu_name'       => 'ติดตามสถานะส่งซ่อมพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.send.track',
            ],
            [
                'menu_name'       => 'สั่งซื้ออะไหล่',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.orders.diagram',
            ],
            [
                'menu_name'       => 'ประวัติการสั่งซื้ออะไหล่',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.orders.history',
            ],
        ];

        foreach ($menus as $menu) {
            $exists = ListMenu::withTrashed()
                ->where('redirect_route', $menu['redirect_route'])
                ->where('group', $menu['group'])
                ->exists();

            if (!$exists) {
                ListMenu::create($menu);
            }
        }
    }
}
