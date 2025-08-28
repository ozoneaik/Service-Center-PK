import React from "react";

export default function MaintenanceBanner({ notification }) {
    if (!notification) return null;

    // แปลงวันที่เป็นรูปแบบไทย
    const formatDateThai = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const message = `⚠️ แจ้งเตือน: ${notification.message || "ระบบศูนย์ซ่อมกำลังปรับปรุง"} ตั้งแต่วันที่ ${formatDateThai(notification.date)} ถึง ${formatDateThai(notification.end_date)} — ขออภัยในความไม่สะดวก ⚠️⚠️ แจ้งเตือน: ${notification.message || "ระบบศูนย์ซ่อมกำลังปรับปรุง"} ตั้งแต่วันที่ ${formatDateThai(notification.date)} ถึง ${formatDateThai(notification.end_date)} — ขออภัยในความไม่สะดวก ⚠️`;

    return (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-2 z-50 shadow-md overflow-hidden">
            <marquee behavior="scroll" direction="left" scrollamount="6">
                {message}
            </marquee>
        </div>
    );
}
