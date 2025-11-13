import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Box,
    Button,
    Chip,
    Grid2,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Divider,
    useMediaQuery,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { TableStyle } from "@/../css/TableStyle.js";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import { Backdrop, CircularProgress } from "@mui/material";
import { AlertDialog } from "@/Components/AlertDialog";

const money = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function JobsListDetail({ job, job_detail = [], total_amount = 0 }) {
    const user = usePage().props.auth.user;
    const isMobile = useMediaQuery("(max-width:600px)");
    const [processing, setProcessing] = useState(false);

    const colorByStatus = (status) => {
        if (status === "complete") return "success";
        if (status === "Inactive") return "error";
        return "default";
    };

    const handleGeneratePDF_API = async () => {
        try {
            if (!job_detail.length) {
                AlertDialog({
                    title: "ไม่มีข้อมูล",
                    text: "ไม่มีรายการอะไหล่ในใบเบิกนี้",
                    icon: "warning",
                });
                return;
            }

            setProcessing(true);

            // เตรียมข้อมูลเอกสาร
            const soNumber = job.stock_job_id || `SO-${Date.now()}`;
            const storeName =
                user?.store_info?.shop_name || user?.name || "ไม่ระบุชื่อร้าน";
            const address = user?.store_info?.address || "สำนักงานใหญ่";
            const phone = user?.phone || "-";
            const currentDate = new Date().toLocaleDateString("th-TH");

            // สรุปยอดรวม
            const totalPrice = job_detail.reduce(
                (sum, sp) =>
                    sum +
                    Number(sp.sell_price || sp.stdprice_per_unit || 0) *
                    Number(sp.sp_qty || 0),
                0
            );
            const totalDiscount = job_detail.reduce(
                (sum, sp) =>
                    sum +
                    ((Number(sp.sell_price || sp.stdprice_per_unit || 0) *
                        Number(sp.sp_qty || 0) *
                        Number(sp.discount_percent || 0)) /
                        100),
                0
            );
            const netTotal = totalPrice - totalDiscount;

            // จัดโครงสร้างสินค้าแบบ groups สำหรับ PDF API
            const groups = [
                {
                    sku_code: "ALL",
                    list: job_detail.map((sp) => ({
                        sp_code: sp.sp_code,
                        sp_name: sp.sp_name,
                        sp_unit: sp.sp_unit,
                        qty: Number(sp.sp_qty || 0),
                        stdprice_per_unit: Number(sp.stdprice_per_unit || 0),
                        sell_price: Number(sp.sell_price || sp.stdprice_per_unit || 0),
                        discount_percent: Number(sp.discount_percent || 0),
                    })),
                },
            ];

            // Payload ส่งไป backend
            const payload = {
                so_number: soNumber,
                store_name: storeName,
                address,
                phone,
                date: currentDate,
                total_price: totalPrice.toFixed(2),
                discount: totalDiscount.toFixed(2),
                discount_percent:
                    job_detail.length > 0 ? job_detail[0].discount_percent || 0 : 0,
                net_total: netTotal.toFixed(2),
                groups,
            };

            console.log("📦 ส่ง payload ไป export.pdf:", payload);

            const res = await axios.post(route("orders.export.pdf"), payload);

            if (res?.data?.pdf_url) {
                AlertDialog({
                    title: "สำเร็จ",
                    text: "สร้างใบเบิก PDF สำเร็จ",
                    icon: "success",
                    timer: 1500,
                    onPassed: () => window.open(res.data.pdf_url, "_blank"),
                });
            } else {
                AlertDialog({
                    title: "ผิดพลาด",
                    text: res?.data?.message || "ไม่พบ URL ของไฟล์ PDF",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("❌ Error handleGeneratePDF_API:", error);
            AlertDialog({
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.message || error.message,
                icon: "error",
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`รายละเอียดใบเบิก ${job.stock_job_id}`} />

            <Grid2 container spacing={2} sx={{ p: 2 }}>
                {/* หัวข้อ */}
                <Grid2 size={12}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            รายละเอียดใบเบิกอะไหล่
                        </Typography>

                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<ArrowBack />}
                            onClick={() => router.get(route("withdrawJob.index"))}
                            sx={{ minWidth: 150 }}
                        >
                            กลับ
                        </Button>
                    </Stack>
                </Grid2>

                {/* ข้อมูล JOB */}
                <Grid2 size={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid2 container spacing={1}>
                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    เลขที่ JOB
                                </Typography>
                                <Typography fontWeight={600} color="primary">
                                    {job.stock_job_id}
                                </Typography>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    สถานะงาน
                                </Typography>
                                <Chip
                                    label={job.job_status}
                                    color={colorByStatus(job.job_status)}
                                    size="small"
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ผู้สร้างเอกสาร
                                </Typography>
                                <Typography fontWeight={600}>
                                    {job.user_name || "-"}
                                </Typography>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    วันที่สร้าง
                                </Typography>
                                <Typography fontWeight={500}>
                                    <DateFormatTh date={job.created_at} showTime={true} />
                                </Typography>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ประเภทเอกสาร
                                </Typography>
                                <Typography fontWeight={500}>
                                    {job.type || "เบิก"}
                                </Typography>
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>

                {/* ตารางรายการอะไหล่ */}
                {/* ตารางรายการอะไหล่ */}
                <Grid2 size={12}>
                    <Paper variant="outlined" sx={{ p: 2, overflowX: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={TableStyle.TableHead}>
                                    <TableCell align="center" width="5%">#</TableCell>
                                    <TableCell width="15%">รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่ออะไหล่</TableCell>
                                    <TableCell align="center" width="8%">หน่วย</TableCell>
                                    <TableCell align="center" width="8%">จำนวน</TableCell>
                                    <TableCell align="center" width="10%">ราคาตั้ง (฿)</TableCell>
                                    <TableCell align="center" width="10%">ราคาขาย (฿)</TableCell>
                                    <TableCell align="center" width="8%">ส่วนลด (%)</TableCell>
                                    <TableCell align="center" width="10%">ยอดสุทธิ (฿)</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {job_detail.length > 0 ? (
                                    job_detail.map((sp, i) => {
                                        const qty = Number(sp.sp_qty || 0);
                                        const stdPrice = Number(sp.stdprice_per_unit || 0);
                                        const sellPrice = Number(sp.sell_price || stdPrice);
                                        const discountPercent = Number(sp.discount_percent || 0);
                                        const discountAmount = (sellPrice * qty * discountPercent) / 100;
                                        const netTotal = sellPrice * qty - discountAmount;

                                        return (
                                            <TableRow key={i} hover>
                                                <TableCell align="center">{i + 1}</TableCell>
                                                <TableCell>{sp.sp_code}</TableCell>
                                                <TableCell>{sp.sp_name}</TableCell>
                                                <TableCell align="center">{sp.sp_unit}</TableCell>
                                                <TableCell align="center">{qty}</TableCell>
                                                <TableCell align="center">฿{money(stdPrice)}</TableCell>
                                                <TableCell align="center">฿{money(sellPrice)}</TableCell>
                                                <TableCell align="center">
                                                    {discountPercent > 0 ? `${discountPercent}%` : "-"}
                                                </TableCell>
                                                <TableCell align="center">฿{money(netTotal)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            ไม่พบรายการอะไหล่
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* ยอดรวมทั้งหมด */}
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" justifyContent="flex-end">
                            <Stack alignItems="flex-end" spacing={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                    ยอดรวมก่อนส่วนลด: ฿
                                    {money(
                                        job_detail.reduce(
                                            (sum, sp) =>
                                                sum + Number(sp.sell_price || sp.stdprice_per_unit || 0) * Number(sp.sp_qty || 0),
                                            0
                                        )
                                    )}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ส่วนลดรวม: ฿
                                    {money(
                                        job_detail.reduce(
                                            (sum, sp) =>
                                                sum +
                                                ((Number(sp.sell_price || sp.stdprice_per_unit || 0) *
                                                    Number(sp.sp_qty || 0) *
                                                    Number(sp.discount_percent || 0)) /
                                                    100),
                                            0
                                        )
                                    )}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    ยอดสุทธิทั้งหมด: ฿{money(total_amount)}
                                </Typography>

                                <Button
                                    variant="contained"
                                    color="info"
                                    onClick={handleGeneratePDF_API}
                                    disabled={processing}
                                    // disabled
                                    sx={{
                                        width: 200,
                                        bgcolor: "#0288D1",
                                        "&:hover": { bgcolor: "#0277BD" },
                                        mt: 2,
                                    }}
                                >
                                    {processing ? "กำลังสร้าง..." : "ส่งออกใบเบิก PDF"}
                                </Button>

                                <Backdrop
                                    open={processing}
                                    sx={{
                                        color: "#fff",
                                        zIndex: (theme) => theme.zIndex.drawer + 1000,
                                        backdropFilter: "blur(3px)",
                                    }}
                                >
                                    <Stack alignItems="center" spacing={2}>
                                        <CircularProgress color="inherit" size={60} thickness={4} />
                                        <Typography variant="h6" fontWeight="bold">
                                            กำลังสร้างใบเบิกอะไหล่...
                                        </Typography>
                                    </Stack>
                                </Backdrop>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid2>
            </Grid2>
        </AuthenticatedLayout>
    );
}
