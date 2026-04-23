<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Subscription;
use App\Models\Loan;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Category;
use App\Models\NotificationLog;
use App\Models\BackupSetting;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $today = now()->toDateString();
    $subscriptions = Subscription::active()
        ->whereDate('next_due_date', $today)
        ->with(['user', 'account'])
        ->get();

    foreach ($subscriptions as $sub) {
        $account = $sub->account
            ?? Account::where('user_id', $sub->user_id)->where('is_default', true)->first()
            ?? Account::where('user_id', $sub->user_id)->first();

        $category = $sub->category_id
            ? Category::find($sub->category_id)
            : Category::where('user_id', $sub->user_id)->where('type', 'expense')->first();

        if ($account && $category) {
            $t = Transaction::create([
                'user_id'          => $sub->user_id,
                'account_id'       => $account->id,
                'category_id'      => $category->id,
                'type'             => 'expense',
                'amount'           => $sub->amount,
                'description'      => 'Auto: ' . $sub->name . ' subscription',
                'transaction_date' => $today,
            ]);

            $income  = (float) Transaction::where('account_id', $account->id)->where('type', 'income')->sum('amount');
            $expense = (float) Transaction::where('account_id', $account->id)->where('type', 'expense')->sum('amount');
            $account->update(['balance' => $income - $expense]);
        }

        $sub->update([
            'last_billed_date' => now(),
            'next_due_date'    => $sub->calculateNextDueDate(),
        ]);

        NotificationLog::create([
            'user_id'  => $sub->user_id,
            'title'    => 'Subscription Renewed: ' . $sub->name,
            'message'  => 'Rs. ' . number_format($sub->amount, 0) . ' was automatically deducted for ' . $sub->name . '.',
            'type'     => 'subscription_reminder',
            'related_model_type' => 'Subscription',
            'related_model_id'   => $sub->id,
        ]);
    }
})->daily()->name('process-due-subscriptions');

Schedule::call(function () {
    $alertDate = now()->addDays(3)->toDateString();
    $loans = Loan::whereIn('status', ['pending', 'partial'])
        ->whereDate('due_date', '<=', $alertDate)
        ->whereDate('due_date', '>=', now()->toDateString())
        ->with('person')
        ->get();

    foreach ($loans as $loan) {
        $daysLeft = now()->diffInDays($loan->due_date, false);
        NotificationLog::create([
            'user_id'  => $loan->user_id,
            'title'    => 'Loan Due Soon',
            'message'  => 'Loan with ' . ($loan->person?->name ?? 'Unknown') . ' is due in ' . $daysLeft . ' days. Remaining: Rs. ' . number_format($loan->remaining_amount, 0),
            'type'     => 'loan_reminder',
            'related_model_type' => 'Loan',
            'related_model_id'   => $loan->id,
        ]);
    }
})->daily()->name('loan-due-reminders');

Schedule::call(function () {
    $users = User::all();
    foreach ($users as $user) {
        $income  = 'Rs. ' . number_format($user->totalIncomeThisMonth(), 0);
        $expense = 'Rs. ' . number_format($user->totalExpensesThisMonth(), 0);
        $net     = 'Rs. ' . number_format($user->netBalance(), 0);

        NotificationLog::create([
            'user_id' => $user->id,
            'title'   => 'Monthly Summary',
            'message' => "This month: Income {$income} | Expenses {$expense} | Net {$net}",
            'type'    => 'monthly_summary',
        ]);
    }
})->lastDayOfMonth()->name('monthly-summary');

Schedule::call(function () {
    $users = User::all();
    foreach ($users as $user) {
        $weekIncome  = (float) Transaction::where('user_id', $user->id)->where('type', 'income')
            ->whereBetween('transaction_date', [now()->startOfWeek(), now()->endOfWeek()])->sum('amount');
        $weekExpense = (float) Transaction::where('user_id', $user->id)->where('type', 'expense')
            ->whereBetween('transaction_date', [now()->startOfWeek(), now()->endOfWeek()])->sum('amount');

        NotificationLog::create([
            'user_id' => $user->id,
            'title'   => 'Weekly Digest',
            'message' => 'This week: Income Rs. ' . number_format($weekIncome, 0) . ' | Expenses Rs. ' . number_format($weekExpense, 0),
            'type'    => 'weekly_digest',
        ]);
    }
})->weekly()->mondays()->name('weekly-digest');

// Dynamic scheduled backups — reads each user's backup schedule from DB
Schedule::call(function () {
    $settings = BackupSetting::where('schedule', '!=', 'manual')->get();
    foreach ($settings as $setting) {
        $now = now();
        $shouldRun = false;

        if ($setting->schedule === 'daily') {
            [$h, $m] = explode(':', $setting->backup_time ?? '02:00');
            $shouldRun = (int)$now->format('H') === (int)$h && (int)$now->format('i') < 15;
        } elseif ($setting->schedule === 'weekly') {
            [$h, $m] = explode(':', $setting->backup_time ?? '02:00');
            $shouldRun = $now->dayOfWeek === (int)($setting->backup_day ?? 0)
                && (int)$now->format('H') === (int)$h
                && (int)$now->format('i') < 15;
        } elseif ($setting->schedule === 'monthly') {
            [$h, $m] = explode(':', $setting->backup_time ?? '02:00');
            $shouldRun = $now->day === (int)($setting->backup_day ?? 1)
                && (int)$now->format('H') === (int)$h
                && (int)$now->format('i') < 15;
        }

        if ($shouldRun) {
            \Illuminate\Support\Facades\Artisan::call('backup:create', [
                '--user' => $setting->user_id,
                '--type' => 'scheduled',
            ]);
        }
    }
})->everyFifteenMinutes()->name('scheduled-backups');
