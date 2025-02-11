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
        Schema::create('file_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('serial_id')->comment('รหัสอ้างอิงซีเรียลสินค้า');
            $table->string('job_id')->comment('รหัสจ็อบ');
            $table->bigInteger('menu_id')->comment('รหัสอ้างอิงเมนูรูปภาพ');
            $table->string('file_path')->unique()->comment('ที่อยู่รูปภาพ');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_uploads');
    }
};
