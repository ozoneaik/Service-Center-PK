<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockSpRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'sp_code' => ['required', 'string'],
            'sp_name' => ['required', 'string'],
            'qty_sp' => ['required', 'numeric','min:1'],
            // 'received_date' => ['required', 'string'],
            'is_code_cust_id' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'sp_code.required' => 'กรุณากรอกรหัสอะไหล่',
            'sp_name.required' => 'กรุณากรอกชื่ออะไหล่',
            'qty_sp.required' => 'กรุณากรอกจำนวนอะไหล่',
            // 'received_date.required' => 'กรุณาเลือกที่เก็บ',
            'is_code_cust_id.required' => 'กรุณาเลือกร้านค้า',
            'sp_code.string' => 'รหัสอะไหล่ต้องเป็นตัวอักษร',
            'sp_name.string' => 'ชื่ออะไหล่ต้องเป็นตัวอักษร',
            'qty_sp.numeric' => 'จำนวนอะไหล่ต้องเป็นตัวเลข',
            'qty_sp.min' => 'จำนวนอะไหล่ต้องมากกว่า 0',
            // 'received_date.string' => 'ที่เก็บต้องเป็นตัวอักษร',
            'is_code_cust_id.string' => 'รหัสร้านค้าต้องเป็นตัวอักษร',
        ];
    }
}
