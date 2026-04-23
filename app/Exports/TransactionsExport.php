<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function __construct(
        private int    $userId,
        private string $fromDate,
        private string $toDate,
    ) {}

    public function collection()
    {
        return Transaction::where('user_id', $this->userId)
            ->whereBetween('transaction_date', [$this->fromDate, $this->toDate])
            ->with(['category', 'account', 'person'])
            ->orderByDesc('transaction_date')
            ->get();
    }

    public function headings(): array
    {
        return ['Date', 'Type', 'Description', 'Category', 'Account', 'Person', 'Amount (Rs.)'];
    }

    public function map($t): array
    {
        return [
            $t->transaction_date?->format('d/m/Y'),
            ucfirst($t->type),
            $t->description ?? '',
            $t->category?->name ?? '',
            $t->account?->name ?? '',
            $t->person?->name ?? '',
            number_format($t->amount, 2),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0F172A']]],
        ];
    }
}
