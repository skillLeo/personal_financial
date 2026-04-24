<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Mail\ForgotPasswordMail;
use App\Mail\PasswordChangedMail;
use App\Mail\WelcomeVerifyMail;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private OtpService $otpService) {}

    /* ── Register ────────────────────────────────────────── */

    public function register(Request $request): JsonResponse
    {
        $throttleKey = 'api-register:' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            return $this->error('Too many registration attempts. Try again later.', 429);
        }

        $v = Validator::make($request->all(), [
            'name'          => ['required', 'string', 'max:100'],
            'email'         => ['required', 'email', 'unique:users,email'],
            'password'      => ['required', 'string', 'min:8', 'confirmed'],
            'business_name' => ['nullable', 'string', 'max:150'],
            'phone'         => ['nullable', 'string', 'max:20'],
            'currency'      => ['nullable', 'string', 'max:10'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        RateLimiter::hit($throttleKey, 3600);

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => $request->password,
            'business_name' => $request->business_name,
            'phone'         => $request->phone,
            'currency'      => $request->currency ?? 'PKR',
            'timezone'      => 'Asia/Karachi',
        ]);

        $otp = $this->otpService->generate($user->email, 'email_verification', 15);
        Mail::to($user->email)->send(new WelcomeVerifyMail($user->name, $otp));

        return $this->created([
            'email'   => $user->email,
            'message' => 'Registration successful. Please check your email for the verification code.',
        ], 'Account created. Verify your email to continue.');
    }

    /* ── Verify Email OTP ────────────────────────────────── */

    public function verifyEmail(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'otp'   => ['required', 'string', 'digits:6'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $throttleKey = 'api-verify-email:' . $request->email;
        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            return $this->error('Too many attempts. Try again later.', 429);
        }

        $valid = $this->otpService->verify($request->email, $request->otp, 'email_verification');
        if (!$valid) {
            RateLimiter::hit($throttleKey, 3600);
            return $this->error('Invalid or expired verification code.', 422);
        }

        RateLimiter::clear($throttleKey);

        $user = User::where('email', $request->email)->first();
        if (!$user) return $this->error('Account not found.', 404);

        $user->update(['email_verified_at' => now()]);

        $token = $user->createToken($request->device_name ?? 'flutter-app')->plainTextToken;
        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        return $this->success([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], 'Email verified successfully.');
    }

    /* ── Resend Verification ─────────────────────────────── */

    public function resendVerification(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['email' => ['required', 'email']]);
        if ($v->fails()) return $this->validationError($v);

        $throttleKey = 'api-resend-verify:' . $request->email;
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            return $this->error('Too many resend attempts. Try again later.', 429);
        }

        $user = User::where('email', $request->email)->whereNull('email_verified_at')->first();
        if ($user) {
            $otp = $this->otpService->generate($user->email, 'email_verification', 15);
            Mail::to($user->email)->send(new WelcomeVerifyMail($user->name, $otp));
            RateLimiter::hit($throttleKey, 3600);
        }

        return $this->success(null, 'If that email exists and is unverified, a new code has been sent.');
    }

    /* ── Login ───────────────────────────────────────────── */

    public function login(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'email'       => ['required', 'email'],
            'password'    => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $throttleKey = 'api-login:' . Str::lower($request->email) . ':' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return $this->error("Too many attempts. Try again in {$seconds} seconds.", 429);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 900);
            return $this->error('Invalid email or password.', 401);
        }

        if (!$user->is_active) {
            return $this->error('Your account has been deactivated.', 403);
        }

        if (!$user->email_verified_at) {
            return $this->error('Please verify your email before logging in.', 403, [
                'email_verified' => false,
                'email'          => $user->email,
            ]);
        }

        RateLimiter::clear($throttleKey);
        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        $token = $user->createToken($request->device_name ?? 'flutter-app')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], 'Login successful.');
    }

    /* ── Google Token Login (Flutter) ───────────────────── */

    public function googleLogin(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'id_token'    => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        // Verify token with Google's tokeninfo endpoint
        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $request->id_token,
        ]);

        if (!$response->ok()) {
            return $this->error('Invalid Google token.', 401);
        }

        $payload = $response->json();

        // Validate audience matches our app's client ID
        $clientId = config('services.google.client_id');
        if (!in_array($payload['aud'] ?? '', [$clientId], true)) {
            return $this->error('Token audience mismatch.', 401);
        }

        $googleId = $payload['sub'];
        $email    = $payload['email'];
        $name     = $payload['name'] ?? explode('@', $email)[0];
        $avatar   = $payload['picture'] ?? null;

        $user = User::where('google_id', $googleId)->first()
            ?? User::where('email', $email)->first();

        if ($user) {
            if (!$user->google_id) {
                $user->update(['google_id' => $googleId, 'avatar_url' => $avatar]);
            }
        } else {
            $user = User::create([
                'name'              => $name,
                'email'             => $email,
                'google_id'         => $googleId,
                'avatar_url'        => $avatar,
                'email_verified_at' => now(),
                'password'          => Str::random(32),
                'currency'          => 'PKR',
                'timezone'          => 'Asia/Karachi',
            ]);
        }

        if (!$user->is_active) {
            return $this->error('Your account has been deactivated.', 403);
        }

        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);
        $token = $user->createToken($request->device_name ?? 'flutter-app')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], 'Google login successful.');
    }

    /* ── Forgot Password ─────────────────────────────────── */

    public function forgotPassword(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['email' => ['required', 'email']]);
        if ($v->fails()) return $this->validationError($v);

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $otp = $this->otpService->generate($user->email, 'password_reset', 10);
            Mail::to($user->email)->send(new ForgotPasswordMail($user->name, $otp));
        }

        return $this->success(null, 'If that email is registered, a reset code has been sent.');
    }

    /* ── Verify Reset OTP ────────────────────────────────── */

    public function verifyResetOtp(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'otp'   => ['required', 'string', 'digits:6'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $throttleKey = 'api-verify-reset:' . $request->email;
        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            return $this->error('Too many attempts. Try again later.', 429);
        }

        $otp = \App\Models\Otp::where('email', $request->email)
            ->where('type', 'password_reset')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest('created_at')
            ->first();

        if (!$otp || !Hash::check($request->otp, $otp->otp)) {
            RateLimiter::hit($throttleKey, 3600);
            return $this->error('Invalid or expired reset code.', 422);
        }

        RateLimiter::clear($throttleKey);

        // Return a short-lived reset token (client sends it back with new password)
        $resetToken = hash('sha256', $request->email . ':' . $request->otp . ':' . now()->timestamp);

        return $this->success([
            'reset_token' => $resetToken,
            'email'       => $request->email,
        ], 'OTP verified. Proceed to set new password.');
    }

    /* ── Reset Password ──────────────────────────────────── */

    public function resetPassword(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'email'    => ['required', 'email'],
            'otp'      => ['required', 'string', 'digits:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $valid = $this->otpService->verify($request->email, $request->otp, 'password_reset');
        if (!$valid) {
            return $this->error('Invalid or expired reset code.', 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) return $this->error('Account not found.', 404);

        $user->update(['password' => $request->password]);
        $user->tokens()->delete();

        Mail::to($user->email)->send(new PasswordChangedMail(
            $user->name,
            $request->ip(),
            now()->format('d M Y, H:i T')
        ));

        $token = $user->createToken('flutter-app')->plainTextToken;

        return $this->success(['token' => $token, 'user' => $this->formatUser($user)], 'Password reset successfully.');
    }

    /* ── Authenticated endpoints ─────────────────────────── */

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->success(null, 'Logged out successfully.');
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return $this->success(null, 'All sessions terminated.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success($this->formatUser($request->user()));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $v = Validator::make($request->all(), [
            'name'          => ['sometimes', 'required', 'string', 'max:100'],
            'business_name' => ['nullable', 'string', 'max:150'],
            'phone'         => ['nullable', 'string', 'max:20'],
            'currency'      => ['nullable', 'string', 'max:10'],
            'timezone'      => ['nullable', 'string', 'max:50'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $user->update($request->only(['name', 'business_name', 'phone', 'currency', 'timezone']));
        return $this->success($this->formatUser($user->fresh()), 'Profile updated.');
    }

    public function updatePhoto(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['photo' => ['required', 'image', 'max:2048']]);
        if ($v->fails()) return $this->validationError($v);

        $user = $request->user();
        if ($user->profile_photo) Storage::disk('public')->delete($user->profile_photo);

        $path = $request->file('photo')->store('profiles', 'public');
        $user->update(['profile_photo' => $path, 'avatar_url' => null]);

        return $this->success(['profile_photo_url' => Storage::url($path)], 'Photo updated.');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $user = $request->user();
        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Current password is incorrect.', 422);
        }

        $user->update(['password' => $request->password]);
        $user->tokens()->delete();

        Mail::to($user->email)->send(new PasswordChangedMail(
            $user->name,
            $request->ip(),
            now()->format('d M Y, H:i T')
        ));

        $token = $user->createToken('flutter-app')->plainTextToken;
        return $this->success(['token' => $token], 'Password changed successfully.');
    }

    private function formatUser(User $user): array
    {
        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'business_name'     => $user->business_name,
            'phone'             => $user->phone,
            'currency'          => $user->currency ?? 'PKR',
            'timezone'          => $user->timezone,
            'plan'              => $user->plan ?? 'free',
            'avatar_url'        => $user->avatar,
            'email_verified'    => (bool) $user->email_verified_at,
            'has_google'        => (bool) $user->google_id,
            'last_login_at'     => $user->last_login_at?->toIso8601String(),
            'last_login_ip'     => $user->last_login_ip,
            'created_at'        => $user->created_at?->toIso8601String(),
        ];
    }
}
