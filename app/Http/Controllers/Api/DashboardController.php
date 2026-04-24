<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Account;
use App\Models\Budget;
use App\Models\Loan;
use App\Models\Subscription;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary(Request $request): JsonResponse
    {
        $user  = $request->user();
        $now   = Carbon::now();
        $start = $now->copy()->startOfMonth();
        $end   = $now->copy()->endOfMonth();

        $incomeThisMonth   = (float) Transaction::where('user_id', $user->id)->where('type', 'income')->whereBetween('transaction_date', [$start, $end])->sum('amount');
        $expensesThisMonth = (float) Transaction::where('user_id', $user->id)->where('type', 'expense')->whereBetween('transaction_date', [$start, $end])->sum('amount');
        $totalSavings      = $user->totalSavings();

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->with(['category', 'person', 'account'])
            ->orderByDesc('transaction_date')->orderByDesc('created_at')
            ->limit(10)->get()
            ->map(fn($t) => $this->fmtTxn($t));

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $chartData[] = [
                'date'    => $day->toDateString(),
                'label'   => $day->format('d M'),
                'income'  => (float) Transaction::where('user_id', $user->id)->where('type', 'income')->whereDate('transaction_date', $day)->sum('amount'),
                'expense' => (float) Transaction::where('user_id', $user->id)->where('type', 'expense')->whereDate('transaction_date', $day)->sum('amount'),
            ];
        }

        $topCategories = Transaction::where('user_id', $user->id)->where('type', 'expense')
            ->whereBetween('transaction_date', [$start, $end])
            ->selectRaw('category_id, SUM(amount) as total')
            ->with('category')->groupBy('category_id')->orderByDesc('total')->limit(5)->get()
            ->map(fn($t) => [
                'category_id' => $t->category_id,
                'name'        => $t->category?->name ?? 'Uncategorised',
                'color'       => $t->category?->color ?? '#6B7280',
                'icon'        => $t->category?->icon,
                'total'       => (float) $t->total,
                'percentage'  => $expensesThisMonth > 0 ? round(($t->total / $expensesThisMonth) * 100, 1) : 0,
            ]);

        $accounts = Account::where('user_id', $user->id)->get()
            ->map(fn($a) => [
                'id'      => $a->id,
                'name'    => $a->name,
                'type'    => $a->type,
                'balance' => $a->balance,
                'color'   => $a->color,
            ]);

        $overdueLoans = Loan::where('user_id', $user->id)->where('status', '!=', 'completed')
            ->where('due_date', '<', now()->toDateString())->count();

        $upcomingSubscriptions = Subscription::where('user_id', $user->id)->where('status', 'active')
            ->where('next_due_date', '<=', now()->addDays(7)->toDateString())->count();

        $budgetAlerts = Budget::where('user_id', $user->id)
            ->whereDate('end_date', '>=', now()->toDateString())
            ->get()->filter(function ($b) use ($user) {
                $spent = (float) Transaction::where('user_id', $user->id)
                    ->where('category_id', $b->category_id)->where('type', 'expense')
                    ->whereBetween('transaction_date', [$b->start_date, $b->end_date])->sum('amount');
                return $b->amount > 0 && ($spent / $b->amount * 100) >= $b->alert_at_percentage;
            })->count();

        return $this->success([
            'period'                  => ['from' => $start->toDateString(), 'to' => $end->toDateString()],
            'income_this_month'       => $incomeThisMonth,
            'expenses_this_month'     => $expensesThisMonth,
            'net_balance_this_month'  => $incomeThisMonth - $expensesThisMonth,
            'total_savings'           => $totalSavings,
            'recent_transactions'     => $recentTransactions,
            'chart_data'              => $chartData,
            'top_expense_categories'  => $topCategories,
            'accounts'                => $accounts,
            'alerts'                  => [
                'overdue_loans'          => $overdueLoans,
                'upcoming_subscriptions' => $upcomingSubscriptions,
                'budget_alerts'          => $budgetAlerts,
            ],
        ]);
    }

    private function fmtTxn(Transaction $t): array
    {
        return [
            'id'               => $t->id,
            'type'             => $t->type,
            'amount'           => $t->amount,
            'description'      => $t->description,
            'transaction_date' => $t->transaction_date->toDateString(),
            'category'         => $t->category ? ['id' => $t->category->id, 'name' => $t->category->name, 'color' => $t->category->color, 'icon' => $t->category->icon] : null,
            'account'          => $t->account ? ['id' => $t->account->id, 'name' => $t->account->name] : null,
            'person'           => $t->person  ? ['id' => $t->person->id,  'name' => $t->person->name]  : null,
        ];
    }
}
