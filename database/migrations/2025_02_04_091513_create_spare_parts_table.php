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
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('serial_id')->comment('รหัสอ้างอิงซีเรียลสินค้า');
            $table->string('sp_code')->comment('รหัสอะไหล่');
            $table->string('sp_name')->comment('ชื่ออะไหล่');
            $table->float('price_per_unit')->default(0)->comment('ราคาต่อหน่วย');
            $table->bigInteger('qty')->default(0)->comment('จำนวนอะไร');
            $table->string('sp_unit',10)->default('อัน')->comment('หน่วย');
            $table->string('job_id')->comment('รหัส job');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_parts');
    }
};
