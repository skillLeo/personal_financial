<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class FullSystemImport implements WithMultipleSheets
{
    private array $stats = [];

    public function __construct(private int $userId, private string $mode) {}

    public function sheets(): array
    {
        return [
            0 => new SheetImport($this->userId, 'transactions', $this->mode, $this->stats),
            1 => new SheetImport($this->userId, 'accounts', $this->mode, $this->stats),
            2 => new SheetImport($this->userId, 'people', $this->mode, $this->stats),
            3 => new SheetImport($this->userId, 'loans', $this->mode, $this->stats),
            4 => new SheetImport($this->userId, 'subscriptions', $this->mode, $this->stats),
            5 => new SheetImport($this->userId, 'employees', $this->mode, $this->stats),
            6 => new SheetImport($this->userId, 'categories', $this->mode, $this->stats),
            7 => new SheetImport($this->userId, 'budgets', $this->mode, $this->stats),
        ];
    }

    public function getStats(): array
    {
        return $this->stats;
    }
}
