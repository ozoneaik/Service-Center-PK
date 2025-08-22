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
        Schema::create('repair_men', function (Blueprint $table) {
            $table->id();
            $table->string('is_code_cust_id')->comment('รหัสลูกค้า');
            $table->string('technician_name')->comment('ชื่อช่าง');
            $table->string('technician_nickname')->nullable()->comment('ชื่อเล่นช่าง');
            $table->string('technician_phone')->nullable()->comment('เบอร์โทรช่าง');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repair_men');
    }
};
