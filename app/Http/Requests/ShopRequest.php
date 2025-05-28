<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShopRequest extends FormRequest
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
            'is_code_cust_id' => ['required', 'string', 'max:255', 'unique:store_information,is_code_cust_id'],            // รหัสร้านต้องไม่ว่าง
            'shop_name' => ['required', 'string', 'max:255'],        // ชื่อร้านต้องไม่ว่าง
            'address' => ['required', 'string', 'max:500'],          // ที่อยู่ต้องไม่ว่าง
            'phone' => ['required', 'regex:/^0[0-9]{9}$/'],         // เบอร์โทรต้องเป็นตัวเลข 10 หลัก (ขึ้นต้นด้วย 0)
            'province' => ['required', 'string', 'max:255'],        // จังหวัดต้องไม่ว่าง
            'district' => ['required', 'string', 'max:255'],        // อำเภอต้องไม่ว่าง
            'subdistrict' => ['required', 'string', 'max:255'],     // ตำบลต้องไม่ว่าง
            'zipcode' => ['required', 'digits:5'],                  // รหัสไปรษณีย์ต้องมี 5 หลัก
            'full_address' => ['required', 'string', 'max:1000'],   // ที่อยู่เต็มต้องไม่ว่าง
            'sale_id' => ['required', 'string', 'max:255',],
        ];
    }

    public function messages(): array
    {
        return [
            'is_code_cust_id.required' => 'กรุณากรอกรหัสร้าน',
            'is_code_cust_id.unique' => 'รหัสร้านนี้มีอยู่แล้วในระบบ',
            'is_code_cust_id.max' => 'รหัสร้านต้องไม่เกิน 255 ตัวอักษร',
            'shop_name.required' => 'กรุณากรอกชื่อร้าน',
            'shop_name.max' => 'ชื่อร้านต้องไม่เกิน 255 ตัวอักษร',
            'address.required' => 'กรุณากรอกที่อยู่',
            'address.max' => 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร',
            'phone.required' => 'กรุณากรอกเบอร์โทรศัพท์',
            'phone.regex' => 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0',
            // 'gp.required' => 'กรุณากรอกค่า GP',
            // 'gp.numeric' => 'ค่า GP ต้องเป็นตัวเลข',
            // 'gp.min' => 'ค่า GP ต้องไม่ต่ำกว่า 0',
            'province.required' => 'กรุณาเลือกจังหวัด',
            'province.max' => 'ชื่อจังหวัดต้องไม่เกิน 255 ตัวอักษร',
            'district.required' => 'กรุณาเลือกอำเภอ',
            'district.max' => 'ชื่ออำเภอต้องไม่เกิน 255 ตัวอักษร',
            'subdistrict.required' => 'กรุณาเลือกตำบล',
            'subdistrict.max' => 'ชื่อตำบลต้องไม่เกิน 255 ตัวอักษร',
            'zipcode.required' => 'กรุณากรอกรหัสไปรษณีย์',
            'zipcode.digits' => 'รหัสไปรษณีย์ต้องมี 5 หลัก',
            'full_address.required' => 'กรุณากรอกที่อยู่แบบเต็ม',
            'full_address.max' => 'ที่อยู่แบบเต็มต้องไม่เกิน 1000 ตัวอักษร',
            'sale_id.required' => 'กรอก รหัสสเซลล์',
        ];
    }
}
