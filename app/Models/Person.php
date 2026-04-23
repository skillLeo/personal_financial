<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Person extends Model
{
    use HasFactory;

    protected $table = 'people';

    protected $fillable = [
        'user_id', 'name', 'phone', 'email', 'relationship', 'photo', 'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }

    public function totalGiven(): float
    {
        return (float) $this->transactions()->where('type', 'expense')->sum('amount');
    }

    public function totalReceived(): float
    {
        return (float) $this->transactions()->where('type', 'income')->sum('amount');
    }

    public function netBalance(): float
    {
        return $this->totalReceived() - $this->totalGiven();
    }
}
