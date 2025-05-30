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
        Schema::create('menu_file_uploads', function (Blueprint $table) {
            $table->id()->comment('ไอดีอ้างอิงเมนู');
            $table->text('menu_name')->unique()->comment('ชื่อเมนู');
            $table->string('group')->comment('กลุ่ม');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_file_uploads');
    }
};
