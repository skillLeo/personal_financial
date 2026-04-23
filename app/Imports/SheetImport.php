<?php

namespace App\Imports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class SheetImport implements ToCollection, WithHeadingRow
{
    private int $imported = 0;

    public function __construct(
        private int    $userId,
        private string $table,
        private string $mode,
        private array  &$stats
    ) {}

    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) return;

        if ($this->mode === 'replace') {
            DB::table($this->table)->where('user_id', $this->userId)->delete();
        }

        foreach ($rows as $row) {
            $data = $row->toArray();
            if (empty(array_filter($data))) continue;

            // Strip the ID so auto-increment works; inject user_id
            unset($data['id'], $data['ID']);
            $data['user_id'] = $this->userId;

            // Remove columns that don't belong
            $allowed = $this->allowedColumns();
            $data = array_intersect_key($data, array_flip($allowed));

            if (!empty($data)) {
                DB::table($this->table)->insert($data);
                $this->imported++;
            }
        }

        $this->stats[$this->table] = $this->imported;
    }

    private function allowedColumns(): array
    {
        return match ($this->table) {
            'transactions'  => ['user_id', 'account_id', 'category_id', 'person_id', 'type', 'amount', 'description', 'transaction_date', 'transaction_time', 'reference_number'],
            'accounts'      => ['user_id', 'name', 'type', 'balance', 'color', 'icon', 'is_default', 'notes'],
            'people'        => ['user_id', 'name', 'phone', 'email', 'relationship', 'notes'],
            'loans'         => ['user_id', 'person_id', 'type', 'total_amount', 'paid_amount', 'remaining_amount', 'interest_rate', 'loan_date', 'due_date', 'status', 'notes'],
            'subscriptions' => ['user_id', 'name', 'description', 'amount', 'billing_cycle', 'next_due_date', 'status'],
            'employees'     => ['user_id', 'name', 'role', 'email', 'phone', 'joining_date', 'monthly_salary', 'status'],
            'categories'    => ['user_id', 'name', 'type', 'color', 'icon'],
            'budgets'       => ['user_id', 'category_id', 'name', 'amount', 'period', 'start_date', 'end_date'],
            default         => [],
        };
    }
}
