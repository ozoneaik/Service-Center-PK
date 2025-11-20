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
    Backdrop,
    CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { TableStyle } from "@/../css/TableStyle.js";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import Swal from "sweetalert2";
import WithdrawEditModal from "../components/WithdrawEditModal";

const money = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function JobsListDetail({ job, job_detail = [], total_amount = 0, discount_percent, out_of_stock_list = [], auto_job }) {
    const user = usePage().props.auth.user;
    const isMobile = useMediaQuery("(max-width:600px)");
    const [processing, setProcessing] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [detailData, setDetailData] = useState(job_detail);
    const [searchResult, setSearchResult] = useState(null);
    const [jobDiscount, setJobDiscount] = useState(discount_percent ?? 0);
    // const [outOfStockRows, setOutOfStockRows] = useState([]);
    const [outOfStockRows, setOutOfStockRows] = useState(out_of_stock_list);
    const handleSearchResult = (result) => {
        console.log("ผลลัพธ์ได้รับจาก modal", result);
        setSearchResult(result);
    };


    const calcTotal = () => {
        return detailData.reduce((sum, sp) => {
            const qty = Number(sp.sp_qty || 0);
            const price = Number(sp.sell_price || sp.stdprice_per_unit || 0);
            const discount = Number(sp.discount_percent || 0);

            const net = qty * price - (qty * price * discount) / 100;

            return sum + net;
        }, 0);
    };

    const handleQtyChange = (index, newQty) => {
        setDetailData((prev) => {
            const updated = [...prev];
            updated[index].sp_qty = Number(newQty);
            return updated;
        });
    };

    // บันทึกจำนวนเฉพาะแถว
    const handleUpdateDetail = async (sp, index) => {
        const newQty = Number(detailData[index].sp_qty);
        if(newQty || newQty <= 0){
            Swal.fire({
                icon: "warning",
                title: "แจ้งเตือน",
                text: "จํานวนไม่สามารถเป็น 0 หรือติดลบได้",
            });
            return
        }

        try {
            setProcessing(true);

            const payload = {
                job_id: job.stock_job_id,
                sp_code: sp.sp_code,
                sp_qty: Number(detailData[index].sp_qty),
                // discount_percent: Number(sp.discount_percent || 0),
                discount_percent: Number(jobDiscount),

            };

            await axios.post(route("withdrawJob.updateDetail"), payload);

            Swal.fire({
                icon: "success",
                title: "อัปเดตสำเร็จ",
                text: `แก้ไขจำนวน ${sp.sp_code} เป็น ${payload.sp_qty} สำเร็จ`,
                timer: 1200,
                showConfirmButton: false,
            });

            // ⬇ โหลดข้อมูลจาก server ใหม่ทันที
            router.visit(route("withdrawJob.show", job.stock_job_id), {
                preserveScroll: true,
            });

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "ผิดพลาด",
                text: err.response?.data?.message || err.message,
            });
        } finally {
            setProcessing(false);
        }
    };

    // สีสถานะ
    const colorByStatus = (status) => {
        if (status === "complete") return "success";
        if (status === "deleted") return "warning";
        if (status === "processing") return "info";
        return "default";
    };

    // ส่งออก PDF
    const handleGeneratePDF_API = async () => {
        try {
            if (!detailData.length) {
                Swal.fire({
                    icon: "warning",
                    title: "ไม่มีข้อมูล",
                    text: "ไม่พบรายการอะไหล่",
                });
                return;
            }

            setProcessing(true);

            const totalPrice = detailData.reduce(
                (sum, sp) =>
                    sum +
                    Number(sp.sell_price || sp.stdprice_per_unit || 0) *
                    Number(sp.sp_qty || 0),
                0
            );

            const totalDiscount = detailData.reduce(
                (sum, sp) =>
                    sum +
                    ((Number(sp.sell_price || sp.stdprice_per_unit || 0) *
                        Number(sp.sp_qty || 0) *
                        Number(sp.discount_percent || 0)) / 100),
                0
            );

            const netTotal = totalPrice - totalDiscount;

            const payload = {
                so_number: job.stock_job_id,
                store_name: user?.store_info?.shop_name || user?.name || "-",
                address: user?.store_info?.address || "-",
                phone: user?.phone || "-",
                date: new Date().toLocaleDateString("th-TH"),
                total_price: totalPrice.toFixed(2),
                discount: totalDiscount.toFixed(2),
                discount_percent: detailData[0]?.discount_percent || 0,
                net_total: netTotal.toFixed(2),
                groups: [
                    {
                        sku_code: "ALL",
                        list: detailData.map((sp) => ({
                            sp_code: sp.sp_code,
                            sp_name: sp.sp_name,
                            sp_unit: sp.sp_unit,
                            qty: Number(sp.sp_qty || 0),
                            stdprice_per_unit: Number(sp.stdprice_per_unit || 0),
                            sell_price: Number(sp.sell_price || sp.stdprice_per_unit || 0),
                            // discount_percent: Number(sp.discount_percent || 0),
                            discount_percent: Number(jobDiscount),
                        })),
                    },
                ],
            };

            const res = await axios.post(route("orders.export.pdf_withdraw"), payload);

            if (res.data.pdf_url) {
                Swal.fire({
                    icon: "success",
                    title: "สร้างเอกสารสำเร็จ",
                    text: "เปิดไฟล์ PDF",
                    timer: 1200,
                    showConfirmButton: false,
                });
                window.open(res.data.pdf_url, "_blank");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: "ไม่พบ URL ของ PDF",
                });
            }

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "ผิดพลาด",
                text: error.response?.data?.message || error.message,
            });
        } finally {
            setProcessing(false);
        }
    };

    // ปิดงาน (ตัดสต๊อก)
    const handleCompleteJob = async () => {
        Swal.fire({
            title: "ยืนยันการปิดงาน?",
            text: "ระบบจะตัดสต๊อคทันทีหลังปิดงาน",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ปิดงาน",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                setProcessing(true);

                const res = await axios.post(
                    route("withdrawJob.complete", job.stock_job_id)
                );

                if (res.data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "สำเร็จ",
                        text: "ปิดงานเรียบร้อย",
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    router.get(route("withdrawJob.show", job.stock_job_id));
                    return;
                }

            } catch (error) {
                // if (error.response?.status === 422 && error.response.data.stock_error) {
                //     setOutOfStockRows(error.response.data.details.map(d => d.sp_code));

                //     let msg = "";

                //     error.response.data.details.forEach((item) => {
                //         msg += `• ${item.sp_code} ${item.sp_name} ต้องการ ${item.need} มี ${item.have}<br>`;
                //     });

                //     Swal.fire({
                //         icon: "error",
                //         title: "สต๊อคไม่พอ",
                //         html: msg,
                //     });
                //     return;
                // }
                // if (error.response?.status === 422 && error.response.data.stock_error) {

                //     setOutOfStockRows(error.response.data.details.map(d => d.sp_code));

                //     // let msg = "สต๊อคไม่พอ<br>";
                //     let msg = "";

                //     error.response.data.details.forEach((item) => {
                //         msg += `• ${item.sp_code} ${item.sp_name} ต้องการ ${item.need} มี ${item.have}<br>`;
                //     });

                //     msg += `<br>เอกสารปรับปรุงสต๊อก (auto)<br>`;
                //     msg += `เลขที่ <b>${error.response.data.new_stock_job_id}</b>`;

                //     Swal.fire({
                //         icon: "error",
                //         title: "สต๊อคไม่พอ",
                //         html: msg,
                //         confirmButtonText: "ตกลง"
                //     })
                //         .then(() => {
                //             router.reload({ preserveScroll: true });
                //             // router.get(route("stockJob.detailReadonly", {
                //             //     stock_job_id: error.response.data.new_stock_job_id
                //             // }));
                //         });

                //     return;
                // }

                if (error.response?.status === 422 && error.response.data.stock_error) {

                    const list = error.response.data.details;
                    const newJob = error.response.data.new_stock_job_id;

                    // สร้าง HTML สำหรับ Swal
                    let html = `
        <div style="text-align:center; font-size:18px; font-weight:bold; margin-bottom:10px;">
            สต๊อคไม่พอ ${list.length} รายการ
        </div>
        <br>
        <div style="text-align:left; font-size:16px; line-height:1.7;">
    `;

                    list.forEach(item => {
                        html += `
            <div>
                ${item.sp_code} ${item.sp_name}
                <span style="color:red; font-weight:bold;"> (ขาด ${item.need - item.have})</span>
            </div>
        `;
                    });

                    html += `
        </div>
        <br>
        <div style="text-align:center; font-size:16px; font-weight:bold; margin-top:10px;">
            เอกสารปรับปรุง (auto)
        </div>
        <div style="text-align:center; font-size:18px; color:#1976d2; font-weight:bold;">
            ${newJob}
        </div>
    `;

                    Swal.fire({
                        icon: "error",
                        html: html,
                        confirmButtonText: "ตกลง"
                    }).then(() => {
                        router.reload({ preserveScroll: true });
                    });

                    return;
                }

                Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: error.response?.data?.message || error.message,
                });
            } finally {
                setProcessing(false);
            }
        });
    };

    // ลบเอกสาร
    const handleDeleteJob = () => {
        Swal.fire({
            title: "ยืนยันการลบเอกสาร?",
            text: "หลังลบแล้วจะไม่สามารถกู้คืนได้",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบเอกสาร",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                setProcessing(true);

                const res = await axios.post(
                    route("withdrawJob.delete", job.stock_job_id)
                );

                Swal.fire({
                    icon: "success",
                    title: "ลบสำเร็จ",
                    text: "เอกสารถูกลบแล้ว",
                    timer: 1500,
                    showConfirmButton: false,
                });

                router.get(route("withdrawJob.index"));

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: error.response?.data?.message || error.message,
                });
            } finally {
                setProcessing(false);
            }
        });
    };

    const handleCancelEdit = () => {
        Swal.fire({
            title: "ออกจากโหมดแก้ไข?",
            text: "หากยังไม่ได้บันทึก การแก้ไขทั้งหมดจะถูกยกเลิก",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "กลับ",
        }).then((result) => {
            if (!result.isConfirmed) return;

            setIsEditing(false);

            Swal.fire({
                icon: "info",
                title: "แก้ไขสำเร็จ",
                text: "โหลดข้อมูลล่าสุด...",
                timer: 800,
                showConfirmButton: false,
            });

            router.visit(route("withdrawJob.show", job.stock_job_id), {
                preserveScroll: true,
            });
        });
    };

    const handleDeleteDetail = async (sp_code) => {
        Swal.fire({
            title: "ลบรายการอะไหล่?",
            text: `คุณต้องการลบ ${sp_code} ออกจากใบเบิกหรือไม่`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                setProcessing(true);

                const res = await axios.post(route("withdrawJob.deleteDetail"), {
                    job_id: job.stock_job_id,
                    sp_code: sp_code,
                });

                if (res.data.success) {
                    // ลบออกจาก state
                    setDetailData((prev) =>
                        prev.filter((item) => item.sp_code !== sp_code)
                    );

                    Swal.fire({
                        icon: "success",
                        title: "ลบสำเร็จ",
                        timer: 1200,
                        showConfirmButton: false,
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: err.response?.data?.message || err.message,
                });
            } finally {
                setProcessing(false);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`รายละเอียดใบเบิก ${job.stock_job_id}`} />

            <Grid2 container spacing={2} sx={{ p: 2 }}>

                {/* HEADER */}
                <Grid2 size={12}>
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        spacing={2}
                        alignItems={isMobile ? "stretch" : "center"}
                    // justifyContent="space-between"
                    >
                        <Button fullWidth={isMobile}
                            variant="contained"
                            color="warning"
                            startIcon={<ArrowBack />}
                            // onClick={() => router.get(route("withdrawJob.index"))}
                            onClick={() => {
                                window.location.href = route("withdrawJob.index");
                            }}
                        >
                            กลับ
                        </Button>
                        <Typography variant="h6" fontWeight="bold" sx={{ textAlign: isMobile ? "center" : "left" }}>
                            รายละเอียดใบเบิกอะไหล่
                        </Typography>

                        <Stack
                            direction={isMobile ? "column" : "row"}
                            spacing={2}
                            width={isMobile ? "100%" : "auto"}
                        >
                        </Stack>
                    </Stack>
                </Grid2>

                {/* JOB INFO */}
                <Grid2 size={12} >
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid2 size={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    gap: 2,
                                }}
                            >
                                {/* เลขที่ JOB */}
                                <Box sx={{ width: { xs: "100%", md: "23%" } }}>
                                    <Typography variant="body2">เลขที่ JOB</Typography>
                                    <Typography fontWeight={600}>{job.stock_job_id}</Typography>
                                </Box>

                                {/* เอกสารเบิก Auto */}
                                {auto_job && (
                                    <Box sx={{ width: { xs: "100%", md: "23%" } }}>
                                        <Typography variant="body2" color="error">
                                            เอกสารเบิก (Auto)
                                        </Typography>

                                        <Typography
                                            fontWeight={600}
                                            color="error"
                                            sx={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() =>
                                                router.get(
                                                    route("stockJob.detailReadonly", {
                                                        stock_job_id: auto_job.stock_job_id,
                                                    })
                                                )
                                            }
                                        >
                                            {auto_job.stock_job_id}
                                        </Typography>
                                    </Box>
                                )}

                                {/* สถานะงาน */}
                                <Box sx={{ width: { xs: "100%", md: "23%" } }}>
                                    <Typography variant="body2">สถานะงาน</Typography>
                                    <Chip
                                        label={job.job_status}
                                        color={colorByStatus(job.job_status)}
                                        size="small"
                                    />
                                </Box>

                                {/* ผู้สร้าง */}
                                <Box sx={{ width: { xs: "100%", md: "23%" } }}>
                                    <Typography variant="body2">ผู้สร้าง</Typography>
                                    <Typography fontWeight={600}>{job.user_name}</Typography>
                                </Box>
                            </Box>
                        </Grid2>
                    </Paper>
                </Grid2>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        // mb: 2,
                        width: "100%",
                        gap: 1,
                    }}
                >
                    <Typography variant="body2" fontWeight={600}>
                        ส่วนลด (%):
                    </Typography>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={jobDiscount}
                        disabled={!isEditing}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setJobDiscount(val);

                            setDetailData(prev =>
                                prev.map(item => ({
                                    ...item,
                                    discount_percent: val,
                                }))
                            );
                        }}
                        style={{
                            width: 70,
                            textAlign: "center",
                            padding: "4px",
                            border: "1px solid #ccc",
                            borderRadius: 4,
                            backgroundColor: !isEditing ? "#eee" : "white",
                        }}
                    />
                </Box>

                {/* TABLE */}
                <Grid2 size={12}>
                    <Paper variant="outlined" sx={{ p: 0, overflowX: "auto", overflowY: "auto", maxHeight: "65vh", }}>

                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={TableStyle.TableHead}>
                                    <TableCell>#</TableCell>
                                    <TableCell>รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่อ</TableCell>
                                    <TableCell align="center">หน่วย</TableCell>
                                    <TableCell align="center">จำนวน</TableCell>
                                    <TableCell align="center">ราคาตั้ง</TableCell>
                                    {/* <TableCell align="center">ราคาขาย</TableCell> */}
                                    <TableCell align="center">ส่วนลด</TableCell>
                                    <TableCell align="center">ยอดสุทธิ</TableCell>
                                    {isEditing && (
                                        <TableCell align="center">บันทึก</TableCell>
                                    )}
                                    {isEditing && <TableCell align="center">ลบ</TableCell>}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {detailData.map((sp, i) => {
                                    const qty = Number(sp.sp_qty || 0);
                                    const stdPrice = Number(sp.stdprice_per_unit || 0);
                                    const sellPrice = Number(sp.sell_price || stdPrice);
                                    // const discountPercent = Number(sp.discount_percent || 0);
                                    const discountPercent = Number(jobDiscount);
                                    const net =
                                        qty * sellPrice -
                                        (sellPrice * qty * discountPercent) / 100;

                                    return (
                                        <TableRow key={i}
                                            hover
                                            sx={{
                                                backgroundColor: outOfStockRows.includes(sp.sp_code)
                                                    ? "rgba(255, 0, 0, 0.15)"   // สีแดงอ่อน
                                                    : "inherit"
                                            }}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>{sp.sp_code}</TableCell>
                                            <TableCell>{sp.sp_name}</TableCell>
                                            <TableCell align="center">{sp.sp_unit}</TableCell>

                                            {/* จำนวน */}
                                            <TableCell align="center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={sp.sp_qty}
                                                    disabled={!isEditing}
                                                    onChange={(e) =>
                                                        handleQtyChange(i, e.target.value)
                                                    }
                                                    style={{
                                                        width: 70,
                                                        padding: 4,
                                                        textAlign: "center",
                                                        backgroundColor: !isEditing
                                                            ? "#eee"
                                                            : "white",
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">฿{money(stdPrice)}</TableCell>
                                            {/* <TableCell align="center">฿{money(sellPrice)}</TableCell> */}
                                            <TableCell align="center">
                                                {/* {isNaN(discountPercent) ? "-" : `${discountPercent}%`} */}
                                                {jobDiscount}%
                                            </TableCell>
                                            <TableCell align="center">฿{money(net)}</TableCell>

                                            {/* ปุ่มบันทึกเฉพาะตอน edit */}
                                            {isEditing && (
                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() =>
                                                            handleUpdateDetail(sp, i)
                                                        }
                                                    >
                                                        บันทึก
                                                    </Button>
                                                </TableCell>
                                            )}
                                            {isEditing && (
                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleDeleteDetail(sp.sp_code)}
                                                    >
                                                        ลบ
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        <Divider sx={{ my: 2 }} />

                        {/* FOOTER */}
                        {!isEditing && (
                            <Stack alignItems="flex-end">

                                <Typography fontWeight={600}>
                                    ยอดสุทธิทั้งหมด: ฿{money(calcTotal())}
                                </Typography>

                                {job.job_status != "deleted" && (
                                    <Button
                                        variant="contained"
                                        color="info"
                                        onClick={handleGeneratePDF_API}
                                        sx={{ mt: 2 }}
                                    >
                                        ส่งออกใบเบิก PDF
                                    </Button>
                                )}

                                {job.job_status === "processing" && (
                                    <Box sx={{ width: "100%", textAlign: "center", mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handleCompleteJob}
                                            sx={{ mt: 2 }}
                                        >
                                            ปิดงาน
                                        </Button>
                                    </Box>
                                )}
                            </Stack>
                        )}

                        {/* FOOTER ACTION BAR */}
                        <Stack
                            direction={isMobile ? "column" : "row"}
                            spacing={2}
                            justifyContent="center"
                            alignItems="center"
                            sx={{
                                mt: 3,
                                p: 2,
                                borderTop: "1px solid #eee",
                                backgroundColor: "#fafafa",
                            }}
                        >
                            {/* แก้ไข */}
                            {job.job_status === "processing" && !isEditing && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={() => {
                                        setIsEditing(true);
                                        const percent = detailData[0]?.discount_percent ?? 0;
                                        setJobDiscount(percent);
                                        setDetailData(prev => prev.map(item => ({ ...item, discount_percent: percent })));
                                    }}
                                    fullWidth={isMobile}
                                >
                                    แก้ไข
                                </Button>
                            )}

                            {/* เสร็จสิ้นการแก้ไข */}
                            {isEditing && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleCancelEdit}
                                    fullWidth={isMobile}
                                >
                                    เสร็จสิ้นการแก้ไข
                                </Button>
                            )}

                            {/* เพิ่มรายการอะไหล่ */}
                            {job.job_status === "processing" && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setOpenEditModal(true)}
                                    fullWidth={isMobile}
                                >
                                    เพิ่มรายการอะไหล่
                                </Button>
                            )}

                            {/* ลบเอกสาร */}
                            {job.job_status !== "deleted" && job.job_status !== "complete" && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleDeleteJob}
                                    fullWidth={isMobile}
                                >
                                    ลบเอกสาร
                                </Button>
                            )}

                        </Stack>

                    </Paper>
                </Grid2>
            </Grid2>

            <WithdrawEditModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                jobId={job.stock_job_id}
                jobDiscount={jobDiscount}
                onAdded={(items) => {
                    setDetailData(items);
                    setOpenEditModal(false);
                }}
            />

            {/* LOADING */}
            <Backdrop open={processing} sx={{ zIndex: 9999, color: "#fff" }}>
                <CircularProgress size={60} />
            </Backdrop>
        </AuthenticatedLayout>
    );
}