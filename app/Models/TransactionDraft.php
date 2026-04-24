<?php

namespace App\Models;

use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;

class TransactionDraft extends Model
{
    use HasUserScope;
    protected $fillable = [
        'user_id', 'amount', 'label', 'type',
        'voice_note_path', 'converted_at', 'discarded_at',
    ];

    protected $casts = [
        'amount'       => 'float',
        'converted_at' => 'datetime',
        'discarded_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending($query)
    {
        return $query->whereNull('converted_at')->whereNull('discarded_at');
    }
}
