<?php

namespace Database\Seeders;

use App\Models\MenuFileUpload;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::query()->create([
            'user_code' => 'A'.rand(1000000, 9999999),
            'email' => 'admin@local',
            'password' => Hash::make('1111'),
            'name' => 'ภูวเดช พาณิชยโสภา',
            'role' => 'admin',
            'admin_that_branch' => true,
            'is_code_cust_id' => 'IS-CODE-001415445',
            'address' => 'บจก. พัมคิน คอร์ปอเรชั่น 4 พระรามที่ 2 ซอย 54 แยก 4 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150'
        ]);

        User::query()->create([
            'user_code' => 'A'.rand(1000000, 9999999),
            'email' => 'manee_admin01@service',
            'password' => Hash::make('1111'),
            'name' => 'มานีการช่าง',
            'role' => 'service',
            'phone' => '0931622330',
            'admin_that_branch' => true,
            'shop_name' => 'มานีการช่าง',
            'is_code_cust_id' => 'IS-CODE-0014144-875412',
            'address' => 'ห้องสมุดบุญชูตรีทอง เรือนเพาะชำ ตำบล ปงยางคก อำเภอห้างฉัตร ลำปาง 52190'
        ]);

        User::query()->create([
            'user_code' => 'SV'.rand(1000000, 9999999),
            'email' => 'manee_user01@service',
            'password' => Hash::make('1111'),
            'name' => 'John Doe',
            'role' => 'service',
            'phone' => '0931622330',
            'admin_that_branch' => false,
            'shop_name' => 'มานีการช่าง',
            'is_code_cust_id' => 'IS-CODE-0014144-875412',
            'address' => 'ห้องสมุดบุญชูตรีทอง เรือนเพาะชำ ตำบล ปงยางคก อำเภอห้างฉัตร ลำปาง 52190'
        ]);

        MenuFileUpload::query()->create([
           'menu_name' => 'สถาพสินค้าก่อนซ่อม'
        ]);
        MenuFileUpload::query()->create([
            'menu_name' => 'สถาพสินค้าหลังซ่อม'
        ]);
        MenuFileUpload::query()->create([
            'menu_name' => 'ภาพอะไหล่ที่เสียส่งเคลม'
        ]);
        MenuFileUpload::query()->create([
            'menu_name' => 'ภาพอะไหล่ที่เปลี่ยน'
        ]);
        MenuFileUpload::query()->create([
            'menu_name' => 'ภาพอะไหล่เสี่ยอื่นๆ'
        ]);
    }
}
