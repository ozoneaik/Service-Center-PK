<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
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
            'sn' => 'required',
            'views' => 'required',
            'createJob' => ['required','boolean'],
        ];
    }

    public function messages(): array{
        return [
            'sn.required' => 'sn is required',
            'views.required' => 'views is required',
            'createJob.required' => 'create job is required',
            'createJob.boolean' => 'create job must be an boolean',
        ];
    }
}
