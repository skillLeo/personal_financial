<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['email' => 'Google authentication failed. Please try again.']);
        }

        $user = User::where('google_id', $googleUser->getId())->first()
            ?? User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Link Google account if not already linked
            if (!$user->google_id) {
                $user->update([
                    'google_id'  => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar(),
                ]);
            }
        } else {
            // Create new user from Google
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'avatar_url'        => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'password'          => \Illuminate\Support\Str::random(32),
                'currency'          => 'PKR',
                'timezone'          => 'Asia/Karachi',
            ]);
        }

        if (!$user->is_active) {
            return redirect()->route('login')->withErrors(['email' => 'Your account has been deactivated.']);
        }

        Auth::login($user, true);
        $request->session()->regenerate();
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        return redirect()->intended(route('dashboard'));
    }
}
