<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionPhoto extends Model
{
    protected $fillable = [
        'transaction_id', 'photo_path', 'photo_type', 'original_name', 'file_size',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->photo_path);
    }
}
