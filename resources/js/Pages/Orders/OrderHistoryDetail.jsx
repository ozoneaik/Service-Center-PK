import React from "react";
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
import {Head} from "@inertiajs/react";

export default function OrderHistoryDetail({order, listSp, customer}) {
    // สถานะการสั่งซื้อ
    const steps = ["กำลังรอรับคำสั่งซื้อ", "กำลังดำเนินการจัดเตรียมสินค้า", "คำสั่งซื้อเสร็จสิ้น"];

    return (
        <AuthenticatedLayout>
            <Head title='รายละเอียดคำสั่งซื้อ'/>
            <Container sx={{mt: 3}} maxWidth='false'>
                {/* ส่วนหัวข้อและสถานะ */}
                <Paper elevation={1} sx={{p: 2, mb: 2}}>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                        <Typography variant="h6">รายละเอียดคำสั่งซื้อ #{order.order_id}</Typography>
                        <Chip
                            label={order.status_text}
                            color="primary"
                            icon={<LocalShippingIcon/>}
                        />
                    </Box>
                    <Divider sx={{mb: 2}}/>
                    <Stepper
                        activeStep={order.status === 'pending' ? 0 : order.status === 'progress' ? 1 : order.status === 'success' ? 2 : -1}
                        alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>

                {/* ข้อมูลการจัดส่ง */}
                <Paper elevation={1} sx={{p: 2, mb: 2}}>
                    <Box sx={{display: "flex", alignItems: "center", mb: 1}}>
                        <LocalShippingIcon sx={{mr: 1}} color="primary"/>
                        <Typography variant="subtitle1" fontWeight="bold">ข้อมูลการจัดส่ง</Typography>
                    </Box>
                    <Divider sx={{mb: 2}}/>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Box sx={{display: "flex", mb: 1}}>
                                <LocationOnIcon sx={{mr: 1}} fontSize="small" color="action"/>
                                <Box>
                                    <Typography variant="body1"
                                                fontWeight="bold">{customer.shop_name} | {customer.phone}</Typography>
                                    <Typography variant="body2">{customer.address}</Typography>
                                </Box>
                            </Box>
                        </Grid2>
                        {order.trackingNo && (
                            <Grid2 size={12}>
                                <Box sx={{display: "flex", alignItems: "center"}}>
                                    <ReceiptIcon sx={{mr: 1}} fontSize="small" color="action"/>
                                    <Typography variant="body2">หมายเลขพัสดุ: {order.trackingNo}</Typography>
                                </Box>
                            </Grid2>
                        )}
                    </Grid2>
                </Paper>

                {/* รายการสินค้า */}
                <Paper elevation={1} sx={{p: 2, mb: 2}}>
                    <Box sx={{display: "flex", alignItems: "center", mb: 1}}>
                        <StoreIcon sx={{mr: 1}} color="primary"/>
                        <Typography variant="subtitle1" fontWeight="bold">รายการสินค้า</Typography>
                    </Box>
                    <Divider sx={{mb: 2}}/>

                    {listSp.map((item) => (
                        <Card key={item.id} sx={{mb: 2, boxShadow: "none", border: "1px solid #f0f0f0"}}>
                            <CardContent sx={{padding: 2}}>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{xs: 2, sm: 1}}>
                                        <CardMedia
                                            component="img"
                                            height="80"
                                            image={item.path_file}
                                            alt={item.sp_name}
                                            sx={{objectFit: "contain"}}
                                        />
                                    </Grid2>
                                    <Grid2 size={{xs: 10, sm: 11}}>
                                        <Grid2 container>
                                            <Grid2 size={{xs: 12, sm: 8}}>
                                                <Typography variant="body1">{item.sp_code}</Typography>
                                                <Typography variant="body1">{item.sp_name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ฿{item.price_per_unit} x {item.qty}
                                                </Typography>
                                            </Grid2>
                                            <Grid2 size={{xs: 12, sm: 4}} sx={{textAlign: {sm: "right"}}}>
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

                    <TableContainer component={Paper} elevation={0} sx={{mb: 2, border: "1px solid #f0f0f0"}}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>ราคารวมสินค้า</TableCell>
                                    <TableCell align="right">฿{order.totalPrice}</TableCell>
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
                                    <TableCell sx={{fontWeight: "bold"}}>ยอดรวมทั้งสิ้น</TableCell>
                                    <TableCell align="right"
                                               sx={{fontWeight: "bold"}}>฿{order.totalPrice}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* ข้อมูลการชำระเงิน */}
                <Paper elevation={1} sx={{p: 2, mb: 3}}>
                    <Box sx={{display: "flex", alignItems: "center", mb: 1}}>
                        <PaymentIcon sx={{mr: 1}} color="primary"/>
                        <Typography variant="subtitle1" fontWeight="bold">ข้อมูลการชำระเงิน</Typography>
                    </Box>
                    <Divider sx={{mb: 2}}/>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{xs: 12, sm: 6}}>
                            <Typography variant="body2">วิธีการชำระเงิน:</Typography>
                            <Typography variant="body1" fontWeight="medium">{order.paymentMethod}</Typography>
                        </Grid2>
                        <Grid2 size={{xs: 12, sm: 6}}>
                            <Typography variant="body2">สถานะการชำระเงิน:</Typography>
                            <Chip
                                label={order.paymentStatus || 'ยังไม่ชำระเงิน'}
                                color={order.paymentStatus === 'success' ? 'success' : 'warning'}
                                size="small"
                            />
                        </Grid2>
                    </Grid2>
                </Paper>

                {/* ปุ่มดำเนินการ */}
                <Box sx={{display: "flex", justifyContent: "center", gap: 2, mb: 3}}>
                    <Button variant="outlined">ติดต่อผู้ขาย</Button>
                    <Button variant="contained">ติดตามการจัดส่ง</Button>
                </Box>
            </Container>
        </AuthenticatedLayout>
    );
}
