<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class FullSystemExport implements WithMultipleSheets
{
    public function __construct(private int $userId) {}

    public function sheets(): array
    {
        return [
            'Transactions'  => new SheetExport($this->userId, 'transactions'),
            'Accounts'      => new SheetExport($this->userId, 'accounts'),
            'People'        => new SheetExport($this->userId, 'people'),
            'Loans'         => new SheetExport($this->userId, 'loans'),
            'Subscriptions' => new SheetExport($this->userId, 'subscriptions'),
            'Employees'     => new SheetExport($this->userId, 'employees'),
            'Categories'    => new SheetExport($this->userId, 'categories'),
            'Budgets'       => new SheetExport($this->userId, 'budgets'),
        ];
    }
}
