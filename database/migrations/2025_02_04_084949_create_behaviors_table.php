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
        Schema::create('behaviors', function (Blueprint $table) {
            $table->id();
            $table->string('serial_id')->comment('รหัสอ้างอิงซีเรียลสินค้า');
            $table->string('catalog')->comment('แคตตาล็อคหลัก');
            $table->string('sub_catalog')->comment('แคตตาล็อครอง');
            $table->string('behavior_name')->comment('ชื่ออาการ');
            $table->string('cause_code')->comment('รหัสสาเหตุ');
            $table->string('cause_name')->comment('ชื่อสาเหตุ');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('behaviors');
    }
};
