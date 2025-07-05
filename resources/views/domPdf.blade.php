<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="utf-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'sarabun', sans-serif;
        }

        .container {
            width: 100%;
            font-size: 12px;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
        }

        .main-title {
            font-size: 18px;
            font-weight: bold;
            color: #343434;
            margin-bottom: 8px;
        }

        .sub-title {
            font-size: 16px;
            color: #343434;
        }

        .divider {
            border-bottom: 2px solid #000;
            margin: 15px 0;
        }

        .info-section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
        }

        .info-table {
            width: 100%;
        }

        .info-table td {
            padding: 5px 0;
        }

        .label {
            color: #7f8c8d;
        }

        .value {
            color: #4b4b4b;
            font-weight: bold;
        }

        .product-item {
            margin-bottom: 10px;
            padding: 15px;
            border: 1px solid #5b5b5b;
        }

        .product-title {
            color: #4b4b4b;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #5b5b5b;
        }

        .product-description {
            font-size : 14px;
            color: #7f8c8d;
            line-height: 1.5;
            text-align: justify;
        }

        .signature-section {
            margin-top: 40px;
            text-align: right;
        }

        .signature-box {
            display: inline-block;
            width: 300px;
            text-align: center;
            padding: 20px;
            border: 1px solid #ddd;
        }

        .signature-label {
            color: #7f8c8d;
            margin-bottom: 40px;
        }

        .signature-line {
            border-top: 1px solid #000;
            margin-top: 20px;
        }

        @page {
            margin: 10mm;
        }
    </style>
</head>

<body>
    <div class="container">

        <div class="header">
            <div class="main-title">
                รายงานส่งซ่อมสินค้ามายังศูนย์ Pumpkin Corporation
            </div>
            <div class="divider"></div>
            <div class="sub-title">
                ศูนย์บริการ {{ $shop_name ?? '' }}
            </div>
        </div>

        <div class="info-section">
            <table class="info-table">
                <tr>
                    <td class="label">กลุ่มงาน: {{ $group_job_id ?? '-' }}</td>
                    <td class="label" style="text-align: right;">วันที่: {{ \Carbon\Carbon::now()->format('d/m/Y') }}
                    </td>
                </tr>
            </table>
        </div>


        @foreach ($group_job as $job)
            <div class="product-item">
                <div class="product-title">
                    {{ $job['p_name'] }}
                </div>
                <div class="product-description">
                    รหัสสินค้า : {{ $job['pid'] }} | ซีเรียล : {{ $job['serial_id'] }} | Job ID : {{ $job['job_id'] }}
                    <br/>
                    ประเภท : {{ $job['p_cat_name'] }} | ประเภทย่อย : {{ $job['p_sub_cat_name'] }}
                </div>
            </div>
        @endforeach


        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-label">
                    ลายเซ็นผู้รับสินค้า
                </div>
                <div class="signature-line"></div>
            </div>
        </div>

    </div>
</body>

</html>
