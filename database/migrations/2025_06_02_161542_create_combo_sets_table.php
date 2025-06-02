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
        Schema::create('combo_sets', function (Blueprint $table) {
            $table->id();
            $table->string('sku_code')->unique()->comment('รหัสสินค้าคอมโบ');
            $table->text('sku_name')->comment('ขื่อสินค้าคอมโบ');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('combo_sets');
    }
};
