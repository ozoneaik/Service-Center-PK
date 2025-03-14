<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadFileRequest extends FormRequest
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
            // 'list.*.list.*.image' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:512000'], // 500MB
        ];
    }

    public function messages(): array
    {
        return [
            'serial_id.required' => 'Serial ID is required.',
            'job_id.required' => 'Job ID is required.',
            'list.required' => 'List is required.',
            'list.array' => 'List must be an array.',

        ];
    }
}
