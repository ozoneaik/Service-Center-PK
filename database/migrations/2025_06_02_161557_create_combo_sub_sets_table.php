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
        Schema::create('combo_sub_sets', function (Blueprint $table) {
            $table->id();
            $table->string('sub_sku_code')->comment('รหัสสินค้า');
            $table->text('sub_sku_name')->comment('ชื่อสินค้า');
            $table->bigInteger('main_combo_id')->comment('รหัสอ้างอิงคอมโบ');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sub_combo_sets');
    }
};
