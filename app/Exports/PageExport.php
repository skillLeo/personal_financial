<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PageExport implements FromArray, WithTitle, WithStyles
{
    public function __construct(
        private string $title,
        private array $headers,
        private array $rows,
        private array $summary = []
    ) {}

    public function array(): array
    {
        $data = [];

        if (!empty($this->summary)) {
            $data[] = array_keys($this->summary);
            $data[] = array_values($this->summary);
            $data[] = [];
        }

        $data[] = $this->headers;
        foreach ($this->rows as $row) {
            $data[] = $row;
        }

        return $data;
    }

    public function title(): string
    {
        return $this->title;
    }

    public function styles(Worksheet $sheet): array
    {
        $summaryRows = empty($this->summary) ? 0 : 3;
        $headerRow   = $summaryRows + 1;

        return [
            $headerRow => [
                'font' => ['bold' => true],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'ECFDF5']],
            ],
        ];
    }
}
