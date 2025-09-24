<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ใบรับงานซ่อม</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.min.js"></script>
    <style>
        body {
            font-family: "TH Sarabun New", sans-serif;
            font-size: 16px;
            line-height: 1.2;
            margin: 10px;
            width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
        }

        .center {
            text-align: center;
        }

        .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }

        .section {
            margin-bottom: 5px;
        }

        #barcode,
        #barcode_customer {
            display: block;
            width: 100%;
            height: 40px;
            max-width: 100%;
        }

        .qc-code {
            display: block;
            max-width: 80px;
            height: auto;
            margin: 0 auto;
        }

        .label {
            font-weight: bold;
            display: inline-block;
            min-width: 80px;
            vertical-align: top;
        }

        h2 {
            margin: 5px 0;
            font-size: 18px;
        }

        .compact-section {
            margin-bottom: 3px;
        }

        .compact-section div {
            margin-bottom: 2px;
        }

        .page-break {
            page-break-before: always;
            margin-top: 15px;
        }

        @media print {
            @page {
                size: A4;
                margin: 10mm;
            }

            body {
                font-size: 14px;
                margin: 0;
            }

            .d-print-none {
                display: none !important;
            }
        }
    </style>
</head>

<body>
    <!-- ส่วนที่ 1: สำหรับร้าน -->
    <div class="center">
        <h2>ศูนย์บริการ PCS</h2>
    </div>

    <div class="compact-section">
        <div><span class="label">ชื่อร้าน:</span> {{ $store['shop_name'] }}</div>
        <div><span class="label">เบอร์โทรศัพท์:</span> {{ $store['phone'] }}</div>
    </div>

    <div class="divider"></div>

    <div class="center">
        <svg id="barcode"></svg>
    </div>

    <div class="divider"></div>

    <div class="compact-section">
        <div><span class="label">วันที่:</span> {{ \Carbon\Carbon::now()->format('d/m/Y ') }}</div>
        <div><span class="label">ชื่อลูกค้า:</span> {{ $customer['name'] }}</div>
        <div><span class="label">เบอร์โทรติดต่อ:</span> {{ $customer['phone'] }}</div>
        <div><span class="label">S/N:</span> {{ $product['serial_id'] }}</div>
        <div><span class="label">รหัสและชื่อสินค้า:</span> ({{ $product['pid'] }}) {{ $product['p_name'] }}</div>
        <div><span class="label">อาการ:</span> {{ $symptom ?? '-' }}</div>
        <div><span class="label">พนักงานผู้รับงานซ่อม:</span> {{ $user_key['name'] }}</div>
        <div><span class="label">อุปกรณ์เสริม:</span> {{ $accessory ?? '-' }}</div>
        @php
            $remarks = [];
            if (!empty($customer['subremark1'])) {
                $remarks[] = 'เสนอราคาก่อนซ่อม';
            }
            if (!empty($customer['subremark2'])) {
                $remarks[] = 'ซ่อมเสร็จส่งกลับทางไปรษณีย์';
            }
            if (!empty($customer['subremark3']) && !empty($customer['remark'])) {
                $remarks[] = $customer['remark'];
            }
            $remarkText = count($remarks) > 0 ? implode(' , ', $remarks) : '-';
        @endphp

        <div>
            <span class="label">หมายเหตุลูกค้า:</span> {{ $remarkText }}
        </div>
        <div><span class="label">หมายเหตุในศูนย์ซ่อม:</span> {{ $remark }}</div>
    </div>

    <div class="divider"></div>
    <div class="page-break"></div>

    <!-- ส่วนที่ 2: สำหรับลูกค้า -->
    <div class="page-break-disable">
        <div class="center">
            <h2>ศูนย์บริการ PCS</h2>
            <h2 style="margin-top: 0;">สำหรับลูกค้า</h2>
        </div>

        <div class="compact-section">
            <div><span class="label">ชื่อร้าน:</span> {{ $store['shop_name'] }}</div>
            <div><span class="label">เบอร์โทรศัพท์:</span> {{ $store['phone'] }}</div>
        </div>

        <div class="divider"></div>

        <div class="center">
            <svg id="barcode_customer"></svg>
        </div>

        <div class="divider"></div>

        <div class="compact-section">
            <div><span class="label">วันที่:</span> {{ \Carbon\Carbon::now()->format('d/m/Y ') }}</div>
            <div><span class="label">S/N:</span> {{ $product['serial_id'] }}</div>
            <div><span class="label">รหัสและชื่อสินค้า:</span> ({{ $product['pid'] }}) {{ $product['p_name'] }}</div>
            <div><span class="label">อาการ:</span> {{ $symptom ?? '-' }}</div>
            <div><span class="label">พนักงานผู้รับงานซ่อม:</span> {{ $user_key['name'] }}</div>
            <div><span class="label">อุปกรณ์เสริม:</span> {{ $accessory ?? '-' }}</div>
            <div><span class="label">หมายเหตุลูกค้า:</span> {{ $customer['remark'] ?? '-' }}</div>
        </div>

        <div class="divider"></div>

        <!-- qr code -->
        <div class="section center">
            <div style="display: flex; justify-content: space-evenly; gap:15px;">
                <div>
                    <div id="line-qr"></div>
                    <div style="font-size: 14px;">
                        Line Id : {{ $store['line_id'] ?? '-' }}
                    </div>
                </div>
                <div>
                    <div id="line-qr2"></div>
                    <div style="font-size: 14px;">
                        ศูนย์ซ่อม pumpkin
                    </div>
                </div>
            </div>
        </div>

        <div class="divider"></div>
        <div class="section center" style="font-size: 14px;">
            {!! nl2br(e($store['footer_description'])) !!}
        </div>
    </div>

    <!-- ปุ่ม Print -->
    <button onclick="window.print()" style="padding: 10px; " class="btn btn-secondary d-print-none">
        ปริ้น
    </button>

    <a href="{{ route('genReCieveSpPdf', ['job_id' => $product['job_id'], 'print_barigan' => 'on']) }}">
        <button style="padding: 10px; " class="btn btn-secondary d-print-none">
            ปริ้นผ่าน Barigan PR-01W
        </button>
    </a>

    <script>
        window.onload = function() {
            var qr1 = qrcode(4, 'L');
            qr1.addData("https://line.me/R/ti/p/~{{ $store['line_id'] ?? '' }}");
            qr1.make();
            document.getElementById("line-qr").innerHTML = qr1.createImgTag(2, 2);

            var qr2 = qrcode(4, 'L');
            // qr2.addData("https://service-center.pumpkin-th.com");
            qr2.addData("https://line.me/R/ti/p/~@pkcs");
            qr2.make();
            document.getElementById("line-qr2").innerHTML = qr2.createImgTag(2, 2);

            JsBarcode("#barcode", "{{ $product['job_id'] }}", {
                height: 40,
                width: 2,
                fontSize: 14
            });
            JsBarcode("#barcode_customer", "{{ $product['job_id'] }}", {
                height: 40,
                width: 2,
                fontSize: 14
            });
            window.print();
        };
    </script>
</body>

</html>
