<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Account;
use App\Models\Transaction;
use App\Http\Requests\AccountRequest;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $accounts = Account::where('user_id', $request->user()->id)
            ->get()
            ->map(fn($a) => [
                'id'               => $a->id,
                'name'             => $a->name,
                'type'             => $a->type,
                'balance'          => $a->balance,
                'formatted_balance'=> $a->formatted_balance,
                'color'            => $a->color,
                'icon'             => $a->icon,
                'is_default'       => $a->is_default,
                'notes'            => $a->notes,
            ]);

        return Inertia::render('Accounts/Index', ['accounts' => $accounts]);
    }

    public function store(AccountRequest $request)
    {
        $data            = $request->validated();
        $data['user_id'] = $request->user()->id;

        if (!empty($data['is_default'])) {
            Account::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        Account::create($data);
        return redirect()->route('accounts.index')->with('success', 'Account created successfully.');
    }

    public function update(AccountRequest $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) abort(403);

        if (!empty($request->is_default)) {
            Account::where('user_id', $request->user()->id)->where('id', '!=', $account->id)->update(['is_default' => false]);
        }

        $account->update($request->validated());
        return redirect()->route('accounts.index')->with('success', 'Account updated.');
    }

    public function destroy(Account $account)
    {
        if ($account->user_id !== auth()->id()) abort(403);
        if (Transaction::where('account_id', $account->id)->exists()) {
            return back()->with('error', 'Cannot delete account with transactions. Remove transactions first.');
        }
        $account->delete();
        return redirect()->route('accounts.index')->with('success', 'Account deleted.');
    }

    public function statement(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) abort(403);

        $transactions = Transaction::where('account_id', $account->id)
            ->with(['category', 'person'])
            ->orderByDesc('transaction_date')
            ->paginate(30);

        return Inertia::render('Accounts/Statement', [
            'account'      => $account,
            'transactions' => $transactions,
        ]);
    }
}
