<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('list_menus', function (Blueprint $table) {
            $table->unsignedSmallInteger('sort_order')->default(99)->after('redirect_route');
        });

        // กำหนดลำดับ group 10
        $orders = [
            39 => 1,  // แจ้งซ่อมศูนย์บริการ (repair.sale.index)
            29 => 2,  // แจ้งซ่อมมายังพัมคิน
            30 => 3,  // ประวัติการแจ้งซ่อมมายังพัมคิน
            31 => 4,  // ส่งซ่อมพัมคิน
            33 => 5,  // เอกสารส่งซ่อมมายังพัมคิน
            35 => 6,  // รายการงานส่งซ่อม (ร้านค้า)
            32 => 7,  // ติดตามสถานะส่งซ่อมพัมคิน
            36 => 8,  // สั่งซื้ออะไหล่
            38 => 9,  // ประวัติการสั่งซื้ออะไหล่
        ];

        foreach ($orders as $id => $order) {
            DB::table('list_menus')->where('id', $id)->update(['sort_order' => $order]);
        }
    }

    public function down(): void
    {
        Schema::table('list_menus', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
