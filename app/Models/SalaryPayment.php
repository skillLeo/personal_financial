<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryPayment extends Model
{
    protected $fillable = [
        'employee_id', 'amount', 'payment_date', 'month_year',
        'payment_method', 'notes', 'transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'float',
            'payment_date' => 'date',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->amount, 0);
    }
}
