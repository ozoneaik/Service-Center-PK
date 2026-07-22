import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Box, Button, Card, CardContent, CardMedia, Chip, Container, Divider,
    Grid2, Paper, Step, StepLabel, Stepper, Table, TableBody, TableCell,
    TableContainer, TableRow, Typography,
} from "@mui/material";
import { Head, Link } from "@inertiajs/react";
import { ArrowBack, LocalShipping, Receipt, Refresh, Store } from "@mui/icons-material";
import axios from "axios";
import { AlertDialog } from "@/Components/AlertDialog";

const STATUS_DISPLAY = {
    pending: "กำลังรอรับคำสั่งซื้อ",
    กำลังรอรับคำสั่งซื้อ: "กำลังรอรับคำสั่งซื้อ",
    รอรับงานซ่อม: "กำลังรอรับคำสั่งซื้อ",
    กำลังซ่อม: "กำลังรอรับคำสั่งซื้อ",
    พักงานซ่อม: "กำลังรอรับคำสั่งซื้อ",
    รอปิดงานซ่อม: "กำลังรอรับคำสั่งซื้อ",
    รับคำสั่งซื้อ: "รับคำสั่งซื้อ",
    กำลังเปิดคำสั่งซื้อ: "รับคำสั่งซื้อ",
    เปิดออเดอร์แล้ว: "รับคำสั่งซื้อ",
    รอเปิดSO: "รับคำสั่งซื้อ",
    progress: "กำลังดำเนินการจัดเตรียมสินค้า",
    กำลังดำเนินการจัดเตรียมสินค้า: "กำลังดำเนินการจัดเตรียมสินค้า",
    พร้อมส่ง: "กำลังดำเนินการจัดเตรียมสินค้า",
    แพ็คสินค้าเสร็จ: "กำลังดำเนินการจัดเตรียมสินค้า",
    กำลังจัดสินค้า: "กำลังดำเนินการจัดเตรียมสินค้า",
    shipping: "อยู่ระหว่างการจัดส่ง",
    อยู่ระหว่างการจัดส่ง: "อยู่ระหว่างการจัดส่ง",
    กำลังส่ง: "อยู่ระหว่างการจัดส่ง",
    เตรียมส่ง: "อยู่ระหว่างการจัดส่ง",
    success: "จัดส่งสำเร็จ",
    จัดส่งสำเร็จ: "จัดส่งสำเร็จ",
    บัญชีรับงานแล้ว: "จัดส่งสำเร็จ",
    ส่งของแล้ว: "จัดส่งสำเร็จ",
    canceled: "ยกเลิกคำสั่งซื้อ",
    ยกเลิกคำสั่งซื้อ: "ยกเลิกคำสั่งซื้อ",
    ไม่พบคำสั่งซื้อ: "ไม่พบคำสั่งซื้อ",
};

const STEPS = [
    "กำลังรอรับคำสั่งซื้อ",
    "รับคำสั่งซื้อ",
    "กำลังดำเนินการจัดเตรียมสินค้า",
    "อยู่ระหว่างการจัดส่ง",
    "จัดส่งสำเร็จ",
];

const STEP_INDEX = {
    "กำลังรอรับคำสั่งซื้อ": 0,
    "รับคำสั่งซื้อ": 1,
    "กำลังดำเนินการจัดเตรียมสินค้า": 2,
    "อยู่ระหว่างการจัดส่ง": 3,
    "จัดส่งสำเร็จ": 4,
};

const getDisplay = (s) => STATUS_DISPLAY[s] ?? s;
const getStep = (s) => STEP_INDEX[getDisplay(s)] ?? -1;

export default function DealerOrderHistoryDetail({ order, listSp }) {
    const [orderDetail, setOrderDetail] = useState(order);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post(route("orders.checkStatusOrder"), { order_id: orderDetail.order_id });
            setOrderDetail((prev) => ({ ...prev, status: data.data.status }));
        } catch (err) {
            AlertDialog({ title: "เกิดข้อผิดพลาด", text: err.response?.data?.message || err.message });
        } finally {
            setLoading(false);
        }
    };

    const display = getDisplay(orderDetail.status);
    const stepIdx = getStep(orderDetail.status);

    return (
        <AuthenticatedLayout>
            <Head title={`คำสั่งซื้อ #${orderDetail.order_id}`} />
            <Container sx={{ mt: 3 }} maxWidth={false}>

                {/* Header */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Button
                                component={Link}
                                href={route("dealerRepair.orders.history")}
                                startIcon={<ArrowBack />}
                                size="small"
                                variant="outlined"
                            >
                                กลับ
                            </Button>
                            <Typography variant="h6">
                                คำสั่งซื้อ #{orderDetail.order_id}
                            </Typography>
                            <Button
                                size="small" color="info" startIcon={<Refresh />}
                                onClick={checkStatus} loading={loading}
                            >
                                เช็คสถานะล่าสุด
                            </Button>
                        </Box>
                        <Chip label={display} color="primary" icon={<LocalShipping />} />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Stepper activeStep={stepIdx} alternativeLabel>
                        {STEPS.map((label) => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>
                </Paper>

                {/* Delivery info */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <LocalShipping sx={{ mr: 1 }} color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">ข้อมูลการจัดส่ง</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">ที่อยู่</Typography>
                    <Typography variant="body1">{orderDetail.address || "-"}</Typography>
                    {orderDetail.phone && (
                        <Typography variant="body2" mt={0.5}>โทร: {orderDetail.phone}</Typography>
                    )}
                    {orderDetail.trackingNo && (
                        <Box display="flex" alignItems="center" mt={1}>
                            <Receipt sx={{ mr: 1, fontSize: 16 }} color="action" />
                            <Typography variant="body2">หมายเลขพัสดุ: {orderDetail.trackingNo}</Typography>
                        </Box>
                    )}
                </Paper>

                {/* Items */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Store sx={{ mr: 1 }} color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">รายการสินค้า</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {listSp.map((item) => (
                        <Card variant="outlined" key={item.id} sx={{ mb: 2 }}>
                            <CardContent sx={{ p: 2 }}>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 2, sm: 1 }}>
                                        <CardMedia
                                            component="img"
                                            height="80"
                                            image={`${import.meta.env.VITE_IMAGE_SP_NEW}/${item.sku_code}/${item.sp_code}.jpg`}
                                            alt={item.sp_name}
                                            onError={(e) => { e.target.src = import.meta.env.VITE_IMAGE_DEFAULT; }}
                                            sx={{ objectFit: "contain" }}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 10, sm: 11 }}>
                                        <Grid2 container>
                                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                                <Typography variant="body1" fontWeight="medium">{item.sp_code}</Typography>
                                                <Typography variant="body2" color="text.secondary">{item.sp_name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ฿{item.price_per_unit} × {item.qty} {item.sp_unit ?? "ชิ้น"}
                                                </Typography>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 4 }} sx={{ textAlign: { sm: "right" } }}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    ฿{parseFloat(item.price_per_unit * item.qty).toFixed(2)}
                                                </Typography>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>
                    ))}

                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f0f0f0" }}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>ราคารวมสินค้า</TableCell>
                                    <TableCell align="right">฿{orderDetail.totalPrice}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>ยอดรวมทั้งสิ้น</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>฿{orderDetail.totalPrice}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

            </Container>
        </AuthenticatedLayout>
    );
}
