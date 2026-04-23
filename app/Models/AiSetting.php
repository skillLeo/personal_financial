<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class AiSetting extends Model
{
    protected $fillable = [
        'user_id', 'provider', 'api_key', 'model', 'custom_endpoint', 'is_enabled',
    ];

    protected $hidden = ['api_key'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function setApiKeyAttribute($value): void
    {
        $this->attributes['api_key'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getDecryptedApiKey(): ?string
    {
        if (!$this->attributes['api_key']) return null;
        try {
            return Crypt::decryptString($this->attributes['api_key']);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getEndpointUrl(): string
    {
        return match ($this->provider) {
            'anthropic' => 'https://api.anthropic.com/v1/messages',
            'custom'    => $this->custom_endpoint ?? '',
            default     => 'https://api.openai.com/v1/chat/completions',
        };
    }
}
