<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ClaimRequest extends FormRequest
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
            'selected' => 'required | array',
        ];
    }

    public function messages(): array{
        return [
            'selected.required' => 'กรุณาเลือกรายการอะไหล่ที่ต้องการสร้างเอกสารการเคลมอย่างน้อย 1 รายการ',
        ];
    }
}
