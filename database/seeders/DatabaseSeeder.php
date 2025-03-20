<?php

namespace Database\Seeders;

use App\Models\MenuFileUpload;
use App\Models\StoreInformation;
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
        User::query()->create([
            'user_code' => 'A' . rand(1000000, 9999999),
            'email' => 'admin@local',
            'password' => Hash::make('1111'),
            'name' => 'ภูวเดช พาณิชยโสภา',
            'role' => 'admin',
            'admin_that_branch' => true,
            'is_code_cust_id' => 'IS-CODE-001415445',
        ]);

        User::query()->create([
            'user_code' => 'A' . rand(1000000, 9999999),
            'email' => 'manee_admin01@service',
            'password' => Hash::make('1111'),
            'name' => 'มานีการช่าง',
            'role' => 'service',
            'admin_that_branch' => true,
            'is_code_cust_id' => 'IS-CODE-0014144-875412',
        ]);

        User::query()->create([
            'user_code' => 'SV' . rand(1000000, 9999999),
            'email' => 'manee_user01@service',
            'password' => Hash::make('1111'),
            'name' => 'John Doe',
            'role' => 'service',
            'admin_that_branch' => false,
            'is_code_cust_id' => 'IS-CODE-0014144-875412',
        ]);

        StoreInformation::query()->create([
            'is_code_cust_id' => 'IS-CODE-0014144-875412',
            'shop_name' => 'มานีการช่าง',
            'address' => 'ห้องสมุดบุญชูตรีทอง เรือนเพาะชำ ตำบล ปงยางคก อำเภอห้างฉัตร ลำปาง 52190',
            'phone' => '0931235648',
            'address_sub' => 'ห้องสมุดบุญชูตรีทอง เรือนเพาะชำ',
            'district' => 'ห้างฉัตร',
            'province' => 'ลำปาง',
            'sub_district' => 'ปงยางคก',
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

        MenuFileUpload::query()->create([
            'menu_name' => 'สภาพสินค้าก่อนซ่อม'
        ]);
        MenuFileUpload::query()->create([
            'menu_name' => 'สภาพสินค้าหลังซ่อม'
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
