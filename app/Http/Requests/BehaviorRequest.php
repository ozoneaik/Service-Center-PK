<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BehaviorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'serial_id' => 'required',
            'list' => 'required | array',
        ];
    }

    public function messages(): array
    {
        return [
            'serial_id.required' => 'serial_id is required',
            'list.required' => 'list is required',
            'list.array' => 'list must be an array',
        ];
    }
}
