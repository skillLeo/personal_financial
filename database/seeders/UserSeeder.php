<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'          => 'SkillLeo Owner',
            'business_name' => 'SkillLeo',
            'email'         => 'owner@skilleo.com',
            'password'      => Hash::make('skilleo123'),
            'phone'         => '+92 300 0000000',
            'currency'      => 'PKR',
            'timezone'      => 'Asia/Karachi',
        ]);
    }
}
