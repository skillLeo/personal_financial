<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            Log::channel('single')->info('User activity', [
                'user_id' => $request->user()->id,
                'method'  => $request->method(),
                'url'     => $request->fullUrl(),
                'ip'      => $request->ip(),
            ]);
        }

        return $response;
    }
}
