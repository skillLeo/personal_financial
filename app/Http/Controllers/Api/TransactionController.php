<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\TransactionPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $perPage = min((int) ($request->per_page ?? 20), 100);

        $query = Transaction::where('user_id', $user->id)
            ->with(['category', 'account', 'person', 'photos'])
            ->orderByDesc('transaction_date')->orderByDesc('created_at');

        if ($request->filled('type') && $request->type !== 'all')
            $query->where('type', $request->type);
        if ($request->filled('from_date'))
            $query->whereDate('transaction_date', '>=', $request->from_date);
        if ($request->filled('to_date'))
            $query->whereDate('transaction_date', '<=', $request->to_date);
        if ($request->filled('category_id'))
            $query->where('category_id', $request->category_id);
        if ($request->filled('account_id'))
            $query->where('account_id', $request->account_id);
        if ($request->filled('person_id'))
            $query->where('person_id', $request->person_id);
        if ($request->filled('search'))
            $query->where('description', 'like', '%'.$request->search.'%');
        if ($request->filled('min_amount'))
            $query->where('amount', '>=', $request->min_amount);
        if ($request->filled('max_amount'))
            $query->where('amount', '<=', $request->max_amount);

        $paginator = $query->paginate($perPage);
        $paginator->getCollection()->transform(fn($t) => $this->fmt($t));

        return $this->success($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $t = Transaction::where('user_id', $request->user()->id)
            ->with(['category', 'account', 'person', 'photos'])->find($id);
        if (!$t) return $this->notFound('Transaction not found.');

        return $this->success($this->fmt($t));
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'account_id'       => ['required', 'integer', 'exists:accounts,id'],
            'category_id'      => ['nullable', 'integer', 'exists:categories,id'],
            'person_id'        => ['nullable', 'integer', 'exists:people,id'],
            'type'             => ['required', 'in:income,expense,transfer'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'description'      => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
            'transaction_time' => ['nullable', 'date_format:H:i:s'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'is_recurring'     => ['boolean'],
            'recurring_type'   => ['nullable', 'in:daily,weekly,monthly,yearly'],
            'notes'            => ['nullable', 'string', 'max:1000'],
            'photos'           => ['nullable', 'array', 'max:5'],
            'photos.*'         => ['image', 'max:4096'],
            'photo_type'       => ['nullable', 'in:receipt,proof,screenshot,other'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $account = Account::where('id', $request->account_id)->where('user_id', $request->user()->id)->first();
        if (!$account) return $this->forbidden('Account does not belong to you.');

        $transaction = Transaction::create([
            'user_id'          => $request->user()->id,
            'account_id'       => $request->account_id,
            'category_id'      => $request->category_id,
            'person_id'        => $request->person_id,
            'type'             => $request->type,
            'amount'           => $request->amount,
            'description'      => $request->description,
            'transaction_date' => $request->transaction_date,
            'transaction_time' => $request->transaction_time,
            'reference_number' => $request->reference_number,
            'is_recurring'     => $request->boolean('is_recurring'),
            'recurring_type'   => $request->recurring_type,
            'sync_status'      => 'synced',
        ]);

        $this->updateBalance($transaction->account_id);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('transaction-photos', 'public');
                TransactionPhoto::create([
                    'transaction_id' => $transaction->id,
                    'photo_path'     => $path,
                    'photo_type'     => $request->photo_type ?? 'receipt',
                    'original_name'  => $photo->getClientOriginalName(),
                    'file_size'      => $photo->getSize(),
                ]);
            }
        }

        $transaction->load(['category', 'account', 'person', 'photos']);
        return $this->created($this->fmt($transaction));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->find($id);
        if (!$transaction) return $this->notFound('Transaction not found.');

        $v = Validator::make($request->all(), [
            'account_id'       => ['sometimes', 'integer', 'exists:accounts,id'],
            'category_id'      => ['nullable', 'integer', 'exists:categories,id'],
            'person_id'        => ['nullable', 'integer', 'exists:people,id'],
            'type'             => ['sometimes', 'in:income,expense,transfer'],
            'amount'           => ['sometimes', 'numeric', 'min:0.01'],
            'description'      => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['sometimes', 'date'],
            'reference_number' => ['nullable', 'string', 'max:100'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $oldAccountId = $transaction->account_id;
        $transaction->update($request->only([
            'account_id', 'category_id', 'person_id', 'type', 'amount',
            'description', 'transaction_date', 'transaction_time', 'reference_number',
        ]));

        $this->updateBalance($oldAccountId);
        if ($transaction->account_id !== $oldAccountId) $this->updateBalance($transaction->account_id);

        $transaction->load(['category', 'account', 'person', 'photos']);
        return $this->success($this->fmt($transaction), 'Transaction updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->find($id);
        if (!$transaction) return $this->notFound('Transaction not found.');

        $accountId = $transaction->account_id;
        foreach ($transaction->photos as $photo) {
            Storage::disk('public')->delete($photo->photo_path);
            $photo->delete();
        }
        $transaction->delete();
        $this->updateBalance($accountId);

        return $this->success(null, 'Transaction deleted.');
    }

    private function updateBalance(int $accountId): void
    {
        $account = Account::find($accountId);
        if (!$account) return;
        $income  = (float) $account->transactions()->where('type', 'income')->sum('amount');
        $expense = (float) $account->transactions()->where('type', 'expense')->sum('amount');
        $account->update(['balance' => $income - $expense]);
    }

    private function fmt(Transaction $t): array
    {
        return [
            'id'               => $t->id,
            'type'             => $t->type,
            'amount'           => (float) $t->amount,
            'description'      => $t->description,
            'transaction_date' => $t->transaction_date->toDateString(),
            'transaction_time' => $t->transaction_time,
            'reference_number' => $t->reference_number,
            'is_recurring'     => (bool) $t->is_recurring,
            'recurring_type'   => $t->recurring_type,
            'sync_status'      => $t->sync_status,
            'category'         => $t->category ? ['id' => $t->category->id, 'name' => $t->category->name, 'color' => $t->category->color, 'icon' => $t->category->icon] : null,
            'account'          => $t->account  ? ['id' => $t->account->id,  'name' => $t->account->name,  'type' => $t->account->type]  : null,
            'person'           => $t->person   ? ['id' => $t->person->id,   'name' => $t->person->name]   : null,
            'photos'           => $t->photos->map(fn($p) => [
                'id'   => $p->id,
                'url'  => Storage::url($p->photo_path),
                'type' => $p->photo_type,
            ])->toArray(),
            'created_at'       => $t->created_at->toIso8601String(),
            'updated_at'       => $t->updated_at->toIso8601String(),
        ];
    }
}
