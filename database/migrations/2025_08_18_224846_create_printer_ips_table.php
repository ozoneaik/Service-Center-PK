<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('printer_ips', function (Blueprint $table) {
            $table->id();
            $table->string('is_code_cust_id')->comment('รหัสร้านค้า');
            $table->string('printer_ip')->comment('ip เครื่องปริ้น');
            $table->string('pc_ip')->comment('ip เครื่องคอมพิวเตอร์');
            $table->string('created_by')->comment('ผู้สร้าง');
            $table->string('updated_by')->comment('ผู้อัพเดท');
            $table->string('deleted_by')->comment('ผู้ลบ');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('printer_ips');
    }
};
