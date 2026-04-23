<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'person_id'     => ['required', 'integer', Rule::exists('people', 'id')->where('user_id', $this->user()->id)],
            'type'          => ['required', Rule::in(['given', 'taken'])],
            'total_amount'  => ['required', 'numeric', 'min:0.01'],
            'interest_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'loan_date'     => ['required', 'date'],
            'due_date'      => ['nullable', 'date', 'after:loan_date'],
            'notes'         => ['nullable', 'string', 'max:500'],
            'photo'         => ['nullable', 'image', 'max:5120'],
        ];
    }
}
