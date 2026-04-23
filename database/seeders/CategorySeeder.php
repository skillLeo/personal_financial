<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'owner@skilleo.com')->first();
        if (!$user) return;

        $categories = [
            ['name' => 'Sales Revenue',     'type' => 'income',  'color' => '#10B981', 'icon' => 'ShoppingBagIcon'],
            ['name' => 'Freelance Income',  'type' => 'income',  'color' => '#3B82F6', 'icon' => 'BriefcaseIcon'],
            ['name' => 'Investment Return', 'type' => 'income',  'color' => '#8B5CF6', 'icon' => 'ChartBarIcon'],
            ['name' => 'Rental Income',     'type' => 'income',  'color' => '#F59E0B', 'icon' => 'HomeIcon'],
            ['name' => 'Other Income',      'type' => 'income',  'color' => '#6B7280', 'icon' => 'PlusCircleIcon'],
            ['name' => 'Raw Materials',     'type' => 'expense', 'color' => '#EF4444', 'icon' => 'CubeIcon'],
            ['name' => 'Staff Salaries',    'type' => 'expense', 'color' => '#F97316', 'icon' => 'UsersIcon'],
            ['name' => 'Office Rent',       'type' => 'expense', 'color' => '#EC4899', 'icon' => 'BuildingOfficeIcon'],
            ['name' => 'Utilities',         'type' => 'expense', 'color' => '#14B8A6', 'icon' => 'BoltIcon'],
            ['name' => 'Marketing',         'type' => 'expense', 'color' => '#6366F1', 'icon' => 'MegaphoneIcon'],
            ['name' => 'Transport',         'type' => 'expense', 'color' => '#84CC16', 'icon' => 'TruckIcon'],
            ['name' => 'Food & Dining',     'type' => 'expense', 'color' => '#F59E0B', 'icon' => 'ShoppingCartIcon'],
            ['name' => 'Equipment',         'type' => 'expense', 'color' => '#64748B', 'icon' => 'WrenchScrewdriverIcon'],
            ['name' => 'Software & Tools',  'type' => 'expense', 'color' => '#0EA5E9', 'icon' => 'ComputerDesktopIcon'],
            ['name' => 'Other Expenses',    'type' => 'expense', 'color' => '#6B7280', 'icon' => 'MinusCircleIcon'],
        ];

        foreach ($categories as $cat) {
            Category::create([
                ...$cat,
                'user_id'   => $user->id,
                'is_system' => true,
            ]);
        }
    }
}
