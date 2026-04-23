<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubscriptionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:100'],
            'description'   => ['nullable', 'string', 'max:500'],
            'amount'        => ['required', 'numeric', 'min:0.01'],
            'billing_cycle' => ['required', Rule::in(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])],
            'next_due_date' => ['required', 'date'],
            'account_id'    => ['nullable', 'integer', Rule::exists('accounts', 'id')->where('user_id', $this->user()->id)],
            'category_id'   => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'reminder_days' => ['nullable', 'integer', 'min:0', 'max:30'],
            'logo_url'      => ['nullable', 'string', 'max:255'],
        ];
    }
}
