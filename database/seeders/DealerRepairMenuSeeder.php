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
                'menu_name'       => 'เซลล์แจ้งซ่อม',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'repair.sale.index',
                'sort_order'      => 1,
            ],
            [
                'menu_name'       => 'แจ้งซ่อมมายังพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.index',
                'sort_order'      => 2,
            ],
            [
                'menu_name'       => 'ประวัติการแจ้งซ่อมมายังพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.history',
                'sort_order'      => 3,
            ],
            [
                'menu_name'       => 'ส่งซ่อมพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.send.list',
                'sort_order'      => 4,
            ],
            [
                'menu_name'       => 'เอกสารส่งซ่อมมายังพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.send.doc',
                'sort_order'      => 5,
            ],
            [
                'menu_name'       => 'ติดตามสถานะส่งซ่อมพัมคิน',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.send.track',
                'sort_order'      => 7,
            ],
            [
                'menu_name'       => 'สั่งซื้ออะไหล่',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.orders.diagram',
                'sort_order'      => 8,
            ],
            [
                'menu_name'       => 'ประวัติการสั่งซื้ออะไหล่',
                'group'           => 10,
                'main_menu'       => false,
                'redirect_route'  => 'dealerRepair.orders.history',
                'sort_order'      => 9,
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
