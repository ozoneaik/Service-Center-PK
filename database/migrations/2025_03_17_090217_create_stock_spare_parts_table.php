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
        Schema::create('stock_spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('is_code_cust_id')->comment('รหัสร้าน');
            $table->string('sp_code')->comment('รหัสอะไหล่');
            $table->string('sp_name')->comment('ชื่ออะไหล่');
            $table->string('sku_code')->comment('รหัสสินค้า');
            $table->string('sku_name')->comment('ชื่อสินค้า');
            $table->bigInteger('qty_sp')->comment('จำนวนอะไหล่');
            $table->bigInteger('old_qty_sp')->nullable()->default(0)->comment('จำนวนอะไหล่ก่อนหน้า');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_spare_parts');
    }
};
