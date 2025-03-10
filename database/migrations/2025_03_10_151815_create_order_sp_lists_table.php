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
        Schema::create('order_sp_lists', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->comment('หมายเลขคำสั่งซื้อ');
            $table->string('sp_code')->comment('รหัสอะไหล่');
            $table->string('sp_name')->comment('ชื่อะไหล่');
            $table->string('sp_unit')->comment('หน่วย');
            $table->string('sku_code')->comment('รหัสสินค้า');
            $table->longText('path_file')->nullable()->comment('รูปอะไหล่');
            $table->decimal('price_per_unit')->comment('ราคาอะไหล่');
            $table->bigInteger('qty')->comment('จำนวนอะไหล่');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_sp_lists');
    }
};
