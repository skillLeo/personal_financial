<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserOwnsResource
{
    public function handle(Request $request, Closure $next, string $model = ''): Response
    {
        if ($model && $request->route($model)) {
            $resource = $request->route($model);
            if (isset($resource->user_id) && $resource->user_id !== $request->user()->id) {
                abort(403, 'You do not have permission to access this resource.');
            }
        }

        return $next($request);
    }
}
