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
        Schema::create('gps', function (Blueprint $table) {
            $table->id();
            $table->string('is_code_cust_id')->unique()->comment('รหัส isCode');
            $table->float('gp_val')->default(0)->comment('ค่า gp');
            $table->bigInteger('auth_key')->comment('ผู้คีย์');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gps');
    }
};
