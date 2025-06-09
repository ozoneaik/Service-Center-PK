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
        Schema::create('accessories_notes', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->comment('รหัสจ็อบ');
            $table->string('serial_id')->comment('รหัสซีเรียล');
            $table->longText('note')->comment('หมายเหตุอุปกรณ์เสริม');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accessories_notes');
    }
};
