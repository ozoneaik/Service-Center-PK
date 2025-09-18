import { Info } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import React from "react";

export default function StpTooltip() {
    return (
        <Tooltip
            title={
                <React.Fragment>
                    <p style={{ fontSize: 20 }}>Info</p>
                    <p style={{ fontSize: 20 }}>กรณีที่สินค้ารายการนั้นยังไม่เคยปรับปรุงสต๊อก แต่มีการเลือกอะไหล่เข้ามาในประวัติซ่อม</p>
                    <p style={{ fontSize: 20 }}>ระบบจะทำการเพิ่มให้ในหน้าจัดการสต๊อกอัตโนมัติ</p>
                    <p style={{ fontSize: 20 }}>และจะถูกระบุเป็นตัวเลขติดลบ (-)</p>
                    <p style={{ fontSize: 20 }}>สต๊อกคงเหลือ = สต๊อกรวม-แจ้งซ่อม-แจ้งปรับปรุง (ขาลบ)</p>
                </React.Fragment>
            }
        >
            <IconButton size="small">
                <Info />
            </IconButton>
        </Tooltip>
    )
}