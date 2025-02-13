<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WarrantyProductRequest extends FormRequest
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
            'serial_id' => ['required',Rule::unique('warranty_products','serial_id')],
            'pid' => 'required',
            'p_name' => 'required',
            'date_warranty' => 'required',
        ];
    }

    public function messages(): array{
        return [
            'serial_id.required' => 'serial id is required',
            'serial_id.unique' => 'เคยบันทึกข้อมูลนี้ไว้แล้ว กดตกลงเพื่อ อัพเดทข้อมูล',
            'pid.required' => 'Pid is required',
            'p_name.required' => 'Pid is required',
            'date_warranty.required' => 'date warranty is required',
        ];
    }


}
