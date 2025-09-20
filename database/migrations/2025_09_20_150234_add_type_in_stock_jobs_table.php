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
        Schema::table('stock_jobs', function (Blueprint $table) {
            $table->enum('type', ['เพิ่ม', 'ลด'])->default('เพิ่ม')->comment('ประเภท');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_jobs', function (Blueprint $table) {
            //
        });
    }
};
