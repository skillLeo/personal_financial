<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Account;
use App\Models\Category;
use App\Models\Person;
use App\Models\Transaction;
use App\Models\Loan;
use App\Models\Subscription;
use App\Models\Employee;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'owner@skilleo.com')->first();
        if (!$user) return;

        $cashAccount = Account::where('user_id', $user->id)->where('type', 'cash')->first();
        $bankAccount = Account::where('user_id', $user->id)->where('type', 'bank')->first();

        $incomeCategories  = Category::where('user_id', $user->id)->where('type', 'income')->get();
        $expenseCategories = Category::where('user_id', $user->id)->where('type', 'expense')->get();

        $people = collect([
            ['name' => 'Ahmed Khan',   'phone' => '0300-1234567', 'relationship' => 'client'],
            ['name' => 'Sara Malik',   'phone' => '0321-9876543', 'relationship' => 'supplier'],
            ['name' => 'Bilal Raza',   'phone' => '0333-1112222', 'relationship' => 'friend'],
            ['name' => 'Fatima Noor',  'phone' => '0345-5556666', 'relationship' => 'client'],
            ['name' => 'Usman Tariq',  'phone' => '0311-7778888', 'relationship' => 'employee'],
        ])->map(fn($p) => Person::create(['user_id' => $user->id, ...$p]));

        for ($month = 2; $month >= 0; $month--) {
            $base = Carbon::now()->subMonths($month);

            $incomeDays  = [2, 5, 8, 12, 15, 18, 22, 25, 28];
            $expenseDays = [1, 3, 6, 9, 11, 14, 16, 19, 21, 24, 26, 29];

            foreach ($incomeDays as $day) {
                $date = $base->copy()->setDay(min($day, $base->daysInMonth));
                Transaction::create([
                    'user_id'          => $user->id,
                    'account_id'       => fake()->randomElement([$cashAccount->id, $bankAccount->id]),
                    'category_id'      => $incomeCategories->random()->id,
                    'person_id'        => fake()->boolean(60) ? $people->random()->id : null,
                    'type'             => 'income',
                    'amount'           => fake()->numberBetween(5000, 80000),
                    'description'      => fake()->randomElement(['Product sale', 'Service payment', 'Client invoice', 'Online order', 'Consultation fee']),
                    'transaction_date' => $date->toDateString(),
                ]);
            }

            foreach ($expenseDays as $day) {
                $date = $base->copy()->setDay(min($day, $base->daysInMonth));
                Transaction::create([
                    'user_id'          => $user->id,
                    'account_id'       => fake()->randomElement([$cashAccount->id, $bankAccount->id]),
                    'category_id'      => $expenseCategories->random()->id,
                    'person_id'        => fake()->boolean(40) ? $people->random()->id : null,
                    'type'             => 'expense',
                    'amount'           => fake()->numberBetween(500, 25000),
                    'description'      => fake()->randomElement(['Office supplies', 'Utility bill', 'Vendor payment', 'Transport cost', 'Maintenance', 'Marketing spend']),
                    'transaction_date' => $date->toDateString(),
                ]);
            }
        }

        foreach (Account::where('user_id', $user->id)->get() as $account) {
            $income  = (float) Transaction::where('account_id', $account->id)->where('type', 'income')->sum('amount');
            $expense = (float) Transaction::where('account_id', $account->id)->where('type', 'expense')->sum('amount');
            $account->update(['balance' => $income - $expense]);
        }

        Loan::create([
            'user_id'          => $user->id,
            'person_id'        => $people[0]->id,
            'type'             => 'given',
            'total_amount'     => 50000,
            'paid_amount'      => 20000,
            'remaining_amount' => 30000,
            'loan_date'        => now()->subMonths(2)->toDateString(),
            'due_date'         => now()->addMonths(1)->toDateString(),
            'status'           => 'partial',
            'notes'            => 'Business loan given to client.',
        ]);

        Loan::create([
            'user_id'          => $user->id,
            'person_id'        => $people[2]->id,
            'type'             => 'taken',
            'total_amount'     => 100000,
            'paid_amount'      => 0,
            'remaining_amount' => 100000,
            'loan_date'        => now()->subMonth()->toDateString(),
            'due_date'         => now()->addMonths(3)->toDateString(),
            'status'           => 'pending',
            'notes'            => 'Borrowed for business expansion.',
        ]);

        Subscription::create([
            'user_id'       => $user->id,
            'name'          => 'Google Workspace',
            'amount'        => 2500,
            'billing_cycle' => 'monthly',
            'next_due_date' => now()->addDays(5)->toDateString(),
            'status'        => 'active',
            'logo_url'      => null,
            'reminder_days' => 3,
        ]);

        Subscription::create([
            'user_id'       => $user->id,
            'name'          => 'Adobe Creative Cloud',
            'amount'        => 4500,
            'billing_cycle' => 'monthly',
            'next_due_date' => now()->addDays(12)->toDateString(),
            'status'        => 'active',
            'reminder_days' => 3,
        ]);

        Subscription::create([
            'user_id'       => $user->id,
            'name'          => 'Slack',
            'amount'        => 1200,
            'billing_cycle' => 'monthly',
            'next_due_date' => now()->addDays(20)->toDateString(),
            'status'        => 'active',
            'reminder_days' => 3,
        ]);

        Subscription::create([
            'user_id'       => $user->id,
            'name'          => 'Hosting & Domain',
            'amount'        => 8000,
            'billing_cycle' => 'yearly',
            'next_due_date' => now()->addMonths(6)->toDateString(),
            'status'        => 'active',
            'reminder_days' => 7,
        ]);

        Employee::create([
            'user_id'        => $user->id,
            'name'           => 'Usman Tariq',
            'role'           => 'Sales Manager',
            'phone'          => '0311-7778888',
            'joining_date'   => now()->subYear()->toDateString(),
            'monthly_salary' => 45000,
            'status'         => 'active',
        ]);

        Employee::create([
            'user_id'        => $user->id,
            'name'           => 'Zara Ahmed',
            'role'           => 'Accountant',
            'phone'          => '0322-3334444',
            'joining_date'   => now()->subMonths(8)->toDateString(),
            'monthly_salary' => 35000,
            'status'         => 'active',
        ]);
    }
}
