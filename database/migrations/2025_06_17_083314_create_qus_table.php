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
        Schema::create('qus', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->comment('รหัสจ็อบ');
            $table->string('file_name')->comment('ชือไฟล์');
            $table->string('file_path')->comment('ที่อยู่ไฟล์');
            $table->integer('counter_print')->default(0)->comment('จำนวนการพิมพ์');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qus');
    }
};
