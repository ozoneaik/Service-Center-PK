<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CustomerInJobRequest extends FormRequest
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
            'name' => 'required',
            'phone' => 'required',
            'address' => 'required',
            'remark' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'job_id.required' => 'job_id is required',
            'name.required' => 'name is required',
            'phone.required' => 'phone is required',
            'address.required' => 'address is required',
            'remark.required' => 'remark is required',
        ];
    }
}
