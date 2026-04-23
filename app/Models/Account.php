<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'type', 'balance', 'color', 'icon', 'is_default', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'balance'    => 'float',
            'is_default' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function getFormattedBalanceAttribute(): string
    {
        return 'Rs. ' . number_format($this->balance, 0);
    }

    public function computedBalance(): float
    {
        $income   = (float) $this->transactions()->where('type', 'income')->sum('amount');
        $expenses = (float) $this->transactions()->where('type', 'expense')->sum('amount');
        return $income - $expenses;
    }
}
