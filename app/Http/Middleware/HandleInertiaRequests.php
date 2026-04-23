<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\NotificationLog;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $unreadCount = 0;
        if ($request->user()) {
            $unreadCount = NotificationLog::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'           => $request->user()->id,
                    'name'         => $request->user()->name,
                    'email'        => $request->user()->email,
                    'business_name'=> $request->user()->business_name,
                    'phone'        => $request->user()->phone,
                    'profile_photo'=> $request->user()->profile_photo
                        ? asset('storage/' . $request->user()->profile_photo)
                        : null,
                    'currency'     => $request->user()->currency,
                    'timezone'     => $request->user()->timezone,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'info'    => $request->session()->get('info'),
            ],
            'notifications_count' => $unreadCount,
        ];
    }
}
