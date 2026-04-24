<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    public function summary(Request $request): JsonResponse
    {
        $userId   = $request->user()->id;
        $fromDate = $request->from_date ?? now()->startOfMonth()->toDateString();
        $toDate   = $request->to_date   ?? now()->endOfMonth()->toDateString();

        return $this->success([
            'period'             => ['from' => $fromDate, 'to' => $toDate],
            'income_statement'   => $this->buildIncomeStatement($userId, $fromDate, $toDate),
            'expense_breakdown'  => $this->buildExpenseBreakdown($userId, $fromDate, $toDate),
            'cash_flow'          => $this->buildCashFlow($userId),
            'monthly_comparison' => $this->buildMonthlyComparison($userId),
        ]);
    }

    public function incomeStatement(Request $request): JsonResponse
    {
        $userId   = $request->user()->id;
        $fromDate = $request->from_date ?? now()->startOfMonth()->toDateString();
        $toDate   = $request->to_date   ?? now()->endOfMonth()->toDateString();
        return $this->success(['period' => ['from' => $fromDate, 'to' => $toDate], ...$this->buildIncomeStatement($userId, $fromDate, $toDate)]);
    }

    public function expenseBreakdown(Request $request): JsonResponse
    {
        $userId   = $request->user()->id;
        $fromDate = $request->from_date ?? now()->startOfMonth()->toDateString();
        $toDate   = $request->to_date   ?? now()->endOfMonth()->toDateString();
        return $this->success(['period' => ['from' => $fromDate, 'to' => $toDate], ...$this->buildExpenseBreakdown($userId, $fromDate, $toDate)]);
    }

    public function cashFlow(Request $request): JsonResponse
    {
        return $this->success($this->buildCashFlow($request->user()->id));
    }

    private function buildIncomeStatement(int $userId, string $from, string $to): array
    {
        $incomeByCategory = Transaction::where('user_id', $userId)->where('type', 'income')
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total')->with('category')
            ->groupBy('category_id')->orderByDesc('total')->get()
            ->map(fn($t) => ['category_id' => $t->category_id, 'name' => $t->category?->name ?? 'Other', 'color' => $t->category?->color ?? '#10B981', 'total' => (float) $t->total]);

        $expenseByCategory = Transaction::where('user_id', $userId)->where('type', 'expense')
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total')->with('category')
            ->groupBy('category_id')->orderByDesc('total')->get()
            ->map(fn($t) => ['category_id' => $t->category_id, 'name' => $t->category?->name ?? 'Other', 'color' => $t->category?->color ?? '#EF4444', 'total' => (float) $t->total]);

        $totalIncome  = $incomeByCategory->sum('total');
        $totalExpense = $expenseByCategory->sum('total');

        return [
            'income_categories'  => $incomeByCategory->toArray(),
            'expense_categories' => $expenseByCategory->toArray(),
            'total_income'       => $totalIncome,
            'total_expense'      => $totalExpense,
            'net_profit'         => $totalIncome - $totalExpense,
            'savings_rate'       => $totalIncome > 0 ? round((($totalIncome - $totalExpense) / $totalIncome) * 100, 1) : 0,
        ];
    }

    private function buildExpenseBreakdown(int $userId, string $from, string $to): array
    {
        $totalExpense = (float) Transaction::where('user_id', $userId)->where('type', 'expense')
            ->whereBetween('transaction_date', [$from, $to])->sum('amount');

        $breakdown = Transaction::where('user_id', $userId)->where('type', 'expense')
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total, COUNT(*) as count')->with('category')
            ->groupBy('category_id')->orderByDesc('total')->get()
            ->map(fn($t) => [
                'category_id' => $t->category_id,
                'name'        => $t->category?->name ?? 'Uncategorised',
                'color'       => $t->category?->color ?? '#6B7280',
                'icon'        => $t->category?->icon,
                'total'       => (float) $t->total,
                'count'       => (int) $t->count,
                'percentage'  => $totalExpense > 0 ? round(($t->total / $totalExpense) * 100, 1) : 0,
            ]);

        return ['total_expense' => $totalExpense, 'categories' => $breakdown->toArray()];
    }

    private function buildCashFlow(int $userId): array
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month  = Carbon::now()->subMonths($i);
            $start  = $month->copy()->startOfMonth();
            $end    = $month->copy()->endOfMonth();
            $income = (float) Transaction::where('user_id', $userId)->where('type', 'income')->whereBetween('transaction_date', [$start, $end])->sum('amount');
            $expense= (float) Transaction::where('user_id', $userId)->where('type', 'expense')->whereBetween('transaction_date', [$start, $end])->sum('amount');
            $months[] = ['month' => $month->format('Y-m'), 'label' => $month->format('M Y'), 'income' => $income, 'expense' => $expense, 'net' => $income - $expense];
        }
        return ['monthly' => $months];
    }

    private function buildMonthlyComparison(int $userId): array
    {
        $thisMonth  = Carbon::now();
        $lastMonth  = Carbon::now()->subMonth();
        $thisIncome = (float) Transaction::where('user_id', $userId)->where('type', 'income')->whereMonth('transaction_date', $thisMonth->month)->whereYear('transaction_date', $thisMonth->year)->sum('amount');
        $thisExpense= (float) Transaction::where('user_id', $userId)->where('type', 'expense')->whereMonth('transaction_date', $thisMonth->month)->whereYear('transaction_date', $thisMonth->year)->sum('amount');
        $lastIncome = (float) Transaction::where('user_id', $userId)->where('type', 'income')->whereMonth('transaction_date', $lastMonth->month)->whereYear('transaction_date', $lastMonth->year)->sum('amount');
        $lastExpense= (float) Transaction::where('user_id', $userId)->where('type', 'expense')->whereMonth('transaction_date', $lastMonth->month)->whereYear('transaction_date', $lastMonth->year)->sum('amount');

        return [
            'this_month' => ['label' => $thisMonth->format('M Y'), 'income' => $thisIncome, 'expense' => $thisExpense, 'net' => $thisIncome - $thisExpense],
            'last_month' => ['label' => $lastMonth->format('M Y'), 'income' => $lastIncome, 'expense' => $lastExpense, 'net' => $lastIncome - $lastExpense],
            'income_change'  => $lastIncome  > 0 ? round((($thisIncome  - $lastIncome)  / $lastIncome)  * 100, 1) : null,
            'expense_change' => $lastExpense > 0 ? round((($thisExpense - $lastExpense) / $lastExpense) * 100, 1) : null,
        ];
    }
}
