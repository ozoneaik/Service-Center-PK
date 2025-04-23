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
            'serial_id' => 'required',
            'name' => 'required',
            'phone' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'job_id.required' => 'ไม่พบหมายเลขจ็อบ',
            'serial_id.required' => 'ไม่พบหมายเลข S/N',
            'name.required' => 'จำเป็นต้องกรอกชื่อลูกค้า',
            'phone.required' => 'จำเป็นต้องกรอกเบอร์โทรศัพท์',
        ];
    }
}
