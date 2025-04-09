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
            'warrantyperiod' => ['required','numeric'],
        ];
    }

    public function messages(): array
    {
        return [
            'serial_id.required' => 'กรุณากรอก Serial ID',
            'serial_id.unique' => 'ข้อมูล Serial ID นี้ถูกบันทึกไว้แล้ว หากต้องการอัปเดต กรุณากดตกลง',
            'pid.required' => 'กรุณากรอกรหัสสินค้า (PID)',
            'p_name.required' => 'กรุณากรอกชื่อสินค้า',
            'date_warranty.required' => 'กรุณากรอกวันที่ลงทะเบียนรับประกัน',
            'warrantyperiod.required' => 'ไม่พบข้อมูลระยะเวลารับประกัน',
            'warrantyperiod.numeric' => 'ระยะเวลารับประกันต้องเป็นตัวเลขเท่านั้น',
        ];
    }



}
