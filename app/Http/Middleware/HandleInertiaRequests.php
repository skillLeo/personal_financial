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
        $user         = $request->user();
        $unreadCount  = 0;

        if ($user) {
            $unreadCount = NotificationLog::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'               => $user->id,
                    'name'             => $user->name,
                    'email'            => $user->email,
                    'business_name'    => $user->business_name,
                    'phone'            => $user->phone,
                    'avatar'           => $user->avatar, // resolves avatar_url or profile_photo
                    'currency'         => $user->currency ?? 'PKR',
                    'timezone'         => $user->timezone,
                    'plan'             => $user->plan ?? 'free',
                    'is_admin'         => (bool) $user->is_admin,
                    'email_verified'   => (bool) $user->email_verified_at,
                    'has_google'       => (bool) $user->google_id,
                    'last_login_at'    => $user->last_login_at?->toIso8601String(),
                    'last_login_ip'    => $user->last_login_ip,
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
