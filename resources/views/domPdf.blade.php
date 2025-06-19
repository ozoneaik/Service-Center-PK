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
            padding: 20px;
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
            margin: 15mm;
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
            ศูนย์บริการ {{$shop_name ?? ''}}
        </div>
    </div>

    <div class="info-section">
        <table class="info-table">
            <tr>
                <td class="label">กลุ่มงาน: {{ $job_group ?? '' }}</td>
                <td class="label" style="text-align: right;">วันที่: {{ \Carbon\Carbon::now()->format('d/m/Y') }}</td>
            </tr>
        </table>
    </div>

    <div class="product-item">
        <div class="product-title">
            J-series เจียรมือ J-G9612
        </div>
        <div class="product-description">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores consectetur corporis, eligendi hic maiores
            nesciunt nihil, nobis obcaecati perferendis perspiciatis, quam quasi quia quod rem saepe soluta temporibus unde
            voluptates.
        </div>
    </div>

    <div class="product-item">
        <div class="product-title">
            J-series เจียรมือ J-G9612
        </div>
        <div class="product-description">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores consectetur corporis, eligendi hic maiores
            nesciunt nihil, nobis obcaecati perferendis perspiciatis, quam quasi quia quod rem saepe soluta temporibus unde
            voluptates.
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-label">
                ลายเซ็นผู้รับสินค้า
            </div>
            <div class="signature-line"></div>
        </div>
    </div>

</div>

<htmlpagefooter name="footer">
    <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
        Pumpkin Corporation Service Center
    </div>
</htmlpagefooter>
</body>
</html>
