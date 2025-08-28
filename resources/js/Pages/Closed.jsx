import MaintenanceBanner from "@/Layouts/ClosedBar";
import React, { useState, useEffect } from "react";

export default function MaintenanceOverlay() {
    const [show, setShow] = useState(true);
    const [notification, setNotification] = useState(null);

    // โหลด notification ล่าสุด
    useEffect(() => {
        fetch("/admin/config/notifications/list")
            .then((res) => res.json())
            .then((res) => {
                if (res.status && res.data.length > 0) {
                    const latest = res.data.find(item => item.status === "in_progress") || res.data[0];
                    setNotification(latest);
                }
            })
            .catch((err) => console.error("Error loading notifications:", err));
    }, []);

    if (!show || !notification) return null;

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <MaintenanceBanner notification={notification} />
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center">
                <h2 className="text-2xl font-extrabold mb-4 text-gray-800">
                    {notification.title || "แจ้งเตือนระบบ ⚠️"}
                </h2>

                <p className="text-gray-700 mb-6">
                    {notification.message || "มีการปรับปรุงระบบ"} <br />
                    {(notification.date && notification.end_date) && (
                        <span className="block mt-2 font-medium text-gray-800">
                            ตั้งแต่วันที่ {formatDateThai(notification.date)}
                            ถึง {formatDateThai(notification.end_date)}
                        </span>
                    )}
                </p>

                <button
                    onClick={() => setShow(false)}
                    className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition duration-200"
                >
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    );
}
