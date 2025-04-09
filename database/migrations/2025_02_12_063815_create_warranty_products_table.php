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
        Schema::create('warranty_products', function (Blueprint $table) {
            $table->id();
            $table->string('serial_id')->unique()->comment('หมายเลขซีเรียล');
            $table->string('pid')->comment('รหัสสินค้า');
            $table->string('p_name')->comment('ชื่อสินค้า');
            $table->date('date_warranty')->comment('วันที่รับประกัน');
            $table->bigInteger('user_id')->comment('รหัสลูกค้า');
            $table->string('user_is_code_id')->comment('รหัส isCode');
            $table->date('expire_date')->nullable()->comment('รับประกันถึง');
            $table->bigInteger('warranty_period')->nullable()->comment('ระยะเวลารับประกัน(เดือน)');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranty_products');
    }
};
