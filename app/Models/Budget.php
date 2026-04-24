<?php

namespace App\Models;

use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Budget extends Model
{
    use HasFactory, HasUserScope;

    protected $fillable = [
        'user_id', 'category_id', 'name', 'amount',
        'period', 'start_date', 'end_date', 'alert_at_percentage',
    ];

    protected function casts(): array
    {
        return [
            'amount'               => 'float',
            'start_date'           => 'date',
            'end_date'             => 'date',
            'alert_at_percentage'  => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->amount, 0);
    }

    public function currentSpending(): float
    {
        $query = Transaction::where('user_id', $this->user_id)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$this->start_date, $this->end_date]);

        if ($this->category_id) {
            $query->where('category_id', $this->category_id);
        }

        return (float) $query->sum('amount');
    }

    public function percentageUsed(): float
    {
        if ($this->amount <= 0) return 0;
        return round(($this->currentSpending() / $this->amount) * 100, 1);
    }

    public function isOverAlert(): bool
    {
        return $this->percentageUsed() >= $this->alert_at_percentage;
    }
}
