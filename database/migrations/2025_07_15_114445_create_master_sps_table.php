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
        Schema::create('master_sps', function (Blueprint $table) {
            $table->id();
            $table->string('sp_code')->unique()->comment('รหัสอะไหล่');
            $table->string('sp_name')->nullable()->comment('ชื่ออะไหล่');
            $table->string('sp_unit')->nullable()->comment('หน่วยอะไหล่');
            $table->string('cat')->nullable()->comment('กลุ่มแคตตาล็อก');
            $table->string('sub_cat')->nullable()->comment('กลุ่มย่อยแคตตาล็อก');
            $table->string('group')->nullable()->comment('กลุ่ม');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_sps');
    }
};
