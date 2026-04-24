<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'email', 'otp', 'type', 'expires_at', 'used_at', 'created_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at'    => 'datetime',
        'created_at' => 'datetime',
    ];

    public function isExpired(): bool
    {
        return now()->isAfter($this->expires_at);
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function markUsed(): void
    {
        $this->update(['used_at' => now()]);
    }
}
