<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $accounts = Account::where('user_id', $request->user()->id)->get()->map(fn($a) => $this->fmt($a));
        return $this->success($accounts);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $a = Account::where('user_id', $request->user()->id)->find($id);
        if (!$a) return $this->notFound('Account not found.');
        return $this->success($this->fmt($a));
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name'            => ['required', 'string', 'max:100'],
            'type'            => ['required', 'in:cash,bank,jazzcash,easypaisa,other'],
            'account_type'    => ['nullable', 'in:business_bank,personal_bank,cash,mobile_wallet,savings'],
            'is_cash_account' => ['boolean'],
            'balance'         => ['nullable', 'numeric', 'min:0'],
            'color'           => ['nullable', 'string', 'max:10'],
            'icon'            => ['nullable', 'string', 'max:50'],
            'is_default'      => ['boolean'],
            'notes'           => ['nullable', 'string', 'max:500'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        if ($request->boolean('is_default')) {
            Account::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $account = Account::create([
            ...$request->only(['name', 'type', 'account_type', 'balance', 'color', 'icon', 'notes']),
            'user_id'         => $request->user()->id,
            'is_default'      => $request->boolean('is_default'),
            'is_cash_account' => $request->boolean('is_cash_account'),
        ]);

        return $this->created($this->fmt($account));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $account = Account::where('user_id', $request->user()->id)->find($id);
        if (!$account) return $this->notFound('Account not found.');

        $v = Validator::make($request->all(), [
            'name'            => ['sometimes', 'string', 'max:100'],
            'type'            => ['sometimes', 'in:cash,bank,jazzcash,easypaisa,other'],
            'account_type'    => ['nullable', 'in:business_bank,personal_bank,cash,mobile_wallet,savings'],
            'is_cash_account' => ['boolean'],
            'color'           => ['nullable', 'string', 'max:10'],
            'icon'            => ['nullable', 'string', 'max:50'],
            'is_default'      => ['boolean'],
            'notes'           => ['nullable', 'string', 'max:500'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        if ($request->boolean('is_default')) {
            Account::where('user_id', $request->user()->id)->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $account->update($request->only(['name', 'type', 'account_type', 'is_cash_account', 'color', 'icon', 'is_default', 'notes']));
        return $this->success($this->fmt($account->fresh()), 'Account updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $account = Account::where('user_id', $request->user()->id)->find($id);
        if (!$account) return $this->notFound('Account not found.');

        if ($account->transactions()->exists()) {
            return $this->error('Cannot delete an account that has transactions.', 422);
        }

        $account->delete();
        return $this->success(null, 'Account deleted.');
    }

    public function statement(Request $request, int $id): JsonResponse
    {
        $account = Account::where('user_id', $request->user()->id)->find($id);
        if (!$account) return $this->notFound('Account not found.');

        $perPage = min((int) ($request->per_page ?? 20), 100);
        $query   = Transaction::where('account_id', $id)
            ->with(['category', 'person'])
            ->orderByDesc('transaction_date')->orderByDesc('created_at');

        if ($request->filled('from_date')) $query->whereDate('transaction_date', '>=', $request->from_date);
        if ($request->filled('to_date'))   $query->whereDate('transaction_date', '<=', $request->to_date);
        if ($request->filled('type'))      $query->where('type', $request->type);

        $paginator   = $query->paginate($perPage);
        $runBalance  = $account->balance;
        $allTxns     = Transaction::where('account_id', $id)
            ->orderByDesc('transaction_date')->orderByDesc('created_at')->get();

        // Compute running balance per transaction
        $runMap = [];
        $bal    = $account->balance;
        foreach ($allTxns as $txn) {
            $runMap[$txn->id] = $bal;
            if ($txn->type === 'income')  $bal -= $txn->amount;
            if ($txn->type === 'expense') $bal += $txn->amount;
        }

        $paginator->getCollection()->transform(function ($t) use ($runMap) {
            return [
                'id'              => $t->id,
                'type'            => $t->type,
                'amount'          => (float) $t->amount,
                'description'     => $t->description,
                'transaction_date'=> $t->transaction_date->toDateString(),
                'running_balance' => (float) ($runMap[$t->id] ?? 0),
                'category'        => $t->category ? ['name' => $t->category->name, 'color' => $t->category->color] : null,
                'person'          => $t->person   ? ['name' => $t->person->name] : null,
            ];
        });

        $totalIn  = (float) Transaction::where('account_id', $id)->where('type', 'income')->sum('amount');
        $totalOut = (float) Transaction::where('account_id', $id)->where('type', 'expense')->sum('amount');

        return $this->success([
            'account'      => $this->fmt($account),
            'summary'      => ['total_in' => $totalIn, 'total_out' => $totalOut, 'balance' => $account->balance],
            'transactions' => $paginator->items(),
            'meta'         => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    private function fmt(Account $a): array
    {
        return [
            'id'              => $a->id,
            'name'            => $a->name,
            'type'            => $a->type,
            'account_type'    => $a->account_type,
            'is_cash_account' => (bool) $a->is_cash_account,
            'balance'         => (float) $a->balance,
            'color'           => $a->color,
            'icon'            => $a->icon,
            'is_default'      => (bool) $a->is_default,
            'notes'           => $a->notes,
            'created_at'      => $a->created_at->toIso8601String(),
        ];
    }
}
