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
        Schema::table('stock_job_details', function (Blueprint $table) {
            $table->integer('total_after_total_if_add')->default(0)->comment('ถ้าเป็นประเภทขาบวก');
            $table->integer('total_after_total_if_remove')->default(0)->comment('ถ้าเป็นประเภทขาลบ');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_job_details', function (Blueprint $table) {
            //
        });
    }
};
