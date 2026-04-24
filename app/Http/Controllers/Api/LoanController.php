<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Loan;
use App\Models\LoanRepayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LoanController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int)($request->per_page ?? 20), 100);
        $query   = Loan::where('user_id', $request->user()->id)->with(['person', 'repayments']);
        if ($request->filled('type'))   $query->where('type', $request->type);
        if ($request->filled('status')) $query->where('status', $request->status);
        $paginator = $query->orderByDesc('loan_date')->paginate($perPage);
        $paginator->getCollection()->transform(fn($l) => $this->fmt($l));
        return $this->success($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $loan = Loan::where('user_id', $request->user()->id)->with(['person', 'repayments'])->find($id);
        if (!$loan) return $this->notFound('Loan not found.');
        return $this->success($this->fmt($loan));
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'person_id'    => ['required', 'integer', 'exists:people,id'],
            'type'         => ['required', 'in:given,taken'],
            'total_amount' => ['required', 'numeric', 'min:0.01'],
            'interest_rate'=> ['nullable', 'numeric', 'min:0'],
            'loan_date'    => ['required', 'date'],
            'due_date'     => ['nullable', 'date', 'after_or_equal:loan_date'],
            'notes'        => ['nullable', 'string', 'max:1000'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $loan = Loan::create([
            ...$request->only(['person_id', 'type', 'total_amount', 'interest_rate', 'loan_date', 'due_date', 'notes']),
            'user_id'          => $request->user()->id,
            'paid_amount'      => 0,
            'remaining_amount' => $request->total_amount,
            'status'           => 'pending',
        ]);
        $loan->load(['person', 'repayments']);
        return $this->created($this->fmt($loan));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $loan = Loan::where('user_id', $request->user()->id)->find($id);
        if (!$loan) return $this->notFound('Loan not found.');

        $v = Validator::make($request->all(), [
            'due_date'  => ['nullable', 'date'],
            'notes'     => ['nullable', 'string', 'max:1000'],
            'status'    => ['nullable', 'in:pending,partial,completed'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $loan->update($request->only(['due_date', 'notes', 'status']));
        $loan->load(['person', 'repayments']);
        return $this->success($this->fmt($loan), 'Loan updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $loan = Loan::where('user_id', $request->user()->id)->find($id);
        if (!$loan) return $this->notFound('Loan not found.');
        $loan->repayments()->delete();
        $loan->delete();
        return $this->success(null, 'Loan deleted.');
    }

    public function recordRepayment(Request $request, int $id): JsonResponse
    {
        $loan = Loan::where('user_id', $request->user()->id)->find($id);
        if (!$loan) return $this->notFound('Loan not found.');
        if ($loan->status === 'completed') return $this->error('This loan is already fully paid.', 422);

        $v = Validator::make($request->all(), [
            'amount'         => ['required', 'numeric', 'min:0.01', 'max:'.$loan->remaining_amount],
            'repayment_date' => ['required', 'date'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        LoanRepayment::create([
            'loan_id'        => $loan->id,
            'amount'         => $request->amount,
            'repayment_date' => $request->repayment_date,
            'notes'          => $request->notes,
        ]);

        $newPaid      = $loan->paid_amount + $request->amount;
        $newRemaining = max(0, $loan->total_amount - $newPaid);
        $loan->update([
            'paid_amount'      => $newPaid,
            'remaining_amount' => $newRemaining,
            'status'           => $newRemaining <= 0 ? 'completed' : ($newPaid > 0 ? 'partial' : 'pending'),
        ]);

        $loan->load(['person', 'repayments']);
        return $this->success($this->fmt($loan), 'Repayment recorded.');
    }

    private function fmt(Loan $l): array
    {
        return [
            'id'             => $l->id,
            'type'           => $l->type,
            'total_amount'   => (float) $l->total_amount,
            'paid_amount'    => (float) $l->paid_amount,
            'remaining_amount'=> (float) $l->remaining_amount,
            'interest_rate'  => (float) $l->interest_rate,
            'loan_date'      => $l->loan_date->toDateString(),
            'due_date'       => $l->due_date?->toDateString(),
            'status'         => $l->status,
            'notes'          => $l->notes,
            'is_overdue'     => $l->due_date && $l->due_date->isPast() && $l->status !== 'completed',
            'person'         => $l->person ? ['id' => $l->person->id, 'name' => $l->person->name, 'phone' => $l->person->phone] : null,
            'repayments'     => $l->repayments->map(fn($r) => ['id' => $r->id, 'amount' => (float) $r->amount, 'date' => $r->repayment_date->toDateString(), 'notes' => $r->notes])->toArray(),
            'created_at'     => $l->created_at->toIso8601String(),
        ];
    }
}
