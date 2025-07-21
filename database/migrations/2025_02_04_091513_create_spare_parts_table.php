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
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('serial_id')->comment('รหัสอ้างอิงซีเรียลสินค้า');
            $table->string('sp_code')->comment('รหัสอะไหล่');
            $table->string('sp_name')->comment('ชื่ออะไหล่');
            $table->float('price_per_unit')->default(0)->comment('ราคาต่อหน่วย');
            $table->float('stdprice_per_unit')->default(0)->comment('ราคาเริ่มต้นต่อหน่วย');
            $table->bigInteger('qty')->default(0)->comment('จำนวนอะไร');
            $table->string('sp_unit',10)->default('อัน')->comment('หน่วย');
            $table->string('job_id')->comment('รหัส job');
            $table->float('gp')->comment('ค่า ManageBranchPage ในแต่ละอะไหล่ของ job นั้นๆ');
            $table->float('price_multiple_gp')->nullable()->comment('ราคาหลังรวม ManageBranchPage แล้ว');
            $table->boolean('sp_warranty')->default(false)->comment('อะไหล่อยู่ในรัปประกันหรือไม่');
            $table->string('status')->default('pending')->comment('สถานะการเคลม');
            $table->string('approve')->default('no')->comment('อะไหล่รอ approve');
            $table->string('approve_status')->default('yes')->comment('สถานะอะไหล่รอ approve');
            $table->string('remark')->nullable()->comment('หมายเหตุ');
            $table->boolean('claim')->nullable()->comment('สถานะเคลม');
            $table->string('claim_remark',255)->nullable()->comment('หมายเหตุ เมื่อกรอกราคาอะไหล่เท่ากับ 0');
            $table->string('remark_noclaim')->nullable()->comment('หมายเหตุการของไม่เคลม');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_parts');
    }
};
