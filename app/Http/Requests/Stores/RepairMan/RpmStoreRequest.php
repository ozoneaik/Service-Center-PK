<?php

namespace App\Http\Requests\Stores\RepairMan;

use Illuminate\Foundation\Http\FormRequest;

class RpmStoreRequest extends FormRequest
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
            'is_code_cust_id' => 'required',
            'technician_name' => 'required|string|max:255',
            'technician_nickname' => 'required|string|max:255',
            'technician_phone' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'is_code_cust_id.required' => 'กรุณาระบุรหัสลูกค้า',
            'technician_name.required' => 'กรุณาระบุชื่อช่างซ่อม',
            'technician_nickname.required' => 'กรุณาระบุชื่อเล่นช่างซ่อม',
            'technician_phone.required' => 'กรุณาระบุเบอร์โทรช่างซ่อม',
        ];
    }
}
