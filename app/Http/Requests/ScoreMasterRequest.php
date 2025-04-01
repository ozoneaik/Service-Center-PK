<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScoreMasterRequest extends FormRequest
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
            'range_value' => ['required','numeric','between:0,100','unique:score_masters,range_value'],
            'range_name' => ['required','string'],
            'condition' => ['required','string'],
            'group_product' => ['required','string'],
        ];
    }

    public function messages(): array
    {
        return [
            'range_value.required' => 'กรุณากรอกค่า Range Value',
            'range_value.numeric' => 'ค่า Range Value ต้องเป็นตัวเลข',
            'range_value.between' => 'ค่า Range Value ต้องอยู่ระหว่าง 0 ถึง 100',
            'range_value.unique' => 'ค่า Range Value นี้มีอยู่ในระบบแล้ว',

            'range_name.required' => 'กรุณากรอกชื่อ Range Name',
            'range_name.string' => 'ค่า Range Name ต้องเป็นตัวอักษร',

            'condition.required' => 'กรุณากรอกเงื่อนไข',
            'condition.string' => 'ค่าเงื่อนไขต้องเป็นตัวอักษร',

            'group_product.required' => 'กรุณากรอกกลุ่มสินค้า',
            'group_product.string' => 'ค่ากลุ่มสินค้าต้องเป็นตัวอักษร',
        ];
    }
}
