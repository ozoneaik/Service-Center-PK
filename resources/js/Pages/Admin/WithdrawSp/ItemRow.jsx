import React from "react";
import { Box, Button, Stack, TableCell, TableRow, Typography } from "@mui/material";
import { AlertDialog } from "@/Components/AlertDialog";
import axios from "axios";
import { showDefaultImage } from "@/utils/showImage.js";

const money = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function ItemRow({ index, item, group, discountPercent, outOfStockList = [], onRemove }) {
    const [editMode, setEditMode] = React.useState(false);
    const [editQty, setEditQty] = React.useState(item.qty || 0);
    const [editPrice, setEditPrice] = React.useState(item.sell_price || item.stdprice_per_unit || 0);

    const handleSave = async () => {
        try {
            const res = await axios.get(route("withdrawJob.checkStock"), {
                params: { sp_code: item.sp_code },
            });
            const stock = res.data?.stock_balance ?? 0;

            if (editQty > stock) {
                AlertDialog({
                    title: "สต็อกไม่เพียงพอ",
                    text: `คงเหลือ ${stock} ชิ้น แต่ต้องการ ${editQty} ชิ้น`,
                    icon: "error",
                });
                return;
            }

            item.qty = editQty;
            item.sell_price = editPrice;
            setEditMode(false);

            AlertDialog({
                title: "บันทึกสำเร็จ",
                text: `อัปเดตจำนวน ${item.sp_code} เป็น ${editQty} ชิ้นเรียบร้อยแล้ว`,
                icon: "success",
                timer: 1000,
            });
        } catch (err) {
            AlertDialog({
                title: "เกิดข้อผิดพลาด",
                text: err?.response?.data?.message || err.message,
                icon: "error",
            });
        }
    };

    const handleCancel = () => {
        setEditQty(item.qty || 0);
        setEditPrice(item.sell_price || item.stdprice_per_unit || 0);
        setEditMode(false);
    };

    const img = item.path_file ||
        (import.meta.env.VITE_IMAGE_SP || "https://images.pumpkin.tools/SKUS/SP/offn/") +
        (item.sp_code || "default") + ".jpg";

    const total = editQty * editPrice;
    const discounted = total * (1 - discountPercent / 100);

    return (
        <TableRow
            hover
            sx={{
                bgcolor: outOfStockList.includes(item.sp_code)
                    ? "rgba(255, 99, 71, 0.15)"
                    : "inherit",
            }}
        >
            <TableCell align="center">{index + 1}</TableCell>
            <TableCell align="center">
                <Box
                    component="img"
                    src={img}
                    alt={item.sp_name}
                    onError={showDefaultImage}
                    sx={{ width: 64, height: 64, borderRadius: 1, border: "1px solid #ddd", objectFit: "cover" }}
                />
            </TableCell>
            <TableCell>
                <Typography fontWeight={600}>{item.sp_code}</Typography>
                <Typography color="text.secondary">{item.sp_name}</Typography>
            </TableCell>
            <TableCell align="center">{item.sp_unit}</TableCell>
            <TableCell align="center">{item.stock_balance ?? 0}</TableCell>
            <TableCell align="center">฿{money(item.stdprice_per_unit ?? 0)}</TableCell>

            <TableCell align="center">
                {editMode ? (
                    <input
                        type="number"
                        min="1"
                        value={editQty}
                        onChange={(e) => setEditQty(Number(e.target.value))}
                        style={{ width: 60, textAlign: "center" }}
                    />
                ) : (
                    item.qty
                )}
            </TableCell>

            <TableCell align="center">
                {editMode ? (
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        readOnly
                        value={editPrice}
                        style={{ width: 80, textAlign: "center", backgroundColor: "#f9f9f9" }}
                    />
                ) : (
                    `฿${money(item.sell_price ?? item.stdprice_per_unit ?? 0)}`
                )}
            </TableCell>

            <TableCell align="center">฿{money(total)}</TableCell>
            <TableCell align="center">{discountPercent > 0 ? `${discountPercent}%` : "-"}</TableCell>
            <TableCell align="center">฿{money(discounted)}</TableCell>

            <TableCell align="center">
                {editMode ? (
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Button size="small" color="success" variant="contained" onClick={handleSave}>บันทึก</Button>
                        <Button size="small" color="error" variant="outlined" onClick={handleCancel}>ยกเลิก</Button>
                    </Stack>
                ) : (
                    <Button size="small" variant="contained" color="primary" onClick={() => setEditMode(true)}>แก้ไข</Button>
                )}
            </TableCell>

            <TableCell align="center">
                <Button size="small" color="error" variant="outlined" onClick={() => onRemove(group, item)}>
                    ลบ
                </Button>
            </TableCell>
        </TableRow>
    );
}
