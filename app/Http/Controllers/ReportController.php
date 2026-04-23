<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Category;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TransactionsExport;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user      = $request->user();
        $fromDate  = $request->from_date ?? now()->startOfMonth()->toDateString();
        $toDate    = $request->to_date   ?? now()->endOfMonth()->toDateString();

        $incomeStatement = $this->buildIncomeStatement($user->id, $fromDate, $toDate);
        $cashFlow        = $this->buildCashFlow($user->id);
        $expenseBreakdown= $this->buildExpenseBreakdown($user->id, $fromDate, $toDate);
        $monthlyComparison = $this->buildMonthlyComparison($user->id);

        return Inertia::render('Reports/Index', [
            'income_statement'  => $incomeStatement,
            'cash_flow'         => $cashFlow,
            'expense_breakdown' => $expenseBreakdown,
            'monthly_comparison'=> $monthlyComparison,
            'filters'           => ['from_date' => $fromDate, 'to_date' => $toDate],
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user     = $request->user();
        $fromDate = $request->from_date ?? now()->startOfMonth()->toDateString();
        $toDate   = $request->to_date   ?? now()->endOfMonth()->toDateString();
        $data     = $this->buildIncomeStatement($user->id, $fromDate, $toDate);
        $data['user']      = $user;
        $data['from_date'] = $fromDate;
        $data['to_date']   = $toDate;

        $pdf = Pdf::loadView('reports.income_statement', $data);
        $pdf->setPaper('A4');
        return $pdf->download('income-statement-' . $fromDate . '-to-' . $toDate . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        $user     = $request->user();
        $fromDate = $request->from_date ?? now()->startOfMonth()->toDateString();
        $toDate   = $request->to_date   ?? now()->endOfMonth()->toDateString();
        return Excel::download(new TransactionsExport($user->id, $fromDate, $toDate), 'transactions.xlsx');
    }

    private function buildIncomeStatement(int $userId, string $from, string $to): array
    {
        $incomeByCategory = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total')
            ->with('category')
            ->groupBy('category_id')
            ->get()
            ->map(fn($t) => [
                'name'    => $t->category?->name ?? 'Other',
                'total'   => (float) $t->total,
                'formatted'=> 'Rs. ' . number_format($t->total, 0),
            ]);

        $expenseByCategory = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total')
            ->with('category')
            ->groupBy('category_id')
            ->get()
            ->map(fn($t) => [
                'name'    => $t->category?->name ?? 'Other',
                'color'   => $t->category?->color ?? '#6B7280',
                'total'   => (float) $t->total,
                'formatted'=> 'Rs. ' . number_format($t->total, 0),
            ]);

        $totalIncome  = $incomeByCategory->sum('total');
        $totalExpense = $expenseByCategory->sum('total');
        $netProfit    = $totalIncome - $totalExpense;

        return [
            'income_categories'  => $incomeByCategory,
            'expense_categories' => $expenseByCategory,
            'total_income'       => $totalIncome,
            'total_expense'      => $totalExpense,
            'net_profit'         => $netProfit,
            'income_formatted'   => 'Rs. ' . number_format($totalIncome, 0),
            'expense_formatted'  => 'Rs. ' . number_format($totalExpense, 0),
            'net_formatted'      => 'Rs. ' . number_format(abs($netProfit), 0),
            'is_profit'          => $netProfit >= 0,
        ];
    }

    private function buildCashFlow(int $userId): array
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd   = now()->subWeeks($i)->endOfWeek();
            $income    = (float) Transaction::where('user_id', $userId)->where('type', 'income')
                ->whereBetween('transaction_date', [$weekStart, $weekEnd])->sum('amount');
            $expense   = (float) Transaction::where('user_id', $userId)->where('type', 'expense')
                ->whereBetween('transaction_date', [$weekStart, $weekEnd])->sum('amount');
            $data[] = [
                'week'    => 'W' . $weekStart->week,
                'label'   => $weekStart->format('d M'),
                'income'  => $income,
                'expense' => $expense,
                'net'     => $income - $expense,
            ];
        }
        return $data;
    }

    private function buildExpenseBreakdown(int $userId, string $from, string $to): array
    {
        return Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total')
            ->with('category')
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn($t) => [
                'name'      => $t->category?->name ?? 'Other',
                'color'     => $t->category?->color ?? '#6B7280',
                'value'     => (float) $t->total,
                'formatted' => 'Rs. ' . number_format($t->total, 0),
            ])
            ->toArray();
    }

    private function buildMonthlyComparison(int $userId): array
    {
        $current  = now()->startOfMonth();
        $previous = now()->subMonth()->startOfMonth();

        $data = [];
        $categories = Category::where('user_id', $userId)->where('type', 'expense')->limit(8)->get();

        foreach ($categories as $cat) {
            $currentSpend  = (float) Transaction::where('user_id', $userId)
                ->where('category_id', $cat->id)->where('type', 'expense')
                ->whereBetween('transaction_date', [$current, $current->copy()->endOfMonth()])
                ->sum('amount');
            $previousSpend = (float) Transaction::where('user_id', $userId)
                ->where('category_id', $cat->id)->where('type', 'expense')
                ->whereBetween('transaction_date', [$previous, $previous->copy()->endOfMonth()])
                ->sum('amount');

            $data[] = [
                'category' => $cat->name,
                'current'  => $currentSpend,
                'previous' => $previousSpend,
                'color'    => $cat->color,
            ];
        }

        return $data;
    }
}
