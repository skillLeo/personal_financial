<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SheetExport implements FromArray, WithTitle, WithStyles
{
    private array $headers;
    private array $rows;

    public function __construct(private int $userId, private string $table)
    {
        [$this->headers, $this->rows] = $this->getData();
    }

    public function array(): array
    {
        return array_merge([$this->headers], $this->rows);
    }

    public function title(): string
    {
        return ucfirst($this->table);
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'ECFDF5']]],
        ];
    }

    private function getData(): array
    {
        $uid = $this->userId;
        return match ($this->table) {
            'transactions' => [
                ['ID', 'Date', 'Type', 'Amount', 'Category', 'Account', 'Person', 'Description', 'Reference'],
                DB::table('transactions')
                    ->where('transactions.user_id', $uid)
                    ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
                    ->leftJoin('accounts', 'transactions.account_id', '=', 'accounts.id')
                    ->leftJoin('people', 'transactions.person_id', '=', 'people.id')
                    ->select('transactions.id', 'transaction_date', 'transactions.type', 'amount',
                        'categories.name as category', 'accounts.name as account',
                        'people.name as person', 'description', 'reference_number')
                    ->orderByDesc('transaction_date')
                    ->get()->map(fn($r) => [$r->id, $r->transaction_date, $r->type, (float)$r->amount,
                        $r->category, $r->account, $r->person, $r->description, $r->reference_number])->toArray(),
            ],
            'accounts' => [
                ['ID', 'Name', 'Type', 'Balance', 'Color', 'Is Default', 'Notes'],
                DB::table('accounts')->where('user_id', $uid)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->type, (float)$r->balance, $r->color, $r->is_default ? 'Yes' : 'No', $r->notes])->toArray(),
            ],
            'people' => [
                ['ID', 'Name', 'Phone', 'Email', 'Relationship', 'Notes'],
                DB::table('people')->where('user_id', $uid)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->phone, $r->email, $r->relationship, $r->notes])->toArray(),
            ],
            'loans' => [
                ['ID', 'Person', 'Type', 'Total Amount', 'Paid', 'Remaining', 'Status', 'Loan Date', 'Due Date'],
                DB::table('loans')->where('loans.user_id', $uid)
                    ->leftJoin('people', 'loans.person_id', '=', 'people.id')
                    ->select('loans.id', 'people.name as person', 'loans.type', 'total_amount',
                        'paid_amount', 'remaining_amount', 'status', 'loan_date', 'due_date')
                    ->get()->map(fn($r) => [$r->id, $r->person, $r->type, (float)$r->total_amount,
                        (float)$r->paid_amount, (float)$r->remaining_amount, $r->status, $r->loan_date, $r->due_date])->toArray(),
            ],
            'subscriptions' => [
                ['ID', 'Name', 'Amount', 'Billing Cycle', 'Next Due Date', 'Status'],
                DB::table('subscriptions')->where('user_id', $uid)
                    ->get()->map(fn($r) => [$r->id, $r->name, (float)$r->amount, $r->billing_cycle, $r->next_due_date, $r->status])->toArray(),
            ],
            'employees' => [
                ['ID', 'Name', 'Role', 'Email', 'Phone', 'Monthly Salary', 'Status', 'Joining Date'],
                DB::table('employees')->where('user_id', $uid)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->role, $r->email, $r->phone, (float)$r->monthly_salary, $r->status, $r->joining_date])->toArray(),
            ],
            'categories' => [
                ['ID', 'Name', 'Type', 'Color'],
                DB::table('categories')->where('user_id', $uid)
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->type, $r->color])->toArray(),
            ],
            'budgets' => [
                ['ID', 'Name', 'Category', 'Amount', 'Period', 'Start Date', 'End Date'],
                DB::table('budgets')->where('budgets.user_id', $uid)
                    ->leftJoin('categories', 'budgets.category_id', '=', 'categories.id')
                    ->select('budgets.id', 'budgets.name', 'categories.name as category', 'budgets.amount', 'period', 'start_date', 'end_date')
                    ->get()->map(fn($r) => [$r->id, $r->name, $r->category, (float)$r->amount, $r->period, $r->start_date, $r->end_date])->toArray(),
            ],
            default => [[], []],
        };
    }
}
