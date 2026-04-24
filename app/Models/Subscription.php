<?php

namespace App\Models;

use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subscription extends Model
{
    use HasFactory, HasUserScope;

    protected $fillable = [
        'user_id', 'account_id', 'name', 'description', 'amount',
        'billing_cycle', 'next_due_date', 'last_billed_date',
        'status', 'logo_url', 'reminder_days', 'category_id',
    ];

    protected function casts(): array
    {
        return [
            'amount'          => 'float',
            'next_due_date'   => 'date',
            'last_billed_date'=> 'date',
            'reminder_days'   => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->amount, 0);
    }

    public function getDaysUntilDueAttribute(): int
    {
        return (int) now()->startOfDay()->diffInDays($this->next_due_date, false);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDueSoon($query, int $days = 7)
    {
        return $query->active()
            ->whereDate('next_due_date', '<=', now()->addDays($days))
            ->whereDate('next_due_date', '>=', now());
    }

    public function calculateNextDueDate(): string
    {
        $current = $this->next_due_date ?? now();
        return match ($this->billing_cycle) {
            'daily'     => $current->addDay(),
            'weekly'    => $current->addWeek(),
            'monthly'   => $current->addMonth(),
            'quarterly' => $current->addMonths(3),
            'yearly'    => $current->addYear(),
            default     => $current->addMonth(),
        };
    }
}
