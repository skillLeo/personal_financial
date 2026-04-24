<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Person;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PeopleController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int)($request->per_page ?? 50), 100);
        $query   = Person::where('user_id', $request->user()->id);
        if ($request->filled('search')) $query->where('name', 'like', '%'.$request->search.'%');
        $paginator = $query->orderBy('name')->paginate($perPage);
        $paginator->getCollection()->transform(fn($p) => $this->fmt($p));
        return $this->success($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $person = Person::where('user_id', $request->user()->id)->find($id);
        if (!$person) return $this->notFound('Person not found.');

        $totalLent     = (float) $person->loans()->where('type', 'given')->sum('total_amount');
        $totalBorrowed = (float) $person->loans()->where('type', 'taken')->sum('total_amount');
        $txnCount      = $person->transactions()->where('user_id', $request->user()->id)->count();

        return $this->success([...$this->fmt($person), 'total_lent' => $totalLent, 'total_borrowed' => $totalBorrowed, 'transaction_count' => $txnCount]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name'         => ['required', 'string', 'max:100'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'email'        => ['nullable', 'email', 'max:150'],
            'relationship' => ['nullable', 'in:friend,client,employee,supplier,family,other'],
            'notes'        => ['nullable', 'string', 'max:500'],
            'photo'        => ['nullable', 'image', 'max:2048'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $data = [...$request->only(['name', 'phone', 'email', 'relationship', 'notes']), 'user_id' => $request->user()->id];
        if ($request->hasFile('photo')) $data['photo'] = $request->file('photo')->store('people', 'public');

        return $this->created($this->fmt(Person::create($data)));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $person = Person::where('user_id', $request->user()->id)->find($id);
        if (!$person) return $this->notFound('Person not found.');

        $v = Validator::make($request->all(), [
            'name'         => ['sometimes', 'string', 'max:100'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'email'        => ['nullable', 'email', 'max:150'],
            'relationship' => ['nullable', 'in:friend,client,employee,supplier,family,other'],
            'notes'        => ['nullable', 'string', 'max:500'],
            'photo'        => ['nullable', 'image', 'max:2048'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $data = $request->only(['name', 'phone', 'email', 'relationship', 'notes']);
        if ($request->hasFile('photo')) {
            if ($person->photo) Storage::disk('public')->delete($person->photo);
            $data['photo'] = $request->file('photo')->store('people', 'public');
        }
        $person->update($data);
        return $this->success($this->fmt($person->fresh()), 'Person updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $person = Person::where('user_id', $request->user()->id)->find($id);
        if (!$person) return $this->notFound('Person not found.');
        if ($person->photo) Storage::disk('public')->delete($person->photo);
        $person->delete();
        return $this->success(null, 'Person deleted.');
    }

    public function history(Request $request, int $id): JsonResponse
    {
        $person = Person::where('user_id', $request->user()->id)->find($id);
        if (!$person) return $this->notFound('Person not found.');

        $perPage = min((int)($request->per_page ?? 20), 100);
        $txns    = Transaction::where('person_id', $id)->where('user_id', $request->user()->id)
            ->with(['category', 'account'])->orderByDesc('transaction_date')->paginate($perPage);
        $txns->getCollection()->transform(fn($t) => [
            'id' => $t->id, 'type' => $t->type, 'amount' => (float) $t->amount,
            'description' => $t->description, 'transaction_date' => $t->transaction_date->toDateString(),
            'category' => $t->category ? ['name' => $t->category->name, 'color' => $t->category->color] : null,
            'account'  => $t->account  ? ['name' => $t->account->name] : null,
        ]);
        return $this->success(['person' => $this->fmt($person), 'transactions' => $txns->items(), 'meta' => ['current_page' => $txns->currentPage(), 'per_page' => $txns->perPage(), 'total' => $txns->total(), 'last_page' => $txns->lastPage()]]);
    }

    private function fmt(Person $p): array
    {
        return ['id' => $p->id, 'name' => $p->name, 'phone' => $p->phone, 'email' => $p->email, 'relationship' => $p->relationship, 'photo_url' => $p->photo ? Storage::url($p->photo) : null, 'notes' => $p->notes, 'created_at' => $p->created_at->toIso8601String()];
    }
}
