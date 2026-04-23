<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\Person;
use App\Http\Requests\LoanRequest;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $given = Loan::where('user_id', $user->id)->where('type', 'given')
            ->with('person')
            ->orderByDesc('loan_date')
            ->get()
            ->map(fn($l) => $this->formatLoan($l));

        $taken = Loan::where('user_id', $user->id)->where('type', 'taken')
            ->with('person')
            ->orderByDesc('loan_date')
            ->get()
            ->map(fn($l) => $this->formatLoan($l));

        $totalGiven    = Loan::where('user_id', $user->id)->where('type', 'given')->sum('remaining_amount');
        $totalBorrowed = Loan::where('user_id', $user->id)->where('type', 'taken')->sum('remaining_amount');

        return Inertia::render('Loans/Index', [
            'given_loans'    => $given,
            'taken_loans'    => $taken,
            'summary'        => [
                'total_given'     => 'Rs. ' . number_format($totalGiven, 0),
                'total_borrowed'  => 'Rs. ' . number_format($totalBorrowed, 0),
                'net_position'    => 'Rs. ' . number_format($totalGiven - $totalBorrowed, 0),
                'is_positive'     => $totalGiven >= $totalBorrowed,
            ],
            'people' => Person::where('user_id', $user->id)->get(['id', 'name']),
        ]);
    }

    public function store(LoanRequest $request)
    {
        $data              = $request->validated();
        $data['user_id']   = $request->user()->id;
        $data['paid_amount']     = 0;
        $data['remaining_amount']= $data['total_amount'];
        $data['status']    = 'pending';

        if ($request->hasFile('photo')) {
            $file     = $request->file('photo');
            $filename = 'loans/' . uniqid() . '.jpg';
            $image    = Image::read($file)->scaleDown(width: 1000);
            Storage::disk('public')->put($filename, $image->toJpeg(85));
            $data['photo'] = $filename;
        }

        Loan::create($data);
        return redirect()->route('loans.index')->with('success', 'Loan recorded successfully.');
    }

    public function update(LoanRequest $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) abort(403);
        $data = $request->validated();
        $loan->update($data);
        return redirect()->route('loans.index')->with('success', 'Loan updated.');
    }

    public function destroy(Loan $loan)
    {
        if ($loan->user_id !== auth()->id()) abort(403);
        $loan->delete();
        return redirect()->route('loans.index')->with('success', 'Loan deleted.');
    }

    public function recordRepayment(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) abort(403);

        $request->validate([
            'amount'         => ['required', 'numeric', 'min:0.01', 'max:' . $loan->remaining_amount],
            'repayment_date' => ['required', 'date'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);

        LoanRepayment::create([
            'loan_id'        => $loan->id,
            'amount'         => $request->amount,
            'repayment_date' => $request->repayment_date,
            'notes'          => $request->notes,
        ]);

        $newPaid      = $loan->paid_amount + $request->amount;
        $newRemaining = $loan->total_amount - $newPaid;
        $newStatus    = $newRemaining <= 0 ? 'completed' : ($newPaid > 0 ? 'partial' : 'pending');

        $loan->update([
            'paid_amount'      => $newPaid,
            'remaining_amount' => max(0, $newRemaining),
            'status'           => $newStatus,
        ]);

        return redirect()->route('loans.index')->with('success', 'Repayment recorded.');
    }

    private function formatLoan(Loan $l): array
    {
        return [
            'id'                    => $l->id,
            'type'                  => $l->type,
            'total_amount'          => $l->total_amount,
            'paid_amount'           => $l->paid_amount,
            'remaining_amount'      => $l->remaining_amount,
            'formatted_total'       => $l->formatted_total_amount,
            'formatted_remaining'   => $l->formatted_remaining_amount,
            'interest_rate'         => $l->interest_rate,
            'loan_date'             => $l->loan_date?->format('Y-m-d'),
            'due_date'              => $l->due_date?->format('Y-m-d'),
            'status'                => $l->status,
            'notes'                 => $l->notes,
            'photo'                 => $l->photo ? asset('storage/' . $l->photo) : null,
            'progress_percentage'   => $l->progress_percentage,
            'due_date_status'       => $l->due_date_status,
            'person'                => $l->person ? ['id' => $l->person->id, 'name' => $l->person->name, 'photo_url' => $l->person->photo_url] : null,
        ];
    }
}
