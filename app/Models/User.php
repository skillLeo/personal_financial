<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name', 'business_name', 'email', 'password', 'phone',
        'profile_photo', 'avatar_url', 'currency', 'timezone',
        'pin_code', 'last_login_at', 'last_login_ip',
        'google_id', 'is_active', 'is_admin', 'plan',
        'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token', 'pin_code'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'is_admin'          => 'boolean',
            'dark_mode'         => 'boolean',
        ];
    }

    public function getAvatarAttribute(): ?string
    {
        if ($this->avatar_url) return $this->avatar_url;
        if ($this->profile_photo) return asset('storage/' . $this->profile_photo);
        return null;
    }

    public function accounts()       { return $this->hasMany(Account::class); }
    public function categories()     { return $this->hasMany(Category::class); }
    public function people()         { return $this->hasMany(Person::class); }
    public function transactions()   { return $this->hasMany(Transaction::class); }
    public function loans()          { return $this->hasMany(Loan::class); }
    public function subscriptions()  { return $this->hasMany(Subscription::class); }
    public function employees()      { return $this->hasMany(Employee::class); }
    public function budgets()        { return $this->hasMany(Budget::class); }
    public function notificationLogs() { return $this->hasMany(NotificationLog::class); }
    public function aiSetting()      { return $this->hasOne(AiSetting::class); }
    public function backupSetting()  { return $this->hasOne(BackupSetting::class); }
    public function transfers()      { return $this->hasMany(Transfer::class); }

    public function totalIncomeThisMonth(): float
    {
        return (float) $this->transactions()
            ->where('type', 'income')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');
    }

    public function totalExpensesThisMonth(): float
    {
        return (float) $this->transactions()
            ->where('type', 'expense')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');
    }

    public function netBalance(): float
    {
        return $this->totalIncomeThisMonth() - $this->totalExpensesThisMonth();
    }

    public function totalSavings(): float
    {
        $income  = (float) $this->transactions()->where('type', 'income')->sum('amount');
        $expense = (float) $this->transactions()->where('type', 'expense')->sum('amount');
        return $income - $expense;
    }
}
