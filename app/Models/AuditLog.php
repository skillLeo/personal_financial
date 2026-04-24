<?php

namespace App\Models;

use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasUserScope;
    protected $fillable = [
        'user_id', 'action', 'description', 'metadata', 'ip_address',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(int $userId, string $action, string $description, array $metadata = [], ?string $ip = null): void
    {
        static::create([
            'user_id'     => $userId,
            'action'      => $action,
            'description' => $description,
            'metadata'    => $metadata,
            'ip_address'  => $ip,
        ]);
    }
}
