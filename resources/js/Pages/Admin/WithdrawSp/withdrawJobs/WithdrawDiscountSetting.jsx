import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Save } from "@mui/icons-material";
import { AlertDialog } from "@/Components/AlertDialog";

export default function WithdrawDiscountSetting() {
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem("withdraw_discount_percent");
        if (saved) setDiscount(Number(saved));
    }, []);

    const handleSave = () => {
        if (discount < 0 || discount > 100) {
            AlertDialog({
                title: "แจ้งเตือน",
                text: "กรุณากรอกค่าระหว่าง 0 - 100",
                icon: "warning",
            });
            return;
        }

        AlertDialog({
            title: "ยืนยันการบันทึก",
            text: `คุณต้องการบันทึกส่วนลดการเบิก ${discount}% หรือไม่ ?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "บันทึก",
            cancelButtonText: "ยกเลิก",
            onPassed: (confirm) => {
                if (confirm) {
                    localStorage.setItem("withdraw_discount_percent", discount);

                    AlertDialog({
                        title: "สำเร็จ",
                        text: `บันทึกส่วนลดการเบิก ${discount}% เรียบร้อยแล้ว`,
                        icon: "success",
                        timer: 1500,
                    });
                }
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="ตั้งค่าส่วนลดการเบิก %" />

            <Box sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    ตั้งค่าส่วนลดการเบิก
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        label="ส่วนลด (%)"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        inputProps={{ min: 0, max: 100 }}
                    />
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<Save />}
                        onClick={handleSave}
                    >
                        บันทึก
                    </Button>
                </Stack>
            </Box>
        </AuthenticatedLayout>
    );
}