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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->string('is_code_cust_id')->comment('รหัสร้านค้า');
            $table->string('user_code_key')->comment('รหัสผู้ใช้');
            $table->string('sku_code')->comment('รหัสสินค้า');
            $table->string('sku_name')->comment('ชื่อสินค้า');
            $table->string('sp_code')->comment('รหัสสินค้า');
            $table->string('sp_name')->comment('ชื่อสินค้า');
            $table->string('remark')->nullable()->default('มาจากการสั่งซื้อ')->comment('หมายเหตุ');
            $table->float('price_per_unit')->comment('ราคาต่อหน่วย');
            $table->string('sp_unit')->default('ชิ้น')->comment('หน่วย');
            $table->bigInteger('qty')->default(1)->comment('จำนวน');
            $table->boolean('is_active')->default(false)->comment('สถานะการใช้งาน');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
