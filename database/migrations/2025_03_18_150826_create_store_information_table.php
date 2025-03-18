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
        Schema::create('store_information', function (Blueprint $table) {
            $table->id();
            $table->string('is_code_cust_id')->uniqid()->comment('รหัส is code ร้านค้า');
            $table->string('shop_name',255)->comment('ชื่อร้าน');
            $table->string('phone',20)->uniqid()->comment('เบอร์โทรศัพท์');
            $table->longText('address')->comment('ที่อยู่ร้านค้า');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_information');
    }
};
