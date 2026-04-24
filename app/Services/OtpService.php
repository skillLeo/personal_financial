<?php

namespace App\Services;

use App\Models\Otp;
use Illuminate\Support\Facades\Hash;

class OtpService
{
    public function generate(string $email, string $type, int $expiresInMinutes = 15): string
    {
        // Invalidate any existing unused OTPs of this type for this email
        Otp::where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->delete();

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Otp::create([
            'email'      => $email,
            'otp'        => Hash::make($code),
            'type'       => $type,
            'expires_at' => now()->addMinutes($expiresInMinutes),
            'created_at' => now(),
        ]);

        return $code;
    }

    public function verify(string $email, string $code, string $type): bool
    {
        $otp = Otp::where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->latest('created_at')
            ->first();

        if (!$otp) return false;
        if ($otp->isExpired()) return false;
        if (!Hash::check($code, $otp->otp)) return false;

        $otp->markUsed();
        return true;
    }

    public function hasValidOtp(string $email, string $type): bool
    {
        return Otp::where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->exists();
    }
}
