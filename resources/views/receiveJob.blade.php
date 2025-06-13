<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>ใบรับงานซ่อม</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"></script>
    <style>
        body {
            font-family: "TH Sarabun New", sans-serif;
            font-size: 25px;
            line-height: 1.4;
            margin-top: 100px;
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
            margin: 10px 0;
        }

        .section {
            margin-bottom: 10px;
        }

        #barcode,#barcode_customer {
            display: block;
            width: 100%;
            height: auto;
            max-width: 100%;
        }

        .qc-code {
            display: block;
           max-width: 100px;
            height: auto;
            justify-content : center;
            margin: 0 auto;
        }

        .label {

            font-weight: bold;
            display: inline-block;
            min-width: 120px; /* เพื่อให้ข้อความหลัง label ไม่เบียด */
            vertical-align: top;
        }

        @media print {
            body {
                width: 80mm;
            }
            .cut-page {
                page-break-after: always;
            }
        }
    </style>

</head>
<body>
<div class="center">
    <h2>ศูนย์บริการ PCS</h2>
</div>

<div class="section">
    <div><span class="label">ชื่อร้าน:</span> มานีการช่าง</div>
    <div><span class="label">เบอร์โทรศัพท์:</span> 0931622330</div>
</div>

<div class="divider"></div>

<svg id="barcode"></svg>

<div class="divider"></div>


<div class="section">
    <div><span class="label">วันที่:</span> {{\Carbon\Carbon::now()}}</div>
    <div><span class="label">ชื่อลูกค้า:</span> ออฟ</div>
    <div><span class="label">เบอร์โทรติดต่อ:</span> 0931622330</div>
    <div><span class="label">S/N:</span> 41641645361231</div>
    <div>
        <span class="label">รหัสและชื่อสินค้า:</span> (50277) J-Series เครื่องเจียรมือ 4" 1100W สวิตซ์ท้าย J-G1100W
    </div>
    <div><span class="label">อาการ:</span> อาการเสีย</div>
    <div><span class="label">พนักงานผู้รับงานซ่อม:</span> ออฟ</div>
    <div><span class="label">อุปกรณ์เสริม:</span> เรื่อย</div>
    <div><span class="label">หมายเหตุลูกค้า:</span> ลูกค้าอยากกินหนม</div>
    <div><span class="label">หมายเหตุในศูนย์ซ่อม:</span> ลุกค้าอยากซ่อมเพราะ</div>
</div>

<div class="divider"></div>

<div class="section center">
    <img class="qc-code" src="{{ URL::asset('line_qr_code.jpg') }}" alt="ไม่มีรูป">
    <div>@line : ศูนย์ซ่อม pumpkin</div>
</div>

<div class="divider"></div>

<div class="section center">
    เอกสารนี้เป็นหลักฐานการรับสินค้าเพื่อส่งซ่อม<br>
    กรุณาเก็บไว้เพื่อยืนยันตัวตน
</div>

<div class="cut-page"></div>

<div class="divider"></div>
<div class="center">
    <h2>ศูนย์บริการ PCS</h2>
    <h2>สำหรับลูกค้า</h2>
</div>

<div class="section">
    <div><span class="label">ชื่อร้าน:</span> มานีการช่าง</div>
    <div><span class="label">เบอร์โทรศัพท์:</span> 0931622330</div>
</div>

<div class="divider"></div>

<svg id="barcode_customer"></svg>

<div class="divider"></div>

<div class="section">
    <div><span class="label">วันที่:</span> {{\Carbon\Carbon::now()}}</div>
    <div><span class="label">S/N:</span> 41641645361231</div>
    <div>
        <span class="label">รหัสและชื่อสินค้า:</span> (50277) J-Series เครื่องเจียรมือ 4" 1100W สวิตซ์ท้าย J-G1100W
    </div>
    <div><span class="label">อาการ:</span> อาการเสีย</div>
    <div><span class="label">พนักงานผู้รับงานซ่อม:</span> ออฟ</div>
    <div><span class="label">อุปกรณ์เสริม:</span> เรื่อย</div>
    <div><span class="label">หมายเหตุลูกค้า:</span> ลูกค้าอยากกินหนม</div>
</div>
<div class="divider"></div>

<div class="section center">
    <img class="qc-code" src="{{ URL::asset('line_qr_code.jpg') }}" alt="ไม่มีรูป">
    <div>@line : ศูนย์ซ่อม pumpkin</div>
</div>

<div class="divider"></div>

<div class="section center">
    เอกสารนี้เป็นหลักฐานการรับสินค้าเพื่อส่งซ่อม<br>
    กรุณาเก็บไว้เพื่อยืนยันตัวตน
</div>

<script>
    JsBarcode("#barcode", "JOB-12164653216");
    JsBarcode("#barcode_customer", "JOB-12164653216");
</script>
</body>
</html>
