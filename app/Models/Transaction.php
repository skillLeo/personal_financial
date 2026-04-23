<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'account_id', 'category_id', 'person_id', 'type',
        'amount', 'description', 'transaction_date', 'transaction_time',
        'reference_number', 'is_recurring', 'recurring_type',
        'recurring_end_date', 'next_recurring_date', 'sync_status', 'local_id',
    ];

    protected function casts(): array
    {
        return [
            'amount'           => 'float',
            'transaction_date' => 'date',
            'is_recurring'     => 'boolean',
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

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function photos()
    {
        return $this->hasMany(TransactionPhoto::class);
    }

    public function salaryPayment()
    {
        return $this->hasOne(SalaryPayment::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->amount, 0);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeDateRange($query, ?string $from, ?string $to)
    {
        if ($from) $query->whereDate('transaction_date', '>=', $from);
        if ($to)   $query->whereDate('transaction_date', '<=', $to);
        return $query;
    }

    public function scopeForCategory($query, ?int $categoryId)
    {
        return $categoryId ? $query->where('category_id', $categoryId) : $query;
    }

    public function scopeForPerson($query, ?int $personId)
    {
        return $personId ? $query->where('person_id', $personId) : $query;
    }

    public function scopeForAccount($query, ?int $accountId)
    {
        return $accountId ? $query->where('account_id', $accountId) : $query;
    }

    public function scopeKeywordSearch($query, ?string $keyword)
    {
        return $keyword
            ? $query->where('description', 'like', "%{$keyword}%")
            : $query;
    }
}
