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
        Schema::create('list_menus', function (Blueprint $table) {
            $table->id();
            $table->string('menu_name')->comment('ชื่อเมนู');
            $table->string('group')->nullable()->comment('กลุ่ม');
            $table->boolean('main_menu')->default(true)->comment('เป็นเมนูหลัก');
            $table->string('redirect_route')->nullable()->comment('เส้นทาง');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('list_menus');
    }
};
