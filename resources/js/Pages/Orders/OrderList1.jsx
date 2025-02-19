import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Container,
    CircularProgress,
    Alert, Grid2, Stack
} from '@mui/material';
import { Search, Add, Remove, ShoppingCart } from '@mui/icons-material';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

// ข้อมูลจำลอง (Mock Data)
const mockProducts = {
    "P001": {
        id: "P001",
        name: "เครื่องซักผ้า Samsung รุ่น WA12T",
        image: "https://images.pumpkin.tools/A%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%20%e0%b9%81%e0%b8%a5%e0%b8%b0%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b9%84%e0%b8%a3%e0%b9%89%e0%b8%aa%e0%b8%b2%e0%b8%a2/50277/Diagrams_50277-DM01.jpg",
        parts: [
            { id: "SP001", name: "มอเตอร์", price: 2500, stock: 15 },
            { id: "SP002", name: "แผงควบคุม", price: 1800, stock: 8 },
            { id: "SP003", name: "ปั๊มน้ำ", price: 950, stock: 20 },
        ]
    },
    "P002": {
        id: "P002",
        name: "ตู้เย็น LG รุ่น GN-B422",
        image: "/api/placeholder/400/300",
        parts: [
            { id: "SP004", name: "คอมเพรสเซอร์", price: 3200, stock: 5 },
            { id: "SP005", name: "แผงควบคุมอุณหภูมิ", price: 1500, stock: 12 },
            { id: "SP006", name: "ชั้นวางของ", price: 450, stock: 30 },
        ]
    }
};

const OrderList = () => {
    const [productCode, setProductCode] = useState('');
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderItems, setOrderItems] = useState({});
    const [orderTotal, setOrderTotal] = useState(0);

    // ค้นหาสินค้าจากรหัส
    const searchProduct = () => {
        if (!productCode.trim()) {
            setError('กรุณาระบุรหัสสินค้า');
            return;
        }

        setLoading(true);
        setError('');

        // จำลองการเรียก API
        setTimeout(() => {
            const foundProduct = mockProducts[productCode];
            if (foundProduct) {
                setProduct(foundProduct);

                // สร้าง orderItems เริ่มต้น
                const initialOrderItems = {};
                foundProduct.parts.forEach(part => {
                    initialOrderItems[part.id] = 0;
                });
                setOrderItems(initialOrderItems);

            } else {
                setError('ไม่พบสินค้าตามรหัสที่ระบุ');
                setProduct(null);
            }
            setLoading(false);
        }, 800);
    };

    // เพิ่มจำนวนอะไหล่
    const incrementItem = (partId) => {
        const part = product.parts.find(p => p.id === partId);
        if (orderItems[partId] < part.stock) {
            const newOrderItems = { ...orderItems, [partId]: orderItems[partId] + 1 };
            setOrderItems(newOrderItems);
            calculateTotal(newOrderItems);
        }
    };

    // ลดจำนวนอะไหล่
    const decrementItem = (partId) => {
        if (orderItems[partId] > 0) {
            const newOrderItems = { ...orderItems, [partId]: orderItems[partId] - 1 };
            setOrderItems(newOrderItems);
            calculateTotal(newOrderItems);
        }
    };

    // คำนวณยอดรวม
    const calculateTotal = (items) => {
        let total = 0;
        if (product) {
            product.parts.forEach(part => {
                total += part.price * items[part.id];
            });
        }
        setOrderTotal(total);
    };

    return (
        <AuthenticatedLayout>
            <Container maxWidth="false">
                <Box sx={{ py: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        ระบบสั่งซื้ออะไหล่
                    </Typography>

                    <Grid2 container spacing={2} sx={{ mb: 4 }}>
                        <Grid2 item xs={12} md={12}>
                            <Stack direction='row' spacing={2}>
                                <TextField
                                    fullWidth
                                    value={productCode}
                                    onChange={(e) => setProductCode(e.target.value)}
                                    variant="outlined"
                                    placeholder="เช่น P001, P002"
                                />
                                <Button
                                    onClick={searchProduct}
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Search />}
                                >
                                    ค้นหา
                                </Button>
                            </Stack>
                        </Grid2>
                    </Grid2>

                    {loading && (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    )}

                    {product && (
                        <>
                            <Card sx={{ mb: 4 }}>
                                <Grid2 container>
                                    <Grid2 item xs={12} md={4}>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={product.image}
                                            alt={product.name}
                                        />
                                    </Grid2>
                                    <Grid2 item xs={12} md={8}>
                                        <CardContent>
                                            <Typography variant="h5" component="h2" gutterBottom>
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                                รหัสสินค้า: {product.id}
                                            </Typography>
                                            <Typography variant="body1" sx={{ mt: 2 }}>
                                                รายการอะไหล่ทั้งหมด {product.parts.length} รายการ
                                            </Typography>
                                        </CardContent>
                                    </Grid2>
                                </Grid2>
                            </Card>

                            <Typography variant="h6" gutterBottom>
                                รายการอะไหล่
                            </Typography>

                            <TableContainer component={Paper} sx={{ mb: 4 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell>รหัสอะไหล่</TableCell>
                                            <TableCell>ชื่ออะไหล่</TableCell>
                                            <TableCell align="right">ราคา (บาท)</TableCell>
                                            <TableCell align="center">จำนวนคงเหลือ</TableCell>
                                            <TableCell align="center">จำนวนที่สั่ง</TableCell>
                                            <TableCell align="right">รวม (บาท)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {product.parts.map((part) => (
                                            <TableRow key={part.id}>
                                                <TableCell>{part.id}</TableCell>
                                                <TableCell>{part.name}</TableCell>
                                                <TableCell align="right">{part.price.toLocaleString()}</TableCell>
                                                <TableCell align="center">{part.stock}</TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => decrementItem(part.id)}
                                                            disabled={orderItems[part.id] <= 0}
                                                        >
                                                            <Remove />
                                                        </IconButton>
                                                        <Typography variant="body1" sx={{ mx: 2 }}>
                                                            {orderItems[part.id]}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => incrementItem(part.id)}
                                                            disabled={orderItems[part.id] >= part.stock}
                                                        >
                                                            <Add />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {(part.price * orderItems[part.id]).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 1,
                                    mb: 3
                                }}
                            >
                                <Typography variant="h6">
                                    ยอดรวมทั้งสิ้น
                                </Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {orderTotal.toLocaleString()} บาท
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<ShoppingCart />}
                                    disabled={orderTotal <= 0}
                                >
                                    ยืนยันการสั่งซื้อ
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Container>
        </AuthenticatedLayout>
    );
};

export default OrderList;
