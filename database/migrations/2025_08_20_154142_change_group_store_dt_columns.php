<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // แปลง group_ids เป็น bigint
        DB::statement('ALTER TABLE group_stores_dt ALTER COLUMN group_ids TYPE bigint USING group_ids::bigint');

        // แปลง store_ids เป็น bigint
        DB::statement('ALTER TABLE group_stores_dt ALTER COLUMN store_ids TYPE bigint USING store_ids::bigint');
    }

    public function down(): void
    {
        // กลับเป็น string
        DB::statement('ALTER TABLE group_stores_dt ALTER COLUMN group_ids TYPE varchar');
        DB::statement('ALTER TABLE group_stores_dt ALTER COLUMN store_ids TYPE varchar');
    }
};
