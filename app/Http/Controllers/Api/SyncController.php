<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Category;
use App\Models\Person;
use App\Models\Loan;
use App\Models\Subscription;
use App\Models\Employee;
use App\Models\NotificationLog;

class SyncController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'income_this_month'   => $user->totalIncomeThisMonth(),
            'expenses_this_month' => $user->totalExpensesThisMonth(),
            'net_balance'         => $user->netBalance(),
            'total_savings'       => $user->totalSavings(),
        ]);
    }

    public function getTransactions(Request $request)
    {
        $query = Transaction::where('user_id', $request->user()->id)
            ->with(['category', 'account', 'person']);

        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('from')) $query->whereDate('transaction_date', '>=', $request->from);
        if ($request->filled('to'))   $query->whereDate('transaction_date', '<=', $request->to);

        return response()->json($query->orderByDesc('transaction_date')->paginate(50));
    }

    public function storeTransaction(Request $request)
    {
        $request->validate([
            'account_id'       => ['required', 'integer', 'exists:accounts,id'],
            'category_id'      => ['required', 'integer', 'exists:categories,id'],
            'type'             => ['required', 'in:income,expense,transfer'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['required', 'date'],
        ]);

        $transaction = Transaction::create([
            ...$request->only(['account_id', 'category_id', 'person_id', 'type', 'amount', 'description', 'transaction_date', 'reference_number', 'local_id']),
            'user_id'     => $request->user()->id,
            'sync_status' => 'synced',
        ]);

        $this->recalcBalance($transaction->account_id);
        return response()->json($transaction, 201);
    }

    public function bulkSync(Request $request)
    {
        $request->validate(['transactions' => ['required', 'array']]);
        $created = [];
        $errors  = [];

        foreach ($request->transactions as $i => $txData) {
            try {
                $t = Transaction::updateOrCreate(
                    ['local_id' => $txData['local_id'] ?? null, 'user_id' => $request->user()->id],
                    [
                        'user_id'          => $request->user()->id,
                        'account_id'       => $txData['account_id'],
                        'category_id'      => $txData['category_id'],
                        'person_id'        => $txData['person_id'] ?? null,
                        'type'             => $txData['type'],
                        'amount'           => $txData['amount'],
                        'description'      => $txData['description'] ?? null,
                        'transaction_date' => $txData['transaction_date'],
                        'local_id'         => $txData['local_id'] ?? null,
                        'sync_status'      => 'synced',
                    ]
                );
                $this->recalcBalance($t->account_id);
                $created[] = $t->id;
            } catch (\Throwable $e) {
                $errors[] = ['index' => $i, 'error' => $e->getMessage()];
            }
        }

        return response()->json(['created' => $created, 'errors' => $errors]);
    }

    public function pendingChanges(Request $request)
    {
        $since = $request->since ?? now()->subDay()->toDateTimeString();
        $user  = $request->user();

        return response()->json([
            'transactions' => Transaction::where('user_id', $user->id)->where('updated_at', '>=', $since)->get(),
            'accounts'     => Account::where('user_id', $user->id)->where('updated_at', '>=', $since)->get(),
            'categories'   => Category::where('user_id', $user->id)->where('updated_at', '>=', $since)->get(),
            'people'       => Person::where('user_id', $user->id)->where('updated_at', '>=', $since)->get(),
            'loans'        => Loan::where('user_id', $user->id)->where('updated_at', '>=', $since)->get(),
            'timestamp'    => now()->toDateTimeString(),
        ]);
    }

    public function acknowledge(Request $request)
    {
        $request->validate(['transaction_ids' => ['array']]);
        if (!empty($request->transaction_ids)) {
            Transaction::whereIn('id', $request->transaction_ids)
                ->where('user_id', $request->user()->id)
                ->update(['sync_status' => 'synced']);
        }
        return response()->json(['message' => 'Acknowledged.']);
    }

    private function recalcBalance(int $accountId): void
    {
        $account = Account::find($accountId);
        if (!$account) return;
        $income  = (float) Transaction::where('account_id', $accountId)->where('type', 'income')->sum('amount');
        $expense = (float) Transaction::where('account_id', $accountId)->where('type', 'expense')->sum('amount');
        $account->update(['balance' => $income - $expense]);
    }
}
