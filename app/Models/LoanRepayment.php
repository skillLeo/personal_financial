<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanRepayment extends Model
{
    protected $fillable = ['loan_id', 'amount', 'repayment_date', 'notes'];

    protected function casts(): array
    {
        return [
            'amount'         => 'float',
            'repayment_date' => 'date',
        ];
    }

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->amount, 0);
    }
}
