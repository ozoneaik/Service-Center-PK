<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('store_information', function (Blueprint $table) {
            $table->text('footer_description')->default('เอกสารนี้เป็นหลักฐานการรับสินค้าเพื่อส่งซ่อม กรุณาเก็บไว้เพื่อยืนยันตัวตน')->comment('คำอธิบายด้านล่างของใบรับสินค้า');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_information', function (Blueprint $table) {
            //
        });
    }
};
