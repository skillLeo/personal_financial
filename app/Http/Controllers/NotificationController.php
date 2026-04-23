<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\NotificationLog;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = NotificationLog::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Notifications/Index', ['notifications' => $notifications]);
    }

    public function markAsRead(Request $request, NotificationLog $notification)
    {
        if ($notification->user_id !== $request->user()->id) abort(403);
        $notification->update(['is_read' => true]);
        return back();
    }

    public function markAllAsRead(Request $request)
    {
        NotificationLog::where('user_id', $request->user()->id)->update(['is_read' => true]);
        return back()->with('success', 'All notifications marked as read.');
    }

    public function dismiss(Request $request, NotificationLog $notification)
    {
        if ($notification->user_id !== $request->user()->id) abort(403);
        $notification->delete();
        return back();
    }

    public function getRecent(Request $request)
    {
        $notifications = NotificationLog::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();
        return response()->json($notifications);
    }
}
