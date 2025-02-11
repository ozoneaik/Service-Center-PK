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
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_id')->comment('รหัสเอกสารเคลม');
            $table->string('job_id')->comment('รหัสจ็อบ');
            $table->string('serial_id')->comment('ซีเรียลสินค้า');
            $table->string('sp_code')->comment('รหัสอะไหล่');
            $table->dateTime('claim_submit_date')->comment('วันที่แจ้งเคลม');
            $table->bigInteger('qty')->comment('จำนวนอะไหล่');
            $table->string('unit')->comment('หน่วย');
            $table->dateTime('claim_date')->nullable()->comment('วันที่รับเคลม');
            $table->bigInteger('claim_qty')->default(0)->comment('จำนวนอะไหล่ที่รับเคลม');
            $table->string('claim_unit')->default('อัน')->comment('หน่วยของอะไหล่ที่รับเคลม');
            $table->string('status')->default('pending')->nullable()->comment('สถานะเคลม');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claims');
    }
};
