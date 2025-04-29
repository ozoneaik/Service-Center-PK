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
        Schema::create('start_up_costs', function (Blueprint $table) {
            $table->id();
            $table->string('iamge')->nullable()->comment('url รูปภาพ');
            $table->string('barcode')->nullable()->comment('บาร์โค้ด');
            $table->string('sku_id',10)->comment('รหัสสินค้า');
            $table->string('sku_name')->comment('ชื่อสินค้า');
            $table->string('unit',10)->nullable()->comment('หน่วยนับ');
            $table->integer('amount')->nullable()->comment('จำนวน');
            $table->decimal('price_per_unit')->nullable()->comment('ราคาต่อหน่วย');
            $table->decimal('discount')->nullable()->comment('ส่วนลด');
            $table->string('p_cat_name')->nullable()->comment('ชื่อหมวดหมู่');
            $table->decimal('startup_cost')->comment('ค่าเปิดเครื่อง');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('start_up_costs');
    }
};
