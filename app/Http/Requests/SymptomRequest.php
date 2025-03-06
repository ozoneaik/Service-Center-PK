<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SymptomRequest extends FormRequest
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
            'job_id' => 'required',
            'serial_id' => 'required',
            'symptom' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'job_id.required' => 'job_id is required',
            'serial_id.required' => 'serial_id is required',
            'symptom.required' => 'จำเป็นต้องกรอกอาการเบื้องต้น',
        ];
    }
}
