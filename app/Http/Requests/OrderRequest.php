<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
            'spList' => 'required|array|min:1',
            'spList.*.spcode' => 'required|string',
            'spList.*.path_file' => 'required|string',
            'spList.*.quantity' => 'required|integer|min:1',
            'spList.*.price_per_unit' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'spList.required' => 'ไม่พบรายการอะไหล่ที่ต้องการสั่งซื้อ',
            'spList.array' => 'รูปแบบข้อมูลอะไหล่ไม่ถูกต้อง',
            'spList.min' => 'ต้องมีอะไหล่อย่างน้อย 1 รายการ',
            'spList.*.sp_code.required' => 'รหัสอะไหล่ต้องไม่ว่าง',
            'spList.*.qty.required' => 'ต้องระบุจำนวนอะไหล่',
            'spList.*.qty.integer' => 'จำนวนอะไหล่ต้องเป็นตัวเลขจำนวนเต็ม',
            'spList.*.qty.min' => 'จำนวนอะไหล่ต้องไม่น้อยกว่า 1',
            'spList.*.price_per_unit.required' => 'ต้องระบุราคาอะไหล่',
            'spList.*.price_per_unit.numeric' => 'ราคาอะไหล่ต้องเป็นตัวเลข',
            'spList.*.price_per_unit.min' => 'ราคาอะไหล่ต้องไม่น้อยกว่า 0',
        ];
    }
}
