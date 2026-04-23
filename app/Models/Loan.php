<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'person_id', 'type', 'total_amount', 'paid_amount',
        'remaining_amount', 'interest_rate', 'loan_date', 'due_date',
        'status', 'notes', 'photo',
    ];

    protected function casts(): array
    {
        return [
            'total_amount'     => 'float',
            'paid_amount'      => 'float',
            'remaining_amount' => 'float',
            'interest_rate'    => 'float',
            'loan_date'        => 'date',
            'due_date'         => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function repayments()
    {
        return $this->hasMany(LoanRepayment::class);
    }

    public function getFormattedTotalAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->total_amount, 0);
    }

    public function getFormattedRemainingAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->remaining_amount, 0);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_amount <= 0) return 0;
        return round(($this->paid_amount / $this->total_amount) * 100, 1);
    }

    public function getDueDateStatusAttribute(): string
    {
        if (!$this->due_date) return 'none';
        $days = now()->diffInDays($this->due_date, false);
        if ($days < 0) return 'overdue';
        if ($days <= 7) return 'urgent';
        if ($days <= 30) return 'approaching';
        return 'ok';
    }

    protected static function booted(): void
    {
        static::saving(function (self $loan) {
            $loan->remaining_amount = $loan->total_amount - $loan->paid_amount;
        });
    }
}
