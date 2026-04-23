<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Subscription;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Http\Requests\SubscriptionRequest;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $subscriptions = Subscription::where('user_id', $user->id)
            ->with(['account', 'category'])
            ->orderBy('next_due_date')
            ->get()
            ->map(fn($s) => $this->formatSub($s));

        $monthlyTotal = Subscription::where('user_id', $user->id)->active()
            ->get()
            ->sum(function ($s) {
                return match ($s->billing_cycle) {
                    'daily'     => $s->amount * 30,
                    'weekly'    => $s->amount * 4.33,
                    'monthly'   => $s->amount,
                    'quarterly' => $s->amount / 3,
                    'yearly'    => $s->amount / 12,
                    default     => $s->amount,
                };
            });

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'monthly_total' => 'Rs. ' . number_format($monthlyTotal, 0),
            'accounts'      => Account::where('user_id', $user->id)->get(['id', 'name']),
            'categories'    => Category::where('user_id', $user->id)->get(['id', 'name', 'color']),
        ]);
    }

    public function store(SubscriptionRequest $request)
    {
        $data            = $request->validated();
        $data['user_id'] = $request->user()->id;
        Subscription::create($data);
        return redirect()->route('subscriptions.index')->with('success', 'Subscription added.');
    }

    public function update(SubscriptionRequest $request, Subscription $subscription)
    {
        if ($subscription->user_id !== $request->user()->id) abort(403);
        $subscription->update($request->validated());
        return redirect()->route('subscriptions.index')->with('success', 'Subscription updated.');
    }

    public function destroy(Subscription $subscription)
    {
        if ($subscription->user_id !== auth()->id()) abort(403);
        $subscription->delete();
        return redirect()->route('subscriptions.index')->with('success', 'Subscription deleted.');
    }

    public function markAsPaid(Request $request, Subscription $subscription)
    {
        if ($subscription->user_id !== $request->user()->id) abort(403);

        $expenseCategory = Category::where('user_id', $request->user()->id)
            ->where('type', 'expense')
            ->first();

        $account = $subscription->account_id
            ? Account::find($subscription->account_id)
            : Account::where('user_id', $request->user()->id)->where('is_default', true)->first()
              ?? Account::where('user_id', $request->user()->id)->first();

        if ($expenseCategory && $account) {
            Transaction::create([
                'user_id'          => $request->user()->id,
                'account_id'       => $account->id,
                'category_id'      => $subscription->category_id ?? $expenseCategory->id,
                'type'             => 'expense',
                'amount'           => $subscription->amount,
                'description'      => 'Subscription: ' . $subscription->name,
                'transaction_date' => now()->toDateString(),
            ]);

            $income  = (float) Transaction::where('account_id', $account->id)->where('type', 'income')->sum('amount');
            $expense = (float) Transaction::where('account_id', $account->id)->where('type', 'expense')->sum('amount');
            $account->update(['balance' => $income - $expense]);
        }

        $subscription->update([
            'last_billed_date' => now(),
            'next_due_date'    => $subscription->calculateNextDueDate(),
        ]);

        return redirect()->route('subscriptions.index')->with('success', 'Subscription marked as paid.');
    }

    public function toggleStatus(Subscription $subscription)
    {
        if ($subscription->user_id !== auth()->id()) abort(403);
        $newStatus = $subscription->status === 'active' ? 'paused' : 'active';
        $subscription->update(['status' => $newStatus]);
        return back()->with('success', 'Subscription ' . $newStatus . '.');
    }

    private function formatSub(Subscription $s): array
    {
        return [
            'id'            => $s->id,
            'name'          => $s->name,
            'description'   => $s->description,
            'amount'        => $s->amount,
            'formatted'     => $s->formatted_amount,
            'billing_cycle' => $s->billing_cycle,
            'next_due_date' => $s->next_due_date?->format('Y-m-d'),
            'last_billed'   => $s->last_billed_date?->format('Y-m-d'),
            'status'        => $s->status,
            'logo_url'      => $s->logo_url,
            'reminder_days' => $s->reminder_days,
            'days_until_due'=> $s->days_until_due,
            'account'       => $s->account ? ['id' => $s->account->id, 'name' => $s->account->name] : null,
            'category'      => $s->category ? ['id' => $s->category->id, 'name' => $s->category->name, 'color' => $s->category->color] : null,
        ];
    }
}
