<?php

namespace Database\Seeders;

use App\Models\ListMenu;
use App\Models\MenuFileUpload;
use App\Models\StoreInformation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->create([
            'user_code' => 'admin',
            'email' => 'admin@local',
            'password' => Hash::make('1111'),
            'name' => 'ภูวเดช พาณิชยโสภา',
            'role' => 'admin',
            'admin_that_branch' => true,
            'is_code_cust_id' => 'IS-CODE-001415445',
        ]);

        StoreInformation::query()->create([
            'is_code_cust_id' => 'IS-CODE-001415445',
            'address' => 'บจก. พัมคิน คอร์ปอเรชั่น 4 พระรามที่ 2 ซอย 54 แยก 4 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150',
            'shop_name' => 'Pumpkin Coporation',
            'phone' => '0931622330',
            'address_sub' => 'บจก. พัมคิน คอร์ปอเรชั่น 4 พระรามที่ 2 ซอย 54 แยก 4',
            'district' => 'เขตบางขุนเทียน',
            'province' => 'กรุงเทพมหานคร',
            'sub_district' => 'แขวงแสมดำ',
        ]);

        $menu_file_uplaods = [
            ['menu_name' => 'สภาพสินค้าก่อนซ่อม', 'menu_id' => 1],
            ['menu_name' => 'สภาพสินค้าหลังซ่อม', 'menu_id' => 2],
            ['menu_name' => 'ภาพอะไหล่ที่เสียส่งเคลม', 'menu_id' => 3],
            ['menu_name' => 'ภาพอะไหล่ที่เปลี่ยน', 'menu_id' => 4],
            ['menu_name' => 'ภาพอะไหล่เสียอื่นๆ', 'menu_id' => 5],

        ];

        foreach ($menu_file_uplaods as $key => $menu_file_upload) {
            MenuFileUpload::query()->create([
                'menu_name' => $menu_file_upload['menu_name'],
                'group' => $menu_file_upload['menu_id'],
            ]);
        }

        $menu_system = [
            ['menu_name' => 'แจ้งซ่อม', 'group' => 1, 'main_menu' => true, 'redirect_route' => 'repair.index'],
            ['menu_name' => 'ประวัติซ่อม', 'group' => 2, 'main_menu' => true, 'redirect_route' => 'history.index'],
            ['menu_name' => 'ส่งซ่อมไปยังพัมคินฯ', 'group' => 3, 'main_menu' => true, 'redirect_route' => null],
            ['menu_name' => 'ส่งต่อเคสซ่อมไปยังพัมคินฯ', 'group' => 3, 'main_menu' => false, 'redirect_route' => 'sendJobs.list'],
            ['menu_name' => 'ออกเอกสารส่งกลับ พัมคินฯ', 'group' => 3, 'main_menu' => false, 'redirect_route' => 'sendJobs.docJobList'],
            ['menu_name' => 'ลงทะเบียนรับประกันสินค้า', 'group' => 4, 'main_menu' => true, 'redirect_route' => 'warranty.index'],
            ['menu_name' => 'แจ้งเคลมอะไหล่และตรวจสอบสถานะเคลม', 'group' => 5, 'main_menu' => true, 'redirect_route' => 'spareClaim.index'],
            ['menu_name' => 'สั่งซื้ออะไหล่และตรวจสอบไดอะแกรม', 'group' => 6, 'main_menu' => true, 'redirect_route' => 'orders.list'],
            ['menu_name' => 'รายงานศูนย์บริการ', 'group' => 7, 'main_menu' => true, 'redirect_route' => 'report.menu'],
            ['menu_name' => 'จัดการร้านค้า', 'group' => 8, 'main_menu' => true, 'redirect_route' => null],
            ['menu_name' => 'สต็อกอะไหล่', 'group' => 8, 'main_menu' => false, 'redirect_route' => 'stockSp.list'],
            ['menu_name' => 'ปรับปรุงสต็อกอะไหล่', 'group' => 8, 'main_menu' => false, 'redirect_route' => 'stockJob.index'],
            ['menu_name' => 'ข้อมูลผู้ใช้', 'group' => 8, 'main_menu' => false, 'redirect_route' => 'storeUsers.index'],
            ['menu_name' => 'จัดการเครื่องปริ้นต์', 'group' => 8, 'main_menu' => false, 'redirect_route' => 'printerIp.index'],
            ['menu_name' => 'จัดการช่างซ่อม', 'group' => 8, 'main_menu' => false, 'redirect_route' => 'repairMan.index']
        ];

        foreach ($menu_system as $menu) {
            ListMenu::query()->create($menu);
        }
    }
}
