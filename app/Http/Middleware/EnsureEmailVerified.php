<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->email_verified_at) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your email address is not verified.',
                    'email_verified' => false,
                ], 403);
            }

            return redirect()->route('verify-email.show', [
                'email' => $request->user()?->email ?? '',
            ])->with('info', 'Please verify your email to continue.');
        }

        return $next($request);
    }
}
