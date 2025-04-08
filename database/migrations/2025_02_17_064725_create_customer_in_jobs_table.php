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
        Schema::create('customer_in_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->comment('รหัสจ็อบ');
            $table->string('serial_id')->comment('รหัสเครื่อง');
            $table->string('name')->comment('ชื่อลูกค้า');
            $table->string('phone')->comment('เบอร์โทรศัพท์');
            $table->string('address')->nullable()->comment('ที่อยู่');
            $table->string('remark')->nullable()->comment('หมายเหตุ');
            $table->boolean('subRemark1')->default(false)->comment('เสนอราคาก่อนซ่อม');
            $table->boolean('subRemark2')->default(false)->comment('ซ่อมเสร็จส่งกลับทางไปรษณีย์');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_in_jobs');
    }
};
