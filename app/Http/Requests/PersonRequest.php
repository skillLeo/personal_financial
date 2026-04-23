<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PersonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:100'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'email'        => ['nullable', 'email', 'max:100'],
            'relationship' => ['required', Rule::in(['friend', 'client', 'employee', 'supplier', 'family', 'other'])],
            'photo'        => ['nullable', 'image', 'max:2048'],
            'notes'        => ['nullable', 'string', 'max:500'],
        ];
    }
}
