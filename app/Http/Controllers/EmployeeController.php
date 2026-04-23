<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\SalaryPayment;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Http\Requests\EmployeeRequest;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::where('user_id', $request->user()->id)
            ->with(['account', 'lastPayment'])
            ->get()
            ->map(fn($e) => $this->formatEmployee($e));

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'accounts'  => Account::where('user_id', $request->user()->id)->get(['id', 'name']),
        ]);
    }

    public function store(EmployeeRequest $request)
    {
        $data            = $request->validated();
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->savePhoto($request->file('photo'));
        }

        Employee::create($data);
        return redirect()->route('employees.index')->with('success', 'Employee added successfully.');
    }

    public function update(EmployeeRequest $request, Employee $employee)
    {
        if ($employee->user_id !== $request->user()->id) abort(403);
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            if ($employee->photo) Storage::disk('public')->delete($employee->photo);
            $data['photo'] = $this->savePhoto($request->file('photo'));
        }

        $employee->update($data);
        return redirect()->route('employees.index')->with('success', 'Employee updated.');
    }

    public function destroy(Employee $employee)
    {
        if ($employee->user_id !== auth()->id()) abort(403);
        if ($employee->photo) Storage::disk('public')->delete($employee->photo);
        $employee->delete();
        return redirect()->route('employees.index')->with('success', 'Employee deleted.');
    }

    public function paySalary(Request $request, Employee $employee)
    {
        if ($employee->user_id !== $request->user()->id) abort(403);

        $request->validate([
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'payment_date'   => ['required', 'date'],
            'month_year'     => ['required', 'string', 'size:7'],
            'payment_method' => ['required', 'in:cash,bank,jazzcash,easypaisa,other'],
            'account_id'     => ['required', 'integer', 'exists:accounts,id'],
            'notes'          => ['nullable', 'string'],
        ]);

        if ($employee->isPaidForMonth($request->month_year)) {
            return back()->with('error', 'Salary already paid for ' . $request->month_year . '.');
        }

        $expenseCategory = Category::where('user_id', $request->user()->id)
            ->where('type', 'expense')
            ->first();

        $transaction = null;
        if ($expenseCategory) {
            $transaction = Transaction::create([
                'user_id'          => $request->user()->id,
                'account_id'       => $request->account_id,
                'category_id'      => $expenseCategory->id,
                'type'             => 'expense',
                'amount'           => $request->amount,
                'description'      => 'Salary: ' . $employee->name . ' (' . $request->month_year . ')',
                'transaction_date' => $request->payment_date,
            ]);

            $income  = (float) Transaction::where('account_id', $request->account_id)->where('type', 'income')->sum('amount');
            $expense = (float) Transaction::where('account_id', $request->account_id)->where('type', 'expense')->sum('amount');
            Account::find($request->account_id)?->update(['balance' => $income - $expense]);
        }

        SalaryPayment::create([
            'employee_id'    => $employee->id,
            'amount'         => $request->amount,
            'payment_date'   => $request->payment_date,
            'month_year'     => $request->month_year,
            'payment_method' => $request->payment_method,
            'notes'          => $request->notes,
            'transaction_id' => $transaction?->id,
        ]);

        return redirect()->route('employees.index')->with('success', 'Salary paid to ' . $employee->name . '.');
    }

    public function paymentHistory(Request $request, Employee $employee)
    {
        if ($employee->user_id !== $request->user()->id) abort(403);
        $payments = SalaryPayment::where('employee_id', $employee->id)->orderByDesc('payment_date')->get();
        return Inertia::render('Employees/History', [
            'employee' => $this->formatEmployee($employee),
            'payments' => $payments,
        ]);
    }

    private function formatEmployee(Employee $e): array
    {
        return [
            'id'             => $e->id,
            'name'           => $e->name,
            'role'           => $e->role,
            'email'          => $e->email,
            'phone'          => $e->phone,
            'joining_date'   => $e->joining_date?->format('Y-m-d'),
            'monthly_salary' => $e->monthly_salary,
            'formatted_salary'=> $e->formatted_salary,
            'status'         => $e->status,
            'notes'          => $e->notes,
            'photo_url'      => $e->photo_url,
            'account'        => $e->account ? ['id' => $e->account->id, 'name' => $e->account->name] : null,
            'last_payment'   => $e->lastPayment ? [
                'amount'      => $e->lastPayment->amount,
                'month_year'  => $e->lastPayment->month_year,
                'payment_date'=> $e->lastPayment->payment_date?->format('Y-m-d'),
            ] : null,
        ];
    }

    private function savePhoto($file): string
    {
        $filename = 'employees/' . uniqid() . '.jpg';
        $image    = Image::read($file)->cover(300, 300);
        Storage::disk('public')->put($filename, $image->toJpeg(85));
        return $filename;
    }
}
