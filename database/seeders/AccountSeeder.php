<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Account;
use App\Models\User;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'owner@skilleo.com')->first();
        if (!$user) return;

        Account::create([
            'user_id'    => $user->id,
            'name'       => 'Cash in Hand',
            'type'       => 'cash',
            'balance'    => 0,
            'color'      => '#10B981',
            'icon'       => 'BanknotesIcon',
            'is_default' => true,
        ]);

        Account::create([
            'user_id'    => $user->id,
            'name'       => 'Main Bank Account',
            'type'       => 'bank',
            'balance'    => 0,
            'color'      => '#3B82F6',
            'icon'       => 'BuildingLibraryIcon',
            'is_default' => false,
        ]);
    }
}
