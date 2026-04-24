<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            RateLimiter::for('api', function (Request $request) {
                return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
            });
            RateLimiter::for('ai-insights', function (Request $request) {
                return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
            });
            RateLimiter::for('register', function (Request $request) {
                return Limit::perHour(5)->by($request->ip());
            });
            RateLimiter::for('otp-verify', function (Request $request) {
                return Limit::perHour(10)->by($request->input('email', $request->ip()));
            });
            RateLimiter::for('otp-resend', function (Request $request) {
                return Limit::perHour(3)->by($request->input('email', $request->ip()));
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        // Allow Sanctum stateful domains + add CORS for API
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'owns.resource'    => \App\Http\Middleware\EnsureUserOwnsResource::class,
            'log.activity'     => \App\Http\Middleware\LogUserActivity::class,
            'email.verified'   => \App\Http\Middleware\EnsureEmailVerified::class,
            'admin'            => \App\Http\Middleware\EnsureIsAdmin::class,
        ]);

        // Return proper 401 JSON for unauthenticated API requests
        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('api/*')) {
                abort(response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401));
            }
            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }
        });
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
            }
        });
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Resource not found.'], 404);
            }
        });
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }
        });
    })->create();
