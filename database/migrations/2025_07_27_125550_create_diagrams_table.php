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
        Schema::create('diagrams', function (Blueprint $table) {
            $table->id();
            $table->string('sku_fg_code')->comment('รหัสสินค้า');
            $table->string('sku_fg_name')->comment('ชื่อสินค้า');
            $table->string('sku_model_fg')->comment('โมเดลสินค้า');
            $table->string('type_dm')->comment('ประเภท');
            $table->string('layout')->comment('ลักษณะ');
            $table->string('file_part_image')->comment('ไฟล์รูปภาพไดอะแกรม');
            $table->string('file_part_manual')->comment('ไฟล์คู่มือไดอะแกรม');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagrams');
    }
};
