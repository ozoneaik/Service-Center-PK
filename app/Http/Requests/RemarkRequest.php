<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RemarkRequest extends FormRequest
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
            'remark' => 'required',
            'job_id' => 'required',
            'serial_id' => 'required',
        ];
    }

    public function messages() : array
    {
        return [
            'remark.required' => 'remark is required.',
            'job_id.required' => 'job is required.',
            'serial_id.required' => 'ไม่พบซีเรียลที่ต้องการสร้างหรืออัพเดท',
        ];
    }
}
