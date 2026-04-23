<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PageExport;

class ExportController extends Controller
{
    public function transactions(Request $request)
    {
        $user    = $request->user();
        $format  = $request->input('format', 'csv');
        $filters = $request->only(['type', 'account_id', 'category_id', 'person_id', 'date_from', 'date_to', 'search']);

        $query = DB::table('transactions')
            ->where('transactions.user_id', $user->id)
            ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
            ->leftJoin('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->leftJoin('people', 'transactions.person_id', '=', 'people.id')
            ->select('transactions.id', 'transaction_date', 'transactions.type', 'transactions.amount',
                'categories.name as category', 'accounts.name as account',
                'people.name as person', 'transactions.description', 'reference_number');

        if (!empty($filters['type']))        $query->where('transactions.type', $filters['type']);
        if (!empty($filters['account_id'])) $query->where('transactions.account_id', $filters['account_id']);
        if (!empty($filters['category_id'])) $query->where('transactions.category_id', $filters['category_id']);
        if (!empty($filters['person_id']))  $query->where('transactions.person_id', $filters['person_id']);
        if (!empty($filters['date_from']))  $query->whereDate('transaction_date', '>=', $filters['date_from']);
        if (!empty($filters['date_to']))    $query->whereDate('transaction_date', '<=', $filters['date_to']);
        if (!empty($filters['search']))     $query->where('transactions.description', 'like', '%' . $filters['search'] . '%');

        $records = $query->orderByDesc('transaction_date')->get();

        $totalIncome   = $records->where('type', 'income')->sum('amount');
        $totalExpenses = $records->where('type', 'expense')->sum('amount');

        $headers = ['ID', 'Date', 'Type', 'Amount', 'Category', 'Account', 'Person', 'Description', 'Reference'];
        $rows    = $records->map(fn($r) => [$r->id, $r->transaction_date, $r->type, (float)$r->amount,
            $r->category, $r->account, $r->person, $r->description, $r->reference_number])->toArray();

        $summary = [
            'Period'         => (!empty($filters['date_from']) ? $filters['date_from'] : 'All') . ' to ' . (!empty($filters['date_to']) ? $filters['date_to'] : 'All'),
            'Total Income'   => number_format($totalIncome, 2),
            'Total Expenses' => number_format($totalExpenses, 2),
            'Net Balance'    => number_format($totalIncome - $totalExpenses, 2),
        ];

        $filename = 'transactions_' . now()->format('Y_m_d');
        return $this->respond($format, 'Transactions', $headers, $rows, $filename, $summary);
    }

    public function accounts(Request $request)
    {
        $user    = $request->user();
        $format  = $request->input('format', 'csv');
        $records = DB::table('accounts')->where('user_id', $user->id)->get();

        $headers = ['ID', 'Name', 'Type', 'Balance', 'Color', 'Is Default', 'Notes'];
        $rows    = $records->map(fn($r) => [$r->id, $r->name, $r->type, (float)$r->balance, $r->color, $r->is_default ? 'Yes' : 'No', $r->notes])->toArray();

        return $this->respond($format, 'Accounts', $headers, $rows, 'accounts_' . now()->format('Y_m_d'));
    }

    public function people(Request $request)
    {
        $user    = $request->user();
        $format  = $request->input('format', 'csv');
        $records = DB::table('people')->where('user_id', $user->id)->get();

        $headers = ['ID', 'Name', 'Phone', 'Email', 'Relationship', 'Notes'];
        $rows    = $records->map(fn($r) => [$r->id, $r->name, $r->phone, $r->email, $r->relationship, $r->notes])->toArray();

        return $this->respond($format, 'People', $headers, $rows, 'people_' . now()->format('Y_m_d'));
    }

    public function loans(Request $request)
    {
        $user    = $request->user();
        $format  = $request->input('format', 'csv');
        $filters = $request->only(['status', 'type']);

        $query = DB::table('loans')->where('loans.user_id', $user->id)
            ->leftJoin('people', 'loans.person_id', '=', 'people.id')
            ->select('loans.id', 'people.name as person', 'loans.type', 'total_amount',
                'paid_amount', 'remaining_amount', 'status', 'loan_date', 'due_date');

        if (!empty($filters['status'])) $query->where('loans.status', $filters['status']);
        if (!empty($filters['type']))   $query->where('loans.type', $filters['type']);

        $records = $query->get();
        $headers = ['ID', 'Person', 'Type', 'Total Amount', 'Paid', 'Remaining', 'Status', 'Loan Date', 'Due Date'];
        $rows    = $records->map(fn($r) => [$r->id, $r->person, $r->type, (float)$r->total_amount,
            (float)$r->paid_amount, (float)$r->remaining_amount, $r->status, $r->loan_date, $r->due_date])->toArray();

        return $this->respond($format, 'Loans', $headers, $rows, 'loans_' . now()->format('Y_m_d'));
    }

    public function subscriptions(Request $request)
    {
        $user    = $request->user();
        $format  = $request->input('format', 'csv');
        $records = DB::table('subscriptions')->where('user_id', $user->id)->get();

        $headers = ['ID', 'Name', 'Amount', 'Billing Cycle', 'Next Due Date', 'Status'];
        $rows    = $records->map(fn($r) => [$r->id, $r->name, (float)$r->amount, $r->billing_cycle, $r->next_due_date, $r->status])->toArray();

        return $this->respond($format, 'Subscriptions', $headers, $rows, 'subscriptions_' . now()->format('Y_m_d'));
    }

    public function employees(Request $request)
    {
        $user    = $request->user();
        $format  = $request->input('format', 'csv');
        $records = DB::table('employees')->where('user_id', $user->id)->get();

        $headers = ['ID', 'Name', 'Role', 'Email', 'Phone', 'Monthly Salary', 'Status', 'Joining Date'];
        $rows    = $records->map(fn($r) => [$r->id, $r->name, $r->role, $r->email, $r->phone, (float)$r->monthly_salary, $r->status, $r->joining_date])->toArray();

        return $this->respond($format, 'Employees', $headers, $rows, 'employees_' . now()->format('Y_m_d'));
    }

    public function budgets(Request $request)
    {
        $user    = $request->user();
        $format  = $request->input('format', 'csv');
        $records = DB::table('budgets')->where('budgets.user_id', $user->id)
            ->leftJoin('categories', 'budgets.category_id', '=', 'categories.id')
            ->select('budgets.id', 'budgets.name', 'categories.name as category', 'budgets.amount', 'period', 'start_date', 'end_date')
            ->get();

        $headers = ['ID', 'Name', 'Category', 'Amount', 'Period', 'Start Date', 'End Date'];
        $rows    = $records->map(fn($r) => [$r->id, $r->name, $r->category, (float)$r->amount, $r->period, $r->start_date, $r->end_date])->toArray();

        return $this->respond($format, 'Budgets', $headers, $rows, 'budgets_' . now()->format('Y_m_d'));
    }

    /* ─── Shared response builder ──────────────────────────────────── */

    private function respond(
        string $format,
        string $sheetTitle,
        array $headers,
        array $rows,
        string $filename,
        array $summary = []
    ) {
        if ($format === 'xlsx') {
            return Excel::download(
                new PageExport($sheetTitle, $headers, $rows, $summary),
                "{$filename}.xlsx"
            );
        }

        // CSV fallback
        $tmpFile = tempnam(sys_get_temp_dir(), 'skillleo_csv_');
        $fp      = fopen($tmpFile, 'w');

        if (!empty($summary)) {
            fputcsv($fp, array_keys($summary));
            fputcsv($fp, array_values($summary));
            fputcsv($fp, []);
        }

        fputcsv($fp, $headers);
        foreach ($rows as $row) fputcsv($fp, $row);
        fclose($fp);

        return response()->download($tmpFile, "{$filename}.csv", ['Content-Type' => 'text/csv'])
            ->deleteFileAfterSend(true);
    }
}
