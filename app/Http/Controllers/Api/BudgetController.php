<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $budgets = Budget::where('user_id', $request->user()->id)->with('category')->get()
            ->map(fn($b) => $this->fmt($b, $request->user()->id));
        return $this->success($budgets);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $budget = Budget::where('user_id', $request->user()->id)->with('category')->find($id);
        if (!$budget) return $this->notFound('Budget not found.');
        return $this->success($this->fmt($budget, $request->user()->id));
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name'                => ['required', 'string', 'max:100'],
            'amount'              => ['required', 'numeric', 'min:0.01'],
            'period'              => ['required', 'in:weekly,monthly,yearly'],
            'start_date'          => ['required', 'date'],
            'end_date'            => ['required', 'date', 'after:start_date'],
            'category_id'         => ['nullable', 'integer', 'exists:categories,id'],
            'alert_at_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $budget = Budget::create([
            ...$request->only(['name', 'amount', 'period', 'start_date', 'end_date', 'category_id', 'alert_at_percentage']),
            'user_id' => $request->user()->id,
        ]);
        $budget->load('category');
        return $this->created($this->fmt($budget, $request->user()->id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $budget = Budget::where('user_id', $request->user()->id)->find($id);
        if (!$budget) return $this->notFound('Budget not found.');

        $v = Validator::make($request->all(), [
            'name'                => ['sometimes', 'string', 'max:100'],
            'amount'              => ['sometimes', 'numeric', 'min:0.01'],
            'end_date'            => ['sometimes', 'date'],
            'alert_at_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $budget->update($request->only(['name', 'amount', 'period', 'start_date', 'end_date', 'category_id', 'alert_at_percentage']));
        $budget->load('category');
        return $this->success($this->fmt($budget->fresh(), $request->user()->id), 'Budget updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $budget = Budget::where('user_id', $request->user()->id)->find($id);
        if (!$budget) return $this->notFound('Budget not found.');
        $budget->delete();
        return $this->success(null, 'Budget deleted.');
    }

    private function fmt(Budget $b, int $userId): array
    {
        $spent = (float) Transaction::where('user_id', $userId)
            ->where('category_id', $b->category_id)->where('type', 'expense')
            ->whereBetween('transaction_date', [$b->start_date, $b->end_date])->sum('amount');
        $pct = $b->amount > 0 ? round(($spent / $b->amount) * 100, 1) : 0;

        return [
            'id'                  => $b->id,
            'name'                => $b->name,
            'amount'              => (float) $b->amount,
            'period'              => $b->period,
            'start_date'          => $b->start_date->toDateString(),
            'end_date'            => $b->end_date->toDateString(),
            'alert_at_percentage' => $b->alert_at_percentage,
            'spent'               => $spent,
            'remaining'           => max(0, (float)$b->amount - $spent),
            'percentage_used'     => $pct,
            'is_exceeded'         => $spent > $b->amount,
            'is_alert'            => $pct >= $b->alert_at_percentage,
            'category'            => $b->category ? ['id' => $b->category->id, 'name' => $b->category->name, 'color' => $b->category->color] : null,
            'created_at'          => $b->created_at->toIso8601String(),
        ];
    }
}
