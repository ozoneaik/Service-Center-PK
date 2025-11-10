import React from "react";
import WithdrawList from "./WithdrawList.jsx";

export default function Index(pageProps) {
    // ส่ง Inertia props ทั้งหมดต่อให้ WithdrawList (เช่น sku, result, message ฯลฯ)
    return <WithdrawList {...pageProps} />;
}