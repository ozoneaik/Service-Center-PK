<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScoreSkuRequest extends FormRequest
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
            'status' => ['required', 'string', 'in:active,inactive'],
            'sku' => ['required', 'string', 'unique:products,sku'],
            'sku_name' => ['required', 'string'],
            'group_product_ref' => ['required', 'string'],
            'range_value_ref' => ['required', 'integer', 'between:0,100'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'กรุณาระบุสถานะ',
            'status.string' => 'สถานะต้องเป็นข้อความ',
            'status.in' => 'สถานะต้องเป็น active หรือ inactive เท่านั้น',

            'sku.required' => 'กรุณากรอกรหัสสินค้า',
            'sku.string' => 'รหัสสินค้าต้องเป็นข้อความ',
            'sku.unique' => 'รหัสสินค้านี้มีอยู่ในระบบแล้ว',

            'sku_name.required' => 'กรุณากรอกชื่อสินค้า',
            'sku_name.string' => 'ชื่อสินค้าต้องเป็นข้อความ',

            'group_product_ref.required' => 'กรุณากรอกกลุ่มสินค้า',
            'group_product_ref.string' => 'กลุ่มสินค้าต้องเป็นข้อความ',

            'range_value_ref.required' => 'กรุณากรอกค่าความสามารถการซ่อม',
            'range_value_ref.integer' => 'ค่าความสามารถการซ่อมต้องเป็นตัวเลข',
            'range_value_ref.between' => 'ค่าความสามารถการซ่อมต้องอยู่ระหว่าง 0 ถึง 100',
        ];
    }
}
