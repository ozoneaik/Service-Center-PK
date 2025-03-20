<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EmpRequest extends FormRequest
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
            'name' => 'required',
            'user_code' => ['required', 'unique:users,user_code'],
            'email' => ['required', 'unique:users,email'],
            'password' => ['required', 'confirmed'],
            'password_confirmation' => 'required',
            'role' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'user_code.required' => 'กรุณากรอกรหัสผู้ใช้งาน',
            'user_code.unique' => 'รหัสผู้ใช้งานนี้ถูกใช้งานแล้ว กรุณาใช้รหัสอื่น',
            'name.required' => 'กรุณากรอกชื่อ',
            'email.required' => 'กรุณากรอกอีเมล',
            'password.required' => 'กรุณากรอกรหัสผ่าน',
            'password_confirmation.required' => 'กรุณายืนยันรหัสผ่าน',
            'role.required' => 'กรุณาเลือกสิทธิ์การใช้งาน',
            'email.unique' => 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น',
            'password.confirmed' => 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน',
        ];
    }

}
