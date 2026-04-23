<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Person;
use App\Models\Transaction;
use App\Http\Requests\PersonRequest;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class PeopleController extends Controller
{
    public function index(Request $request)
    {
        $people = Person::where('user_id', $request->user()->id)
            ->when($request->search, fn($q) => $q->where('name', 'like', '%' . $request->search . '%'))
            ->get()
            ->map(fn($p) => [
                'id'           => $p->id,
                'name'         => $p->name,
                'phone'        => $p->phone,
                'email'        => $p->email,
                'relationship' => $p->relationship,
                'photo_url'    => $p->photo_url,
                'net_balance'  => $p->netBalance(),
                'net_formatted'=> 'Rs. ' . number_format(abs($p->netBalance()), 0),
            ]);

        return Inertia::render('People/Index', ['people' => $people, 'filters' => ['search' => $request->search]]);
    }

    public function show(Request $request, Person $person)
    {
        if ($person->user_id !== $request->user()->id) abort(403);

        $transactions = Transaction::where('person_id', $person->id)
            ->with(['category', 'account'])
            ->orderByDesc('transaction_date')
            ->paginate(20);

        return Inertia::render('People/Show', [
            'person'       => [
                'id'           => $person->id,
                'name'         => $person->name,
                'phone'        => $person->phone,
                'email'        => $person->email,
                'relationship' => $person->relationship,
                'photo_url'    => $person->photo_url,
                'notes'        => $person->notes,
                'total_given'      => 'Rs. ' . number_format($person->totalGiven(), 0),
                'total_received'   => 'Rs. ' . number_format($person->totalReceived(), 0),
                'net_balance'      => $person->netBalance(),
                'net_formatted'    => 'Rs. ' . number_format(abs($person->netBalance()), 0),
                'net_is_positive'  => $person->netBalance() >= 0,
            ],
            'transactions' => $transactions,
        ]);
    }

    public function store(PersonRequest $request)
    {
        $data            = $request->validated();
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->savePhoto($request->file('photo'));
        }
        unset($data['photo_upload']);

        Person::create($data);
        return redirect()->route('people.index')->with('success', 'Person added successfully.');
    }

    public function update(PersonRequest $request, Person $person)
    {
        if ($person->user_id !== $request->user()->id) abort(403);

        $data = $request->validated();
        if ($request->hasFile('photo')) {
            if ($person->photo) Storage::disk('public')->delete($person->photo);
            $data['photo'] = $this->savePhoto($request->file('photo'));
        }

        $person->update($data);
        return redirect()->route('people.index')->with('success', 'Person updated.');
    }

    public function destroy(Person $person)
    {
        if ($person->user_id !== auth()->id()) abort(403);
        if ($person->photo) Storage::disk('public')->delete($person->photo);
        $person->delete();
        return redirect()->route('people.index')->with('success', 'Person deleted.');
    }

    private function savePhoto($file): string
    {
        $filename = 'people/' . uniqid() . '.jpg';
        $image    = Image::read($file)->cover(300, 300);
        Storage::disk('public')->put($filename, $image->toJpeg(85));
        return $filename;
    }
}
