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
        Schema::create('user_access_menus', function (Blueprint $table) {
            $table->id();
            $table->string('user_code')->comment('รหัสผู้ใช้');
            $table->integer('menu_code')->comment('รหัสเมนู');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_access_menus');
    }
};
