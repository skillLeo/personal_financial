<?php

namespace App\Models;

use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory, HasUserScope;

    protected $fillable = [
        'user_id', 'name', 'role', 'email', 'phone', 'joining_date',
        'monthly_salary', 'account_id', 'photo', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'monthly_salary' => 'float',
            'joining_date'   => 'date',
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

    public function salaryPayments()
    {
        return $this->hasMany(SalaryPayment::class);
    }

    public function lastPayment()
    {
        return $this->hasOne(SalaryPayment::class)->latestOfMany('payment_date');
    }

    public function getFormattedSalaryAttribute(): string
    {
        return 'Rs. ' . number_format($this->monthly_salary, 0);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }

    public function isPaidForMonth(string $monthYear): bool
    {
        return $this->salaryPayments()->where('month_year', $monthYear)->exists();
    }
}
