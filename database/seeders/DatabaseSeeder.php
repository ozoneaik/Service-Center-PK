<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::query()->create([
            'email' => 'admin@local',
            'password' => Hash::make('1111'),
            'name' => 'ภูวเดช พาณิชยโสภา',
            'role' => 'admin',
            'is_code_cust_id' => 'IS-CODE-001415445'
        ]);

        User::query()->create([
            'email' => 'user@local',
            'password' => Hash::make('1111'),
            'name' => 'John Doe',
            'role' => 'user',
            'is_code_cust_id' => 'IS-CODE-0014144-875412'
        ]);
    }
}
