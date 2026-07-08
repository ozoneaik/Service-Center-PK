<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_lists', function (Blueprint $table) {
            $table->string('dealer_code')->nullable()->comment('รหัสร้านค้าผู้แจ้งซ่อม (ไม่ใช่ศูนย์ซ่อม)');
            $table->string('dealer_name')->nullable()->comment('ชื่อร้านค้าผู้แจ้งซ่อม');
            $table->string('dealer_phone')->nullable()->comment('เบอร์ติดต่อร้านค้าผู้แจ้งซ่อม');
        });

        Schema::table('customer_in_jobs', function (Blueprint $table) {
            $table->string('dealer_contact_name')->nullable()->comment('ชื่อผู้ติดต่อฝั่งร้านค้า (dealer)');
            $table->string('dealer_contact_phone')->nullable()->comment('เบอร์ผู้ติดต่อฝั่งร้านค้า (dealer)');
        });
    }

    public function down(): void
    {
        Schema::table('job_lists', function (Blueprint $table) {
            $table->dropColumn(['dealer_code', 'dealer_name', 'dealer_phone']);
        });

        Schema::table('customer_in_jobs', function (Blueprint $table) {
            $table->dropColumn(['dealer_contact_name', 'dealer_contact_phone']);
        });
    }
};
