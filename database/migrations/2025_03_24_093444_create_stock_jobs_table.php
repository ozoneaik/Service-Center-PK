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
        Schema::create('stock_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('stock_job_id')->unique()->comment('รหัสจ็อบ');
            $table->string('is_code_cust_id')->comment('ร้านที่สร้าง job');
            $table->string('user_code_key')->comment('ผู้สร้าง job');
            $table->string('job_status')->default('processing')->comment('สถานะ job');
            $table->string('user_code_close_job')->nullable()->comment('ผู้ปิดจ็อบ');
            $table->dateTime('closeJobAt')->nullable()->comment('ปิดจ็อบเมื่อ');
            $table->timestamps();
        });

        Schema::create('stock_job_details', function (Blueprint $table) {
            $table->id();
            $table->string('stock_job_id')->comment('รหัสจ็อบ');
            $table->string('is_code_cust_id')->comment('รหัสร้านค้า');
            $table->string('user_code_key')->comment('รหัสผู้คีย์');
            $table->string('sku_code')->nullable()->comment('รหัสสินค้า');
            $table->string('sku_name')->nullable()->comment('ชื่อสินค้า');
            $table->string('sp_code')->comment('รหัสอะไหล่');
            $table->string('sp_name')->comment('ชื่ออะไหล่');
            $table->bigInteger('sp_qty')->comment('จำนวนอะไหล่');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_jobs');
        Schema::dropIfExists('stock_job_details');
    }
};
