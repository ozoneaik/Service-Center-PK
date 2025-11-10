import React from "react";
import { Head, router } from "@inertiajs/react";
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

const money = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function JobsListDetail({ job, job_detail = [], total_amount = 0 }) {
    const isMobile = useMediaQuery("(max-width:600px)");

    const colorByStatus = (status) => {
        if (status === "complete") return "success";
        if (status === "Inactive") return "error";
        return "default";
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
                            </Stack>
                        </Box>
                    </Paper>
                </Grid2>
            </Grid2>
        </AuthenticatedLayout>
    );
}
