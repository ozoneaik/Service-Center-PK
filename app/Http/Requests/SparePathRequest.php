<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use phpDocumentor\Reflection\Types\CallableParameter;

class SparePathRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'job_id' => 'required',
            'list' => 'required | array',
        ];
    }

    public function messages() : array{
        return [
            'serial_id.required' => 'Serial ID is required.',
            'list.required' => 'List is required.',
            'job_id.required' => 'Job is required.',
            'list.array' => 'List must be an array.',
        ];
    }
}
