<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int)($request->per_page ?? 20), 100);
        $query   = Subscription::where('user_id', $request->user()->id)->with(['account', 'category']);
        if ($request->filled('status')) $query->where('status', $request->status);
        $paginator = $query->orderBy('next_due_date')->paginate($perPage);
        $paginator->getCollection()->transform(fn($s) => $this->fmt($s));
        return $this->success($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)->with(['account', 'category'])->find($id);
        if (!$sub) return $this->notFound('Subscription not found.');
        return $this->success($this->fmt($sub));
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name'           => ['required', 'string', 'max:100'],
            'amount'         => ['required', 'numeric', 'min:0'],
            'billing_cycle'  => ['required', 'in:daily,weekly,monthly,quarterly,yearly'],
            'next_due_date'  => ['required', 'date'],
            'account_id'     => ['nullable', 'integer', 'exists:accounts,id'],
            'category_id'    => ['nullable', 'integer', 'exists:categories,id'],
            'description'    => ['nullable', 'string', 'max:500'],
            'logo_url'       => ['nullable', 'string', 'max:255'],
            'reminder_days'  => ['nullable', 'integer', 'min:0', 'max:30'],
            'status'         => ['nullable', 'in:active,paused,cancelled'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $sub = Subscription::create([
            ...$request->only(['name', 'amount', 'billing_cycle', 'next_due_date', 'account_id', 'category_id', 'description', 'logo_url', 'reminder_days']),
            'user_id' => $request->user()->id,
            'status'  => $request->status ?? 'active',
        ]);
        $sub->load(['account', 'category']);
        return $this->created($this->fmt($sub));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)->find($id);
        if (!$sub) return $this->notFound('Subscription not found.');

        $v = Validator::make($request->all(), [
            'name'           => ['sometimes', 'string', 'max:100'],
            'amount'         => ['sometimes', 'numeric', 'min:0'],
            'billing_cycle'  => ['sometimes', 'in:daily,weekly,monthly,quarterly,yearly'],
            'next_due_date'  => ['sometimes', 'date'],
            'account_id'     => ['nullable', 'integer', 'exists:accounts,id'],
            'status'         => ['sometimes', 'in:active,paused,cancelled'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $sub->update($request->only(['name', 'amount', 'billing_cycle', 'next_due_date', 'account_id', 'category_id', 'description', 'logo_url', 'reminder_days', 'status']));
        $sub->load(['account', 'category']);
        return $this->success($this->fmt($sub), 'Subscription updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)->find($id);
        if (!$sub) return $this->notFound('Subscription not found.');
        $sub->delete();
        return $this->success(null, 'Subscription deleted.');
    }

    public function markPaid(Request $request, int $id): JsonResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)->find($id);
        if (!$sub) return $this->notFound('Subscription not found.');

        $sub->update(['last_billed_date' => now()->toDateString(), 'next_due_date' => $this->nextDue($sub)]);

        if ($sub->account_id) {
            Transaction::create([
                'user_id'          => $request->user()->id,
                'account_id'       => $sub->account_id,
                'category_id'      => $sub->category_id,
                'type'             => 'expense',
                'amount'           => $sub->amount,
                'description'      => 'Subscription: ' . $sub->name,
                'transaction_date' => now()->toDateString(),
            ]);
        }
        $sub->load(['account', 'category']);
        return $this->success($this->fmt($sub), 'Subscription marked as paid.');
    }

    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)->find($id);
        if (!$sub) return $this->notFound('Subscription not found.');

        $newStatus = $sub->status === 'active' ? 'paused' : 'active';
        $sub->update(['status' => $newStatus]);
        return $this->success(['status' => $newStatus], 'Status updated.');
    }

    private function nextDue(Subscription $sub): string
    {
        $date = \Carbon\Carbon::parse($sub->next_due_date);
        return match ($sub->billing_cycle) {
            'daily'     => $date->addDay()->toDateString(),
            'weekly'    => $date->addWeek()->toDateString(),
            'monthly'   => $date->addMonth()->toDateString(),
            'quarterly' => $date->addMonths(3)->toDateString(),
            'yearly'    => $date->addYear()->toDateString(),
            default     => $date->addMonth()->toDateString(),
        };
    }

    private function fmt(Subscription $s): array
    {
        return [
            'id'             => $s->id,
            'name'           => $s->name,
            'description'    => $s->description,
            'amount'         => (float) $s->amount,
            'billing_cycle'  => $s->billing_cycle,
            'next_due_date'  => $s->next_due_date?->toDateString(),
            'last_billed_date'=> $s->last_billed_date?->toDateString(),
            'status'         => $s->status,
            'logo_url'       => $s->logo_url,
            'reminder_days'  => $s->reminder_days,
            'is_overdue'     => $s->next_due_date && $s->next_due_date->isPast() && $s->status === 'active',
            'account'        => $s->account  ? ['id' => $s->account->id,  'name' => $s->account->name]  : null,
            'category'       => $s->category ? ['id' => $s->category->id, 'name' => $s->category->name] : null,
            'created_at'     => $s->created_at->toIso8601String(),
        ];
    }
}
