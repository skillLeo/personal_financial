<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AccountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'type'       => ['required', Rule::in(['cash', 'bank', 'jazzcash', 'easypaisa', 'other'])],
            'balance'    => ['nullable', 'numeric', 'min:0'],
            'color'      => ['nullable', 'string', 'max:10'],
            'icon'       => ['nullable', 'string', 'max:50'],
            'is_default' => ['boolean'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please enter an account name.',
            'type.required' => 'Please select an account type.',
        ];
    }
}
