<?php

namespace App\Models;

use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasUserScope;

    protected $table = 'notifications_log';

    protected $fillable = [
        'user_id', 'title', 'message', 'type', 'is_read',
        'related_model_type', 'related_model_id',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
