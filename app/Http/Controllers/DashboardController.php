<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Loan;
use App\Models\Subscription;
use App\Models\Budget;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user  = $request->user();
        $now   = Carbon::now();
        $start = $now->copy()->startOfMonth();
        $end   = $now->copy()->endOfMonth();

        $incomeThisMonth   = (float) Transaction::where('user_id', $user->id)->where('type', 'income')->whereBetween('transaction_date', [$start, $end])->sum('amount');
        $expensesThisMonth = (float) Transaction::where('user_id', $user->id)->where('type', 'expense')->whereBetween('transaction_date', [$start, $end])->sum('amount');
        $netBalance        = $incomeThisMonth - $expensesThisMonth;
        $totalSavings      = $user->totalSavings();

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->with(['category', 'person', 'account'])
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($t) => [
                'id'               => $t->id,
                'type'             => $t->type,
                'amount'           => $t->amount,
                'formatted_amount' => $t->formatted_amount,
                'description'      => $t->description,
                'transaction_date' => $t->transaction_date->format('Y-m-d'),
                'category'         => $t->category ? ['name' => $t->category->name, 'color' => $t->category->color, 'icon' => $t->category->icon] : null,
                'account'          => $t->account ? ['name' => $t->account->name] : null,
                'person'           => $t->person ? ['name' => $t->person->name] : null,
                'has_photos'       => $t->photos()->exists(),
            ]);

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $income  = (float) Transaction::where('user_id', $user->id)->where('type', 'income')->whereDate('transaction_date', $day)->sum('amount');
            $expense = (float) Transaction::where('user_id', $user->id)->where('type', 'expense')->whereDate('transaction_date', $day)->sum('amount');
            $chartData[] = [
                'date'    => $day->format('d M'),
                'income'  => $income,
                'expense' => $expense,
            ];
        }

        $topCategories = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$start, $end])
            ->selectRaw('category_id, SUM(amount) as total')
            ->with('category')
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn($t) => [
                'name'       => $t->category ? $t->category->name : 'Uncategorised',
                'color'      => $t->category ? $t->category->color : '#6B7280',
                'total'      => (float) $t->total,
                'formatted'  => 'Rs. ' . number_format($t->total, 0),
                'percentage' => $expensesThisMonth > 0 ? round(($t->total / $expensesThisMonth) * 100, 1) : 0,
            ]);

        $accounts = Account::where('user_id', $user->id)
            ->get()
            ->map(fn($a) => [
                'id'               => $a->id,
                'name'             => $a->name,
                'type'             => $a->type,
                'balance'          => $a->balance,
                'formatted_balance'=> $a->formatted_balance,
                'color'            => $a->color,
                'icon'             => $a->icon,
            ]);

        $upcomingSubscriptions = Subscription::where('user_id', $user->id)
            ->active()
            ->whereDate('next_due_date', '<=', $now->copy()->addDays(7))
            ->orderBy('next_due_date')
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'id'           => $s->id,
                'name'         => $s->name,
                'amount'       => $s->amount,
                'formatted'    => $s->formatted_amount,
                'days_until'   => $s->days_until_due,
                'next_due_date'=> $s->next_due_date->format('d M Y'),
            ]);

        $pendingLoans = Loan::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'partial'])
            ->get();

        $budgetAlerts = Budget::where('user_id', $user->id)
            ->where('end_date', '>=', now())
            ->get()
            ->filter(fn($b) => $b->isOverAlert())
            ->map(fn($b) => [
                'id'         => $b->id,
                'name'       => $b->name,
                'amount'     => $b->amount,
                'formatted'  => $b->formatted_amount,
                'spent'      => $b->currentSpending(),
                'percentage' => $b->percentageUsed(),
            ])
            ->values();

        return Inertia::render('Dashboard', [
            'stats' => [
                'income_this_month'   => $incomeThisMonth,
                'expenses_this_month' => $expensesThisMonth,
                'net_balance'         => $netBalance,
                'total_savings'       => $totalSavings,
                'income_formatted'    => 'Rs. ' . number_format($incomeThisMonth, 0),
                'expenses_formatted'  => 'Rs. ' . number_format($expensesThisMonth, 0),
                'net_formatted'       => 'Rs. ' . number_format(abs($netBalance), 0),
                'savings_formatted'   => 'Rs. ' . number_format($totalSavings, 0),
            ],
            'recent_transactions'    => $recentTransactions,
            'chart_data'             => $chartData,
            'top_categories'         => $topCategories,
            'accounts'               => $accounts,
            'upcoming_subscriptions' => $upcomingSubscriptions,
            'pending_loans_count'    => $pendingLoans->count(),
            'pending_loans_total'    => 'Rs. ' . number_format($pendingLoans->sum('remaining_amount'), 0),
            'budget_alerts'          => $budgetAlerts,
        ]);
    }
}
