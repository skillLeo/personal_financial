<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Budget;
use App\Models\Category;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $user    = $request->user();
        $budgets = Budget::where('user_id', $user->id)
            ->with('category')
            ->orderByDesc('start_date')
            ->get()
            ->map(fn($b) => [
                'id'                  => $b->id,
                'name'                => $b->name,
                'amount'              => $b->amount,
                'formatted_amount'    => $b->formatted_amount,
                'period'              => $b->period,
                'start_date'          => $b->start_date?->format('Y-m-d'),
                'end_date'            => $b->end_date?->format('Y-m-d'),
                'alert_at_percentage' => $b->alert_at_percentage,
                'spent'               => $b->currentSpending(),
                'spent_formatted'     => 'Rs. ' . number_format($b->currentSpending(), 0),
                'percentage_used'     => $b->percentageUsed(),
                'is_over_alert'       => $b->isOverAlert(),
                'remaining'           => max(0, $b->amount - $b->currentSpending()),
                'remaining_formatted' => 'Rs. ' . number_format(max(0, $b->amount - $b->currentSpending()), 0),
                'category'            => $b->category ? ['id' => $b->category->id, 'name' => $b->category->name, 'color' => $b->category->color, 'icon' => $b->category->icon] : null,
            ]);

        return Inertia::render('Budgets/Index', [
            'budgets'    => $budgets,
            'categories' => Category::where('user_id', $user->id)->where('type', '!=', 'income')->get(['id', 'name', 'color', 'icon']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                => ['required', 'string', 'max:100'],
            'amount'              => ['required', 'numeric', 'min:1'],
            'period'              => ['required', 'in:weekly,monthly,yearly'],
            'start_date'          => ['required', 'date'],
            'end_date'            => ['required', 'date', 'after:start_date'],
            'alert_at_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'category_id'         => ['nullable', 'integer', 'exists:categories,id'],
        ]);
        $data['user_id'] = $request->user()->id;
        Budget::create($data);
        return redirect()->route('budgets.index')->with('success', 'Budget created.');
    }

    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) abort(403);
        $data = $request->validate([
            'name'                => ['required', 'string', 'max:100'],
            'amount'              => ['required', 'numeric', 'min:1'],
            'period'              => ['required', 'in:weekly,monthly,yearly'],
            'start_date'          => ['required', 'date'],
            'end_date'            => ['required', 'date', 'after:start_date'],
            'alert_at_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'category_id'         => ['nullable', 'integer', 'exists:categories,id'],
        ]);
        $budget->update($data);
        return redirect()->route('budgets.index')->with('success', 'Budget updated.');
    }

    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== auth()->id()) abort(403);
        $budget->delete();
        return redirect()->route('budgets.index')->with('success', 'Budget deleted.');
    }
}
