<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Category;
use App\Models\Person;
use App\Models\TransactionPhoto;
use App\Http\Requests\TransactionRequest;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class TransactionController extends Controller
{
    public function index(Request $request): mixed
    {
        $user  = $request->user();
        $query = Transaction::where('user_id', $user->id)
            ->with(['category', 'account', 'person', 'photos'])
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at');

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->filled('from_date')) {
            $query->whereDate('transaction_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('transaction_date', '<=', $request->to_date);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        if ($request->filled('person_id')) {
            $query->where('person_id', $request->person_id);
        }
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }
        if ($request->filled('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        if ($request->wantsJson()) {
            $transactions = $query->paginate(20);
            return response()->json($transactions);
        }

        $cloneQuery    = clone $query;
        $totalIncome   = (float) (clone $query)->where('type', 'income')->sum('amount');
        $totalExpenses = (float) (clone $query)->where('type', 'expense')->sum('amount');

        $transactions = $query->paginate(20)->through(fn($t) => $this->formatTransaction($t));

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters'      => $request->only(['type', 'from_date', 'to_date', 'category_id', 'account_id', 'person_id', 'search', 'min_amount', 'max_amount']),
            'summary'      => [
                'total_income'    => 'Rs. ' . number_format($totalIncome, 0),
                'total_expenses'  => 'Rs. ' . number_format($totalExpenses, 0),
                'net'             => 'Rs. ' . number_format($totalIncome - $totalExpenses, 0),
                'count'           => $transactions->total(),
            ],
            'accounts'   => Account::where('user_id', $user->id)->get(['id', 'name', 'type', 'color']),
            'categories' => Category::where('user_id', $user->id)->get(['id', 'name', 'type', 'color', 'icon']),
            'people'     => Person::where('user_id', $user->id)->get(['id', 'name']),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        return Inertia::render('Transactions/Form', [
            'accounts'   => Account::where('user_id', $user->id)->get(),
            'categories' => Category::where('user_id', $user->id)->get(),
            'people'     => Person::where('user_id', $user->id)->get(),
            'type'       => $request->query('type', 'expense'),
        ]);
    }

    public function store(TransactionRequest $request)
    {
        $data              = $request->validated();
        $data['user_id']   = $request->user()->id;
        $data['is_recurring'] = $data['is_recurring'] ?? false;
        unset($data['photos'], $data['photo_type']);

        $transaction = Transaction::create($data);

        $this->updateAccountBalance($transaction->account_id);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $this->savePhoto($photo, 'transactions');
                TransactionPhoto::create([
                    'transaction_id' => $transaction->id,
                    'photo_path'     => $path,
                    'photo_type'     => $request->photo_type ?? 'receipt',
                    'original_name'  => $photo->getClientOriginalName(),
                    'file_size'      => $photo->getSize(),
                ]);
            }
        }

        return redirect()->route('transactions.index')->with('success', 'Transaction added successfully.');
    }

    public function show(Transaction $transaction): Response
    {
        $this->authorize($transaction);
        $transaction->load(['category', 'account', 'person', 'photos']);
        return Inertia::render('Transactions/Show', [
            'transaction' => $this->formatTransaction($transaction),
        ]);
    }

    public function edit(Request $request, Transaction $transaction): Response
    {
        $this->authorize($transaction);
        $user = $request->user();
        $transaction->load(['category', 'account', 'person', 'photos']);
        return Inertia::render('Transactions/Form', [
            'transaction' => $this->formatTransaction($transaction),
            'accounts'    => Account::where('user_id', $user->id)->get(),
            'categories'  => Category::where('user_id', $user->id)->get(),
            'people'      => Person::where('user_id', $user->id)->get(),
        ]);
    }

    public function update(TransactionRequest $request, Transaction $transaction)
    {
        $this->authorize($transaction);
        $data = $request->validated();
        $data['is_recurring'] = $data['is_recurring'] ?? false;
        unset($data['photos'], $data['photo_type']);

        $oldAccountId = $transaction->account_id;
        $transaction->update($data);

        $this->updateAccountBalance($oldAccountId);
        if ($transaction->account_id !== $oldAccountId) {
            $this->updateAccountBalance($transaction->account_id);
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $this->savePhoto($photo, 'transactions');
                TransactionPhoto::create([
                    'transaction_id' => $transaction->id,
                    'photo_path'     => $path,
                    'photo_type'     => $request->photo_type ?? 'receipt',
                    'original_name'  => $photo->getClientOriginalName(),
                    'file_size'      => $photo->getSize(),
                ]);
            }
        }

        if ($request->filled('remove_photos')) {
            foreach ($request->remove_photos as $photoId) {
                $photo = TransactionPhoto::find($photoId);
                if ($photo && $photo->transaction_id === $transaction->id) {
                    Storage::disk('public')->delete($photo->photo_path);
                    $photo->delete();
                }
            }
        }

        return redirect()->route('transactions.index')->with('success', 'Transaction updated successfully.');
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize($transaction);
        $accountId = $transaction->account_id;

        foreach ($transaction->photos as $photo) {
            Storage::disk('public')->delete($photo->photo_path);
        }
        $transaction->delete();
        $this->updateAccountBalance($accountId);

        return redirect()->route('transactions.index')->with('success', 'Transaction deleted.');
    }

    private function authorize(Transaction $transaction): void
    {
        if ($transaction->user_id !== auth()->id()) {
            abort(403);
        }
    }

    private function formatTransaction(Transaction $t): array
    {
        return [
            'id'               => $t->id,
            'type'             => $t->type,
            'amount'           => $t->amount,
            'formatted_amount' => $t->formatted_amount,
            'description'      => $t->description,
            'transaction_date' => $t->transaction_date?->format('Y-m-d'),
            'transaction_time' => $t->transaction_time,
            'reference_number' => $t->reference_number,
            'is_recurring'     => $t->is_recurring,
            'recurring_type'   => $t->recurring_type,
            'recurring_end_date'=> $t->recurring_end_date,
            'account_id'       => $t->account_id,
            'category_id'      => $t->category_id,
            'person_id'        => $t->person_id,
            'category'         => $t->category ? ['id' => $t->category->id, 'name' => $t->category->name, 'color' => $t->category->color, 'icon' => $t->category->icon] : null,
            'account'          => $t->account ? ['id' => $t->account->id, 'name' => $t->account->name, 'type' => $t->account->type] : null,
            'person'           => $t->person ? ['id' => $t->person->id, 'name' => $t->person->name] : null,
            'photos'           => $t->photos ? $t->photos->map(fn($p) => ['id' => $p->id, 'url' => $p->url, 'photo_type' => $p->photo_type]) : [],
        ];
    }

    private function updateAccountBalance(int $accountId): void
    {
        $account = Account::find($accountId);
        if (!$account) return;

        $income  = (float) Transaction::where('account_id', $accountId)->where('type', 'income')->sum('amount');
        $expense = (float) Transaction::where('account_id', $accountId)->where('type', 'expense')->sum('amount');
        $account->update(['balance' => $income - $expense]);
    }

    private function savePhoto($file, string $folder): string
    {
        $filename = uniqid() . '.jpg';
        $path     = $folder . '/' . $filename;

        $image = Image::read($file)->scaleDown(width: 1200);
        Storage::disk('public')->put($path, $image->toJpeg(85));

        return $path;
    }
}
