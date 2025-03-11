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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique()->comment('หมายเลขคำสั่งซื้อ');
            $table->string('is_code_key')->comment('ร้านที่สั่งซื้อ');
            $table->string('user_key')->comment('คนสั่งซื้อ');
            $table->string('status')->default('pending')->comment('สถานะคำสั่งซื้อ');
            $table->dateTime('buy_at')->comment('สั่งซื้อเมื่อ');
            $table->longText('address')->comment('ที่อยู่');
            $table->string('pay_by', 50)->default('บัญชีธนาคาร')->comment('ชำระเงินโดย');
            $table->dateTime('pay_at')->nullable()->comment('ชำระเงินเมื่อ');
            $table->dateTime('process_at')->nullable()->comment('รับคำสั่งซื้อเมื่อ');
            $table->string('process_user_key')->nullable()->comment('คนรับคำสั่งซื้อ');
            $table->dateTime('success_at')->nullable()->comment('สั่งซื้อสำเร็จเมื่อ');
            $table->string('cancel_user_key')->nullable()->comment('คนยกเลิกคำสั่งซื้อ');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
