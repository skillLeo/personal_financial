<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Person;
use App\Models\Loan;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q    = $request->q;
        $user = $request->user();

        if (!$q || strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $transactions = Transaction::where('user_id', $user->id)
            ->where('description', 'like', "%{$q}%")
            ->with('category')
            ->limit(5)
            ->get()
            ->map(fn($t) => [
                'type'        => 'transaction',
                'id'          => $t->id,
                'title'       => $t->description ?? 'No description',
                'subtitle'    => $t->formatted_amount . ' · ' . $t->transaction_date?->format('d M Y'),
                'transaction_type' => $t->type,
                'url'         => route('transactions.edit', $t),
            ]);

        $people = Person::where('user_id', $user->id)
            ->where('name', 'like', "%{$q}%")
            ->limit(3)
            ->get()
            ->map(fn($p) => [
                'type'     => 'person',
                'id'       => $p->id,
                'title'    => $p->name,
                'subtitle' => ucfirst($p->relationship),
                'url'      => route('people.show', $p),
            ]);

        $loans = Loan::where('user_id', $user->id)
            ->whereHas('person', fn($q2) => $q2->where('name', 'like', "%{$q}%"))
            ->with('person')
            ->limit(3)
            ->get()
            ->map(fn($l) => [
                'type'     => 'loan',
                'id'       => $l->id,
                'title'    => 'Loan: ' . $l->person?->name,
                'subtitle' => $l->formatted_remaining_amount . ' remaining',
                'url'      => route('loans.index'),
            ]);

        return response()->json([
            'results' => $transactions->merge($people)->merge($loans)->values(),
        ]);
    }
}
