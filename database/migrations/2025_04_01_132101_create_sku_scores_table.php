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
        Schema::create('sku_scores', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active')->comment('สถานะ');
            $table->string('sku')->comment('รหัสสินค้า');
            $table->string('sku_name')->comment('ชื่อสินค้า');
            $table->string('group_product_ref')->comment('กลุ่มสินค้า');
            $table->integer('range_value_ref')->comment('ความสามารถการซ่อม');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sku_scores');
    }
};
