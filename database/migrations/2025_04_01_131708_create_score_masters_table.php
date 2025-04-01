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
        Schema::create('score_masters', function (Blueprint $table) {
            $table->id();
            $table->integer('range_value')->comment('ความสามารถการซ่อม');
            $table->string('range_name')->comment('ระดับการอบรม');
            $table->string('condition')->comment('เงื่อนไข');
            $table->string('group_product')->comment('กลุ่มสินค้า');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('score_masters');
    }
};
