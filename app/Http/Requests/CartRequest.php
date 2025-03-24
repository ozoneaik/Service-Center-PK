<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required',
            'sp_code' => 'required',
            'sp_name' => 'required',
            'sku_code' => 'required',
            'qty' => 'required',
            'sp_unit' => 'required',
            'price_per_unit' => 'required',
            'remark' => 'required',
            'path_file' => 'required'
        ];
    }

    public function messages(): array
    {
        return [
            'order_id.required' => 'ต้องระบุ Order ID',
            'sp_code.required' => 'ต้องระบุรหัสอะไหล่ (SP Code)',
            'sp_name.required' => 'ต้องระบุชื่ออะไหล่ (SP Name)',
            'sku_code.required' => 'ต้องระบุรหัสสินค้า (SKU Code)',
            'sp_unit.required' => 'ต้องระบุหน่วยของอะไหล่ (SP Unit)',
            'price_per_unit.required' => 'ต้องระบุราคาต่อหน่วย',
            'remark.required' => 'ต้องระบุหมายเหตุ',
            'path_file.required' => 'ต้องระบุไฟล์แนบ (Path File)',
        ];
    }

}
