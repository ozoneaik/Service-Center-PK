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
            $table->string('warranty_condition')->nullable()->comment('เงื่อนไขรับประกัน');
            $table->string('warranty_note')->nullable()->comment('โน็ตการรับประกัน');
            $table->string('warranty_period')->nullable()->comment('ระยะเวลารับประกัน');
            $table->string('image_sku')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('warranty')->default(false)->comment('สถานะรับประกัน');
            $table->string('user_key')->comment('ผู้สร้าง job');
            $table->string('is_code_key')->comment('ร้านที่รับผิดชอบ');
            $table->string('close_job_by')->nullable()->comment('ปิด job โดย');
            $table->string('group_job')->nullable()->comment('กลุ่ม job');
            $table->dateTime('print_at')->nullable()->comment('ปริ้นเมื่อ');
            $table->dateTime('print_updated_at')->nullable()->comment('ปริ้นล่าสุดเมื่อ');
            $table->bigInteger('counter_print')->nullable()->default(0)->comment('จำนวนที่ปริ้น');
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
