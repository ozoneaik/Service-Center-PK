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
            'list' => 'required | array | min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'serial_id.required' => 'ไม่พบซีเรียลนี้',
            'list.required' => 'ไม่พบฟอร์ม กรุณาเลือกรายการอย่างน้อย 1 รายการ',
            'list.array' => 'ฟอร์มมีค่าว่าง กรุณาเลือกรายการอย่างน้อย 1 รายการ',
            'list.min' => 'กรุณาเลือกอาการอย่างน้อย 1 อาการ'
        ];
    }
}
