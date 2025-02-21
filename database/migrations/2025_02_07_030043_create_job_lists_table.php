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
        Schema::create('job_lists', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->unique()->comment('รหัสจ็อบ');
            $table->string('serial_id');
            $table->string('pid')->comment('รหัสสินค้า');
            $table->string('p_name')->comment('ชื่อสินค้า');
            $table->string('p_base_unit')->nullable()->comment('หน่วย');
            $table->string('p_cat_id')->nullable();
            $table->string('p_cat_name')->nullable();
            $table->string('p_sub_cat_name')->nullable();
            $table->string('fac_model')->nullable();
            $table->string('image_sku')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('warranty')->default(false)->comment('สถานะรับประกัน');
            $table->string('user_id')->comment('ผู้สร้าง job');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_lists');
    }
};
