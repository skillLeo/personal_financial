<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\NotificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int)($request->per_page ?? 20), 100);
        $query   = NotificationLog::where('user_id', $request->user()->id)->orderByDesc('created_at');
        if ($request->filled('unread_only') && $request->boolean('unread_only')) $query->where('is_read', false);
        $paginator = $query->paginate($perPage);
        $paginator->getCollection()->transform(fn($n) => $this->fmt($n));
        return $this->success($paginator);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $n = NotificationLog::where('user_id', $request->user()->id)->find($id);
        if (!$n) return $this->notFound('Notification not found.');
        $n->update(['is_read' => true]);
        return $this->success($this->fmt($n), 'Marked as read.');
    }

    public function markAllRead(Request $request): JsonResponse
    {
        NotificationLog::where('user_id', $request->user()->id)->where('is_read', false)->update(['is_read' => true]);
        return $this->success(null, 'All notifications marked as read.');
    }

    public function dismiss(Request $request, int $id): JsonResponse
    {
        $n = NotificationLog::where('user_id', $request->user()->id)->find($id);
        if (!$n) return $this->notFound('Notification not found.');
        $n->delete();
        return $this->success(null, 'Notification dismissed.');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = NotificationLog::where('user_id', $request->user()->id)->where('is_read', false)->count();
        return $this->success(['count' => $count]);
    }

    private function fmt(NotificationLog $n): array
    {
        return [
            'id'         => $n->id,
            'title'      => $n->title,
            'message'    => $n->message,
            'type'       => $n->type,
            'is_read'    => (bool) $n->is_read,
            'created_at' => $n->created_at->toIso8601String(),
        ];
    }
}
