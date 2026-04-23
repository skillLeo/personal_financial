<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:100'],
            'role'           => ['nullable', 'string', 'max:100'],
            'email'          => ['nullable', 'email', 'max:100'],
            'phone'          => ['nullable', 'string', 'max:20'],
            'joining_date'   => ['nullable', 'date'],
            'monthly_salary' => ['required', 'numeric', 'min:0'],
            'account_id'     => ['nullable', 'integer', Rule::exists('accounts', 'id')->where('user_id', $this->user()->id)],
            'photo'          => ['nullable', 'image', 'max:2048'],
            'status'         => ['required', Rule::in(['active', 'inactive'])],
            'notes'          => ['nullable', 'string', 'max:500'],
        ];
    }
}
