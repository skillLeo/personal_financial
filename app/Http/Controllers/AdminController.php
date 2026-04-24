<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $totalUsers    = User::count();
        $newThisWeek   = User::where('created_at', '>=', now()->startOfWeek())->count();
        $activeUsers   = User::where('is_active', true)->count();
        $verifiedUsers = User::whereNotNull('email_verified_at')->count();
        $googleUsers   = User::whereNotNull('google_id')->count();
        $proUsers      = User::where('plan', 'pro')->count();
        $newToday      = User::whereDate('created_at', today())->count();

        $recentUsers = User::latest()
            ->take(10)
            ->get(['id', 'name', 'email', 'plan', 'is_active', 'email_verified_at', 'last_login_at', 'created_at']);

        return Inertia::render('Admin/Index', [
            'stats' => [
                'total_users'    => $totalUsers,
                'new_this_week'  => $newThisWeek,
                'new_today'      => $newToday,
                'active_users'   => $activeUsers,
                'verified_users' => $verifiedUsers,
                'google_users'   => $googleUsers,
                'pro_users'      => $proUsers,
            ],
            'recent_users' => $recentUsers,
        ]);
    }
}
