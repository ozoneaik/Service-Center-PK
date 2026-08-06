<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_information', function (Blueprint $table) {
            $table->boolean('show_in_report_filter')->default(true)->after('shop_type')
                ->comment('แสดงร้านนี้ในตัวกรองของหน้า report สำหรับ admin');
        });
    }

    public function down(): void
    {
        Schema::table('store_information', function (Blueprint $table) {
            $table->dropColumn('show_in_report_filter');
        });
    }
};
