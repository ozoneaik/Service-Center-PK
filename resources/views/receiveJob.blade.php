<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"></script>
    <title>Print Form</title>
    <style>
        /* ซ่อนทุกอย่างที่ไม่ใช่สิ่งที่เราต้องการปริ้น */
        @media print {
            body * {
                visibility: hidden;
            }
            #whatToPrint, #whatToPrint * {
                visibility: visible;
            }
            #whatToPrint {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
        }

        /* ตกแต่งให้ดูดีในโหมดแสดง */
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        #whatToPrint {
            width: 500px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #333;
            background-color: #f9f9f9;
        }

        button {
            margin-top: 20px;
        }
    </style>
</head>
<body>

<div id="whatToPrint">
    <p>Hi</p>
    <h1>This should show up in my pdf</h1>
    <svg id="barcode"></svg>
</div>

<!-- ปุ่มสำหรับสั่งพิมพ์ -->
<button onclick="window.print()">พิมพ์เอกสาร</button>


<script>
    JsBarcode("#barcode", "JOB-1749201869CIS-C");
</script>
</body>
</html>
