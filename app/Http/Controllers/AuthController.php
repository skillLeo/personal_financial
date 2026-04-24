<?php

namespace App\Http\Controllers;

use App\Mail\ForgotPasswordMail;
use App\Mail\WelcomeVerifyMail;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function __construct(private OtpService $otpService) {}

    /* ── Login ───────────────────────────────────────────── */

    public function showLogin()
    {
        if (Auth::check()) return redirect()->route('dashboard');
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $throttleKey = 'login:' . Str::lower($request->email) . ':' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ])->onlyInput('email');
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 900); // 15 min lockout window
            return back()->withErrors(['email' => 'Invalid email or password.'])->onlyInput('email');
        }

        if (!$user->is_active) {
            return back()->withErrors(['email' => 'Your account has been deactivated. Please contact support.'])->onlyInput('email');
        }

        if (!$user->email_verified_at) {
            // Resend OTP and redirect to verify screen
            $otp = $this->otpService->generate($user->email, 'email_verification', 15);
            Mail::to($user->email)->send(new WelcomeVerifyMail($user->name, $otp));
            return redirect()->route('verify-email.show', ['email' => $user->email])
                ->with('info', 'Your email is not verified. We sent a new code.');
        }

        RateLimiter::clear($throttleKey);

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }

    /* ── Register ────────────────────────────────────────── */

    public function showRegister()
    {
        if (Auth::check()) return redirect()->route('dashboard');
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'                  => ['required', 'string', 'max:100'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'currency' => 'PKR',
            'timezone' => 'Asia/Karachi',
        ]);

        $otp = $this->otpService->generate($user->email, 'email_verification', 15);
        Mail::to($user->email)->send(new WelcomeVerifyMail($user->name, $otp));

        return redirect()->route('verify-email.show', ['email' => $user->email])
            ->with('success', 'Account created! Please check your email for the verification code.');
    }

    /* ── Email Verification ──────────────────────────────── */

    public function showVerifyEmail(Request $request)
    {
        if (Auth::check() && Auth::user()->email_verified_at) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Auth/VerifyEmail', [
            'email' => $request->query('email', ''),
        ]);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp'   => ['required', 'string', 'digits:6'],
        ]);

        $throttleKey = 'verify-email:' . $request->email;
        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            return back()->withErrors(['otp' => 'Too many attempts. Please try again later.']);
        }

        $valid = $this->otpService->verify($request->email, $request->otp, 'email_verification');

        if (!$valid) {
            RateLimiter::hit($throttleKey, 3600);
            return back()->withErrors(['otp' => 'Invalid or expired verification code.']);
        }

        RateLimiter::clear($throttleKey);

        $user = User::where('email', $request->email)->first();
        if (!$user) return back()->withErrors(['email' => 'Account not found.']);

        $user->update(['email_verified_at' => now()]);

        Auth::login($user);
        $request->session()->regenerate();
        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        return redirect()->route('dashboard')->with('success', 'Email verified! Welcome to SkillLeo.');
    }

    public function resendVerification(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $throttleKey = 'resend-verify:' . $request->email;
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Too many resend attempts. Try again in {$seconds} seconds.",
            ]);
        }

        $user = User::where('email', $request->email)->whereNull('email_verified_at')->first();
        if ($user) {
            $otp = $this->otpService->generate($user->email, 'email_verification', 15);
            Mail::to($user->email)->send(new WelcomeVerifyMail($user->name, $otp));
            RateLimiter::hit($throttleKey, 3600);
        }

        return back()->with('success', 'If that email exists and is unverified, a new code has been sent.');
    }

    /* ── Forgot Password ─────────────────────────────────── */

    public function showForgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendForgotOtp(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $otp = $this->otpService->generate($user->email, 'password_reset', 10);
            Mail::to($user->email)->send(new ForgotPasswordMail($user->name, $otp));
        }

        // Always redirect to OTP screen — don't leak whether email exists
        return redirect()->route('password.verify-otp.show', ['email' => $request->email])
            ->with('success', 'If that email is registered, a reset code has been sent.');
    }

    public function showVerifyResetOtp(Request $request)
    {
        return Inertia::render('Auth/VerifyResetOtp', [
            'email' => $request->query('email', ''),
        ]);
    }

    public function verifyResetOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp'   => ['required', 'string', 'digits:6'],
        ]);

        $throttleKey = 'verify-reset:' . $request->email;
        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            return back()->withErrors(['otp' => 'Too many attempts. Please try again later.']);
        }

        // Peek: verify without consuming (we consume on final reset)
        $otp = \App\Models\Otp::where('email', $request->email)
            ->where('type', 'password_reset')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest('created_at')
            ->first();

        if (!$otp || !\Illuminate\Support\Facades\Hash::check($request->otp, $otp->otp)) {
            RateLimiter::hit($throttleKey, 3600);
            return back()->withErrors(['otp' => 'Invalid or expired reset code.']);
        }

        RateLimiter::clear($throttleKey);

        // Store OTP in session token (not the raw code) so reset screen can confirm
        $token = hash('sha256', $request->email . $request->otp . now()->timestamp);
        session(['password_reset_token' => $token, 'password_reset_email' => $request->email]);

        return redirect()->route('password.reset.show');
    }

    public function showResetPassword()
    {
        if (!session('password_reset_email')) {
            return redirect()->route('password.forgot')->with('error', 'Please start the reset process again.');
        }
        return Inertia::render('Auth/ResetPassword');
    }

    public function resetPassword(Request $request)
    {
        $email = session('password_reset_email');
        if (!$email) {
            return redirect()->route('password.forgot')->with('error', 'Session expired. Please try again.');
        }

        $request->validate([
            'otp'                   => ['required', 'string', 'digits:6'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        // Final verification — this consumes the OTP
        $valid = $this->otpService->verify($email, $request->otp, 'password_reset');
        if (!$valid) {
            return back()->withErrors(['otp' => 'Invalid or expired reset code. Please request a new one.']);
        }

        $user = User::where('email', $email)->first();
        if (!$user) return redirect()->route('login')->withErrors(['email' => 'Account not found.']);

        $user->update(['password' => $request->password]);
        $user->tokens()->delete(); // revoke all Sanctum tokens

        session()->forget(['password_reset_token', 'password_reset_email']);

        // Send confirmation email
        Mail::to($user->email)->send(new \App\Mail\PasswordChangedMail(
            $user->name,
            $request->ip(),
            now()->format('d M Y, H:i T')
        ));

        return redirect()->route('login')->with('success', 'Password reset successfully. Please sign in.');
    }
}
