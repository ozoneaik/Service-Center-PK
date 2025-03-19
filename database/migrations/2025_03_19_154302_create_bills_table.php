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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->string('is_code_cust_id')->comment('รหัสร้านค้า');
            $table->string('bill_no')->unique()->comment('เลขที่ใบเสร็จ');
            $table->boolean('status')->default(1)->comment('สถานะใบเสร็จ');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
