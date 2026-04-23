<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id'       => ['required', 'integer', Rule::exists('accounts', 'id')->where('user_id', $this->user()->id)],
            'category_id'      => ['required', 'integer', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'person_id'        => ['nullable', 'integer', Rule::exists('people', 'id')->where('user_id', $this->user()->id)],
            'type'             => ['required', Rule::in(['income', 'expense', 'transfer'])],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'description'      => ['nullable', 'string', 'max:1000'],
            'transaction_date' => ['required', 'date'],
            'transaction_time' => ['nullable', 'date_format:H:i'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'is_recurring'     => ['boolean'],
            'recurring_type'   => ['nullable', Rule::in(['daily', 'weekly', 'monthly', 'yearly'])],
            'recurring_end_date'=> ['nullable', 'date', 'after:transaction_date'],
            'photos'           => ['nullable', 'array', 'max:10'],
            'photos.*'         => ['image', 'max:5120'],
            'photo_type'       => ['nullable', Rule::in(['receipt', 'proof', 'screenshot', 'other'])],
        ];
    }

    public function messages(): array
    {
        return [
            'account_id.required'  => 'Please select an account.',
            'account_id.exists'    => 'The selected account does not belong to you.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists'   => 'The selected category does not belong to you.',
            'person_id.exists'     => 'The selected person does not belong to you.',
            'type.required'        => 'Please select transaction type (Income or Expense).',
            'amount.required'      => 'Please enter an amount.',
            'amount.min'           => 'Amount must be greater than Rs. 0.',
            'transaction_date.required' => 'Please select a date.',
            'photos.*.max'         => 'Each photo must be smaller than 5MB.',
            'photos.*.image'       => 'Only image files are allowed.',
        ];
    }
}
