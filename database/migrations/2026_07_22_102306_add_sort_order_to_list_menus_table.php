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

        // กำหนดลำดับ group 10 โดยใช้ redirect_route แทน id เพราะ id ต่างกันระหว่าง environment
        $orders = [
            'repair.sale.index'             => 1,
            'dealerRepair.index'            => 2,
            'dealerRepair.history'          => 3,
            'dealerRepair.send.list'        => 4,
            'dealerRepair.send.doc'         => 5,
            'sale.dealer.jobs.index'        => 6,
            'dealerRepair.send.track'       => 7,
            'dealerRepair.orders.diagram'   => 8,
            'dealerRepair.orders.history'   => 9,
        ];

        foreach ($orders as $route => $order) {
            DB::table('list_menus')->where('redirect_route', $route)->update(['sort_order' => $order]);
        }
    }

    public function down(): void
    {
        Schema::table('list_menus', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
