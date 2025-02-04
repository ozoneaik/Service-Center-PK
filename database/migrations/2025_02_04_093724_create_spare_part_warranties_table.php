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
        Schema::create('spare_part_warranties', function (Blueprint $table) {
            $table->id();
            $table->string('serial_id')->comment('รหัสอ้างอิงซีเรียลสินค้า');
            $table->string('sp_code')->comment('รหัสอะไหล่');
            $table->string('sp_name')->comment('ชื่ออะไหล่');
            $table->string('price_per_unit')->default(0)->comment('ราคาต่อหน่วย');
            $table->string('qty')->default(0)->comment('จำนวนอะไร');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_part_warranties');
    }
};
