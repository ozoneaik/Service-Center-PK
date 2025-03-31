<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaleRequest extends FormRequest
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
            'sale_code' => ['required', 'string', 'max:255', 'unique:sale_information,sale_code'],
            'name' => ['required', 'string', 'max:255',],
            'lark_token' => ['required', 'string', 'max:255', 'unique:sale_information,lark_token'],
        ];
    }

    public function messages(): array
    {
        return [
            'sale_code.required' => 'กรุณากรอก sale_code',
            'sale_code.unique' => 'sale_code นี้มีอยู่แล้ว',
            'name.required' => 'กรุณากรอกชื่อ',
            'lark_token.required' => 'กรุณากรอก lark_token',
            'lark_token.unique' => 'lark_token นี้มีอยู่แล้ว',
        ];
    }

}
