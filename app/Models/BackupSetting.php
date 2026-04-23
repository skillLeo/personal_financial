<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BackupSetting extends Model
{
    protected $fillable = [
        'user_id', 'schedule', 'backup_time', 'backup_day', 'max_backups',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
