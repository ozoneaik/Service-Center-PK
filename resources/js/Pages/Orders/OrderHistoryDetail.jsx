import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Box, Paper, Typography, Divider, Chip, Button,
    Stepper, Step, StepLabel,
    Card, CardContent, CardMedia,
    Table, TableBody, TableCell, TableContainer, TableRow,
    Container, Grid2
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StoreIcon from "@mui/icons-material/Store";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import { Head } from "@inertiajs/react";
import { Refresh } from "@mui/icons-material";
import { AlertDialog } from "@/Components/AlertDialog";

export default function OrderHistoryDetail({ order, listSp, customer }) {
    const [orderDetail, setOrderDetail] = useState(order);
    const [loading, setLoading] = useState(false);
    // สถานะการสั่งซื้อ
    const steps = ["กำลังรอรับคำสั่งซื้อ", "รับคำสั่งซื้อ", "กำลังดำเนินการจัดเตรียมสินค้า", "อยู่ระหว่างการจัดส่ง", "จัดส่งสำเร็จ"];

    const activeStatus = (orderStatus) => {
        switch (orderStatus) {
            case "pending":
            case "กำลังรอรับคำสั่งซื้อ":
                return 0;
            case "รับคำสั่งซื้อ":
            case "กำลังเปิดคำสั่งซื้อ":
                return 1;
            case "กำลังดำเนินการจัดเตรียมสินค้า":
                return 2;
            case "อยู่ระหว่างการจัดส่ง":
                return 3;
            case "จัดส่งสำเร็จ":
                return 4;
            default:
                return -1;
        }
    }

    // const checkOrderStatus = async (order_id) => {
    //     try {
    //         setLoading(true);
    //         const { data, status } = await axios.get(route('orders.checkStatusOrder', { order_id }));
    //         console.log("data", data);
    //         const orderStatus = data.data.status;
    //         setOrderDetail({ ...orderDetail, status: orderStatus });
    //     } catch (error) {
    //         AlertDialog({
    //             title: 'เกิดข้อผิดพลาด',
    //             text: error.response?.data?.message || error.message,
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    const checkOrderStatus = async (order_id) => {
        try {
            setLoading(true);
            console.log("🚀 กำลังเรียก API checkStatusOrder...", { order_id });

            // const { data, status } = await axios.get(route('orders.checkStatusOrder', { order_id }));
            const { data, status } = await axios.post(
                route('orders.checkStatusOrder'),
                { order_id }
            );

            console.group("📦 [CHECK ORDER STATUS]");
            console.log("HTTP Status:", status);
            console.log("Response Data:", data);
            console.log("Response JSON:", JSON.stringify(data, null, 2));
            console.groupEnd();

            const orderStatus = data.data.status;
            console.log("🟢 อัปเดตสถานะเป็น:", orderStatus);

            setOrderDetail({ ...orderDetail, status: orderStatus });
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการเรียก API:", error.response || error);
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.message || error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title='รายละเอียดคำสั่งซื้อ' />
            <Container sx={{ mt: 3 }} maxWidth='false'>
                {/* ส่วนหัวข้อและสถานะ */}
                <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Box display='flex' justifyContent='flex-start' gap={2}>
                            <Typography variant="h6">รายละเอียดคำสั่งซื้อ #{orderDetail.order_id}</Typography>
                            <Button
                                size="small" color="primary" onClick={() => checkOrderStatus(orderDetail.order_id)}
                                startIcon={<Refresh />} loading={loading}
                            >
                                เช็คสถานะล่าสุด
                            </Button>
                        </Box>
                        <Chip
                            label={orderDetail.status}
                            color="primary"
                            icon={<LocalShippingIcon />}
                        />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Stepper
                        activeStep={activeStatus(orderDetail.status)}
                        alternativeLabel color='secondary'
                    >
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>

                {/* ข้อมูลการจัดส่ง */}
                <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <LocalShippingIcon sx={{ mr: 1 }} color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">
                            ข้อมูลการจัดส่ง
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Box sx={{ display: "flex", mb: 1, alignItems: 'center' }}>
                                <LocationOnIcon sx={{ mr: 1 }} color="action" />
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        {customer.shop_name} | {customer.phone}
                                    </Typography>
                                    <Typography variant="body2">
                                        {orderDetail.address}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid2>
                        {orderDetail.trackingNo && (
                            <Grid2 size={12}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <ReceiptIcon sx={{ mr: 1 }} fontSize="small" color="action" />
                                    <Typography variant="body2">หมายเลขพัสดุ: {orderDetail.trackingNo}</Typography>
                                </Box>
                            </Grid2>
                        )}
                    </Grid2>
                </Paper>

                {/* รายการสินค้า */}
                <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <StoreIcon sx={{ mr: 1 }} color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">รายการสินค้า</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {listSp.map((item) => (
                        <Card variant='outlined' key={item.id} sx={{ mb: 2 }}>
                            <CardContent sx={{ padding: 2 }}>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 2, sm: 1 }}>
                                        <CardMedia
                                            component="img"
                                            height="80"
                                            image={`${import.meta.env.VITE_IMAGE_SP_NEW}/${item.sp_code}.jpg`}
                                            alt={item.sp_name}
                                            onError={(e) => {
                                                e.target.src = import.meta.env.VITE_IMAGE_DEFAULT
                                            }}
                                            sx={{ objectFit: "contain" }}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 10, sm: 11 }}>
                                        <Grid2 container>
                                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                                <Typography variant="body1">{item.sp_code}</Typography>
                                                <Typography variant="body1">{item.sp_name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ฿{item.price_per_unit} x {item.qty}
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

                    <TableContainer component={Paper} elevation={0} sx={{ mb: 2, border: "1px solid #f0f0f0" }}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>ราคารวมสินค้า</TableCell>
                                    <TableCell align="right">฿{orderDetail.totalPrice}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>ค่าจัดส่ง</TableCell>
                                    <TableCell align="right">฿0</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>ส่วนลด</TableCell>
                                    <TableCell align="right">-฿0</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>ยอดรวมทั้งสิ้น</TableCell>
                                    <TableCell align="right"
                                        sx={{ fontWeight: "bold" }}>฿{orderDetail.totalPrice}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* ข้อมูลการชำระเงิน */}
                <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <PaymentIcon sx={{ mr: 1 }} color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">ข้อมูลการชำระเงิน</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2">วิธีการชำระเงิน:</Typography>
                            <Typography variant="body1" fontWeight="medium">{orderDetail.pay_by}</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2">สถานะการชำระเงิน:</Typography>
                            <Chip
                                label={orderDetail.paymentStatus || 'ยังไม่ชำระเงิน'}
                                color={orderDetail.paymentStatus === 'success' ? 'success' : 'warning'}
                                size="small"
                            />
                        </Grid2>
                    </Grid2>
                </Paper>

                {/* ปุ่มดำเนินการ */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
                    <Button variant="outlined">ติดต่อผู้ขาย</Button>
                    <Button variant="contained">ติดตามการจัดส่ง</Button>
                </Box>
            </Container>
        </AuthenticatedLayout>
    );
}
