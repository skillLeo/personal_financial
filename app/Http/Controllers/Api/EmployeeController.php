<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Category;
use App\Models\Employee;
use App\Models\SalaryPayment;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int)($request->per_page ?? 20), 100);
        $query   = Employee::where('user_id', $request->user()->id)->with(['account', 'lastPayment']);
        if ($request->filled('status')) $query->where('status', $request->status);
        $paginator = $query->orderBy('name')->paginate($perPage);
        $paginator->getCollection()->transform(fn($e) => $this->fmt($e));
        return $this->success($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $emp = Employee::where('user_id', $request->user()->id)->with(['account', 'lastPayment', 'salaryPayments'])->find($id);
        if (!$emp) return $this->notFound('Employee not found.');
        return $this->success($this->fmt($emp, true));
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name'           => ['required', 'string', 'max:100'],
            'role'           => ['nullable', 'string', 'max:100'],
            'email'          => ['nullable', 'email', 'max:150'],
            'phone'          => ['nullable', 'string', 'max:20'],
            'joining_date'   => ['nullable', 'date'],
            'monthly_salary' => ['required', 'numeric', 'min:0'],
            'account_id'     => ['nullable', 'integer', 'exists:accounts,id'],
            'status'         => ['nullable', 'in:active,inactive'],
            'notes'          => ['nullable', 'string', 'max:500'],
            'photo'          => ['nullable', 'image', 'max:2048'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $data = [...$request->only(['name', 'role', 'email', 'phone', 'joining_date', 'monthly_salary', 'account_id', 'notes']), 'user_id' => $request->user()->id, 'status' => $request->status ?? 'active'];
        if ($request->hasFile('photo')) $data['photo'] = $request->file('photo')->store('employees', 'public');

        $emp = Employee::create($data);
        $emp->load(['account', 'lastPayment']);
        return $this->created($this->fmt($emp));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $emp = Employee::where('user_id', $request->user()->id)->find($id);
        if (!$emp) return $this->notFound('Employee not found.');

        $v = Validator::make($request->all(), [
            'name'           => ['sometimes', 'string', 'max:100'],
            'role'           => ['nullable', 'string', 'max:100'],
            'monthly_salary' => ['sometimes', 'numeric', 'min:0'],
            'status'         => ['nullable', 'in:active,inactive'],
            'photo'          => ['nullable', 'image', 'max:2048'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        $data = $request->only(['name', 'role', 'email', 'phone', 'joining_date', 'monthly_salary', 'account_id', 'status', 'notes']);
        if ($request->hasFile('photo')) {
            if ($emp->photo) Storage::disk('public')->delete($emp->photo);
            $data['photo'] = $request->file('photo')->store('employees', 'public');
        }
        $emp->update($data);
        $emp->load(['account', 'lastPayment']);
        return $this->success($this->fmt($emp), 'Employee updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $emp = Employee::where('user_id', $request->user()->id)->find($id);
        if (!$emp) return $this->notFound('Employee not found.');
        if ($emp->photo) Storage::disk('public')->delete($emp->photo);
        $emp->delete();
        return $this->success(null, 'Employee deleted.');
    }

    public function paySalary(Request $request, int $id): JsonResponse
    {
        $emp = Employee::where('user_id', $request->user()->id)->find($id);
        if (!$emp) return $this->notFound('Employee not found.');

        $v = Validator::make($request->all(), [
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'payment_date'   => ['required', 'date'],
            'month_year'     => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'payment_method' => ['required', 'in:cash,bank,jazzcash,easypaisa,other'],
            'account_id'     => ['required', 'integer', 'exists:accounts,id'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);
        if ($v->fails()) return $this->validationError($v);

        if (SalaryPayment::where('employee_id', $id)->where('month_year', $request->month_year)->exists()) {
            return $this->error('Salary already paid for '.$request->month_year.'.', 422);
        }

        $category = Category::where('user_id', $request->user()->id)->where('type', 'expense')->first();
        $transaction = Transaction::create([
            'user_id'          => $request->user()->id,
            'account_id'       => $request->account_id,
            'category_id'      => $category?->id,
            'type'             => 'expense',
            'amount'           => $request->amount,
            'description'      => 'Salary: '.$emp->name.' ('.$request->month_year.')',
            'transaction_date' => $request->payment_date,
        ]);

        $payment = SalaryPayment::create([
            'employee_id'    => $id,
            'amount'         => $request->amount,
            'payment_date'   => $request->payment_date,
            'month_year'     => $request->month_year,
            'payment_method' => $request->payment_method,
            'notes'          => $request->notes,
            'transaction_id' => $transaction->id,
        ]);

        return $this->created(['payment_id' => $payment->id, 'transaction_id' => $transaction->id], 'Salary paid successfully.');
    }

    public function paymentHistory(Request $request, int $id): JsonResponse
    {
        $emp = Employee::where('user_id', $request->user()->id)->find($id);
        if (!$emp) return $this->notFound('Employee not found.');

        $perPage  = min((int)($request->per_page ?? 12), 60);
        $payments = SalaryPayment::where('employee_id', $id)->orderByDesc('payment_date')->paginate($perPage);
        $payments->getCollection()->transform(fn($p) => [
            'id'             => $p->id,
            'amount'         => (float) $p->amount,
            'payment_date'   => $p->payment_date->toDateString(),
            'month_year'     => $p->month_year,
            'payment_method' => $p->payment_method,
            'notes'          => $p->notes,
        ]);
        return $this->success(['employee' => $this->fmt($emp), 'payments' => $payments->items(), 'meta' => ['current_page' => $payments->currentPage(), 'per_page' => $payments->perPage(), 'total' => $payments->total(), 'last_page' => $payments->lastPage()]]);
    }

    private function fmt(Employee $e, bool $withPayments = false): array
    {
        $data = [
            'id'             => $e->id,
            'name'           => $e->name,
            'role'           => $e->role,
            'email'          => $e->email,
            'phone'          => $e->phone,
            'joining_date'   => $e->joining_date?->toDateString(),
            'monthly_salary' => (float) $e->monthly_salary,
            'status'         => $e->status,
            'photo_url'      => $e->photo ? Storage::url($e->photo) : null,
            'notes'          => $e->notes,
            'account'        => $e->account ? ['id' => $e->account->id, 'name' => $e->account->name] : null,
            'last_payment'   => $e->lastPayment ? ['amount' => (float) $e->lastPayment->amount, 'month_year' => $e->lastPayment->month_year, 'date' => $e->lastPayment->payment_date->toDateString()] : null,
            'created_at'     => $e->created_at->toIso8601String(),
        ];
        if ($withPayments && $e->relationLoaded('salaryPayments')) {
            $data['salary_payments'] = $e->salaryPayments->map(fn($p) => ['id' => $p->id, 'amount' => (float) $p->amount, 'month_year' => $p->month_year, 'date' => $p->payment_date->toDateString()])->toArray();
        }
        return $data;
    }
}
