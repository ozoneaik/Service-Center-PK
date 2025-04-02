import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import kanitFont from "../../../../public/fonts/Kanit-Regular.ttf";

export default function TestPage() {
    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "A4"
        });

        // กำหนดฟอนต์
        doc.addFileToVFS("Kanit-Regular.ttf", kanitFont);
        doc.addFont("Kanit-Regular.ttf", "Kanit", "normal");
        doc.setFont("Kanit");

        // เพิ่มข้อความ
        doc.text("รายงานการรับสินค้า", 105, 20, { align: "center" });

        // เพิ่มข้อมูลตัวอย่าง
        doc.setFontSize(12);
        doc.text("วันที่: 2024-04-02", 14, 30);
        doc.text("ผู้รับสินค้า: นายสมชาย ใจดี", 14, 40);

        // ✅ เรียกใช้ autoTable โดยใส่ doc เป็นพารามิเตอร์แรก
        autoTable(doc, {
            startY: 50,
            head: [["ลำดับ", "ชื่อสินค้า", "จำนวน", "หน่วย"]],
            body: [
                [1, "สินค้า A", 10, "ชิ้น"],
                [2, "สินค้า B", 5, "กล่อง"],
            ],
        });

        // บันทึกไฟล์ PDF
        doc.save("ReceiveSpReport.pdf");
    };

    return (
        <div>
            <button onClick={generatePDF}>สร้าง PDF</button>
        </div>
    );
}
