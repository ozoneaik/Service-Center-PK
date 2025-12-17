// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
// import {
//     Container, Table, TableBody, TableCell, TableHead, TableRow,
//     Typography, Chip, Button, useMediaQuery, Grid2, Card, CardContent, Divider, Stack, useTheme,
//     Box,
//     IconButton
// } from "@mui/material";
// import { Link } from "@inertiajs/react";
// import { DateFormatTh } from "@/Components/DateFormat.jsx";
// import { Refresh, RemoveRedEye } from "@mui/icons-material";
// import { useState } from "react";
// import { AlertDialog } from "@/Components/AlertDialog";

// export default function OrderHistory({ history }) {
//     const [loading, setLoading] = useState(false);
//     const [historyList, setHistoryList] = useState(history.data);
//     const ColorStatus = (status) => ({
//         'กำลังรอรับคำสั่งซื้อ': 'warning',
//         'จัดส่งสำเร็จ': 'success',
//         progress: 'secondary',
//         canceled: 'error'
//     }[status] || 'info');

//     const isMobile = useMediaQuery('(max-width:600px)');

//     const checkOrderStatus = async (order_id) => {
//         try {
//             setLoading(true);
//             const { data, status } = await axios.get(route('orders.checkStatusOrder', { order_id }));
//             const orderStatus = data.data.status;
//             const orderTarget = historyList.find((item) => item.order_id === order_id);
//             if (orderTarget) {
//                 orderTarget.status = orderStatus;
//                 setHistoryList([...historyList]);
//             }
//         } catch (error) {
//             AlertDialog({
//                 title: 'เกิดข้อผิดพลาด',
//                 text: error.response?.data?.message || error.message,
//             });
//         } finally {
//             setLoading(false);
//         }
//     }
//     return (
//         <AuthenticatedLayout>
//             <Container maxWidth="false" sx={{ mt: 4, bgcolor: 'white', p: 3 }}>
//                 <Typography variant="h5" gutterBottom>
//                     ประวัติคำสั่งซื้อ
//                 </Typography>
//                 <Grid2 container spacing={2}>
//                     {isMobile ? (
//                         <Grid2 size={12}>
//                             {historyList.map((item, index) => {
//                                 return (
//                                     <Card variant='outlined' key={index}>
//                                         <CardContent>
//                                             <Stack spacing={2}>
//                                                 <Box display='flex' justifyContent='space-between' alignItems='center'>
//                                                     <TextDetail label={'รายการที่'} value={index + 1} />
//                                                     <IconButton loading={loading} onClick={() => checkOrderStatus(item.order_id)} color="info" size="small">
//                                                         <Refresh />
//                                                     </IconButton>
//                                                 </Box>
//                                                 <TextDetail label={'หมายเลขคำสั่งซื้อ'} value={item.order_id} />
//                                                 <TextDetail label={'วันที่สั่งซื้อ'}
//                                                     value={DateFormatTh({ date: item.buy_at })} />
//                                                 <TextDetail label={'ที่อยู่'} value={item.address} />
//                                                 <TextDetail label={'สถานะ'} value={item.status_text} />
//                                                 <Divider />
//                                                 <Button
//                                                     fullWidth startIcon={<RemoveRedEye />}
//                                                     variant='contained' size='small' component={Link}
//                                                     href={`/orders/history-detail/${item.order_id}`}
//                                                 >
//                                                     ดู
//                                                 </Button>
//                                             </Stack>
//                                         </CardContent>
//                                     </Card>
//                                 )
//                             })}
//                         </Grid2>
//                     ) : (
//                         <Grid2 size={12} overflow='auto'>
//                             <Table stickyHeader>
//                                 <TableHead>
//                                     <TableRow>
//                                         <TableCell>#</TableCell>
//                                         <TableCell>หมายเลขคำสั่งซื้อ</TableCell>
//                                         <TableCell>วันที่สั่งซื้อ</TableCell>
//                                         <TableCell>ที่อยู่</TableCell>
//                                         <TableCell align="center">สถานะ</TableCell>
//                                         <TableCell>รายละเอียด</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {historyList.length > 0 ? (
//                                         historyList.map((item, index) => (
//                                             <TableRow key={index}>
//                                                 <TableCell>{index + 1}</TableCell>
//                                                 <TableCell>{item.order_id}</TableCell>
//                                                 <TableCell>{new Date(item.buy_at).toLocaleString()}</TableCell>
//                                                 <TableCell>{item.address}</TableCell>
//                                                 <TableCell>
//                                                     <Box display='flex' justifyContent='center' alignItems='center' gap={2}>
//                                                         <Button
//                                                             color="info" startIcon={<Refresh />} size="small"
//                                                             loading={loading}
//                                                             onClick={() => checkOrderStatus(item.order_id)}
//                                                         >
//                                                             เช็คสถานะล่าสุด
//                                                         </Button>
//                                                         <Chip label={item.status} color={ColorStatus(item.status)} />
//                                                     </Box>
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <Button
//                                                         variant='contained' size='small' component={Link}
//                                                         href={`/orders/history-detail/${item.order_id}`}
//                                                     >
//                                                         ดู
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     ) : (
//                                         <TableRow>
//                                             <TableCell colSpan={4} align="center">
//                                                 ไม่มีข้อมูลคำสั่งซื้อ
//                                             </TableCell>
//                                         </TableRow>
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </Grid2>
//                     )}
//                 </Grid2>

//             </Container>
//         </AuthenticatedLayout>
//     );
// }

// const TextDetail = ({ label, value }) => {
//     const { palette } = useTheme();
//     const pumpkinColor = palette.pumpkinColor.main;
//     return (
//         <Stack direction='row' spacing={1}>
//             <Typography color={pumpkinColor} fontWeight='bold'>{label}</Typography>
//             <Typography>:</Typography>
//             <Typography>{value}</Typography>
//         </Stack>
//     )
// }
//-------------------------------------------version 2 ----------------------------------------------
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Container, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, Chip, Button, useMediaQuery, Grid2, Card, CardContent, Divider, Stack, useTheme,
    Box,
    IconButton,
    CircularProgress
} from "@mui/material";
import { Link } from "@inertiajs/react";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import { Refresh, RemoveRedEye } from "@mui/icons-material";
import { useState } from "react";
import axios from 'axios';
import { AlertDialog } from "@/Components/AlertDialog";

const getStatusDisplay = (status) => {
    switch (status) {
        case 'pending':
        case 'กำลังรอรับคำสั่งซื้อ':
            return 'กำลังรอรับคำสั่งซื้อ';
        case 'รับคำสั่งซื้อ':
        case 'กำลังเปิดคำสั่งซื้อ':
            return 'รับคำสั่งซื้อ';
        case 'progress':
        case 'กำลังดำเนินการจัดเตรียมสินค้า':
            return 'กำลังดำเนินการจัดเตรียมสินค้า';
        case 'shipping':
        case 'อยู่ระหว่างการจัดส่ง':
            return 'อยู่ระหว่างการจัดส่ง';
        case 'success':
        case 'จัดส่งสำเร็จ':
            return 'จัดส่งสำเร็จ';
        case 'canceled':
            return 'ยกเลิก';
        default:
            return status;
    }
};

export default function OrderHistory({ history }) {
    const [loadingOrderId, setLoadingOrderId] = useState(null);
    const [historyList, setHistoryList] = useState(history.data);

    const ColorStatus = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'รับคำสั่งซื้อ':
                return 'secondary';
            case 'ยกเลิกคำสั่งซื้อ':
                return 'error';
            case 'กำลังจัดเตรียมสินค้า':
                return 'secondary';
            case 'อยู่ระหว่างการจัดส่ง':
                return 'secondary';
            case 'จัดส่งสำเร็จ':
                return 'success';
            default:
                return 'info';
        }
    }

    const isMobile = useMediaQuery('(max-width:600px)');

    const checkOrderStatus = async (order_id) => {
        try {
            setLoadingOrderId(order_id);
            const { data } = await axios.post(route('orders.checkStatusOrder'), { order_id });
            const orderStatus = data.data.status;
            setHistoryList(prevList => prevList.map(item => {
                if (item.order_id === order_id) {
                    return { ...item, status: orderStatus };
                }
                return item;
            }));
            AlertDialog({
                title: 'อัปเดตสถานะสำเร็จ',
                text: `สถานะของ ${order_id} ถูกอัปเดตเป็น: ${getStatusDisplay(orderStatus)}`,
                icon: "success",
            });
        } catch (error) {
            console.error("Error checking status:", error);
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.message || error.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้',
            });
        } finally {
            setLoadingOrderId(null);
        }
    }

    const TextDetail = ({ label, value, chip }) => {
        const { palette } = useTheme();
        const labelColor = palette.pumpkinColor?.main || palette.primary.main;

        return (
            <Stack direction='row' spacing={1} alignItems="center">
                <Typography color={labelColor} fontWeight='bold'>{label}</Typography>
                <Typography>:</Typography>
                {chip ?
                    <Chip label={value} color={chip} size="small" /> :
                    <Typography>{value}</Typography>
                }
            </Stack>
        )
    }

    return (
        <AuthenticatedLayout>
            <Container maxWidth="false" sx={{ mt: 4, bgcolor: 'white', p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    ประวัติคำสั่งซื้อ
                </Typography>
                <Grid2 container spacing={2}>
                    {isMobile ? (
                        <Grid2 size={12}>
                            <Stack spacing={2}>
                                {historyList.map((item, index) => {
                                    const displayStatus = getStatusDisplay(item.status);
                                    const statusColor = ColorStatus(item.status);
                                    const isItemLoading = loadingOrderId === item.order_id;
                                    return (
                                        <Card variant='outlined' key={index} sx={{ mb: 1 }}>
                                            <CardContent>
                                                <Stack spacing={1.5}>
                                                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                                                        <TextDetail label={'รายการที่'} value={index + 1} />
                                                        {/* Mobile View: แสดง CircularProgress แทน Refresh Icon เมื่อโหลด */}
                                                        <IconButton
                                                            onClick={() => checkOrderStatus(item.order_id)}
                                                            color="info"
                                                            size="small"
                                                            disabled={isItemLoading}
                                                        >
                                                            {isItemLoading ? (
                                                                <CircularProgress size={20} color="inherit" />
                                                            ) : (
                                                                <Refresh />
                                                            )}
                                                        </IconButton>
                                                    </Box>
                                                    <Divider />
                                                    <TextDetail label={'หมายเลขคำสั่งซื้อ'} value={item.order_id} />
                                                    <TextDetail label={'วันที่สั่งซื้อ'}
                                                        value={new Date(item.buy_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })} />
                                                    <TextDetail label={'ที่อยู่'} value={item.address} />

                                                    <Stack direction='row' spacing={1} alignItems="center">
                                                        <Typography color={'primary'} fontWeight='bold'>สถานะ :</Typography>
                                                        <Chip label={displayStatus} color={statusColor} size="small" />
                                                    </Stack>

                                                    <Divider />
                                                    <Button
                                                        fullWidth startIcon={<RemoveRedEye />}
                                                        variant='contained' size='small' component={Link}
                                                        href={route('orders.historyDetail', { order_id: item.order_id })}
                                                    >
                                                        ดูรายละเอียด
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </Stack>
                        </Grid2>
                    ) : (
                        <Grid2 size={12} overflow='auto'>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>หมายเลขคำสั่งซื้อ</TableCell>
                                        <TableCell>วันที่สั่งซื้อ</TableCell>
                                        <TableCell>ที่อยู่</TableCell>
                                        <TableCell align="center">สถานะ</TableCell>
                                        <TableCell>รายละเอียด</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyList.length > 0 ? (
                                        historyList.map((item, index) => {
                                            const displayStatus = getStatusDisplay(item.status);
                                            const statusColor = ColorStatus(item.status);
                                            const isItemLoading = loadingOrderId === item.order_id; // ตรวจสอบสถานะโหลดของรายการนี้

                                            return (
                                                <TableRow key={index} hover>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{item.order_id}</TableCell>
                                                    <TableCell>{new Date(item.buy_at).toLocaleString()}</TableCell>
                                                    <TableCell>{item.address}</TableCell>
                                                    <TableCell>
                                                        <Box display='flex' justifyContent='center' alignItems='center' gap={2}>
                                                            <Button
                                                                color="info" size="small"
                                                                onClick={() => checkOrderStatus(item.order_id)}
                                                                disabled={isItemLoading}
                                                                startIcon={isItemLoading ? null : <Refresh />}
                                                                variant='outlined'
                                                            >
                                                                {isItemLoading ? (
                                                                    <CircularProgress size={16} color="inherit" />
                                                                ) : (
                                                                    "เช็คสถานะล่าสุด"
                                                                )}
                                                            </Button>
                                                            <Chip label={displayStatus} color={statusColor} />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant='contained' size='small' component={Link}
                                                            href={route('orders.historyDetail', { order_id: item.order_id })}
                                                        >
                                                            ดู
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                ไม่มีข้อมูลคำสั่งซื้อ
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Grid2>
                    )}
                </Grid2>

            </Container>
        </AuthenticatedLayout>
    );
}

const TextDetail = ({ label, value, chip }) => {
    const { palette } = useTheme();
    const labelColor = palette.pumpkinColor?.main || palette.primary.main;

    return (
        <Stack direction='row' spacing={1} alignItems="center">
            <Typography color={labelColor} fontWeight='bold'>{label}</Typography>
            <Typography>:</Typography>
            {chip ?
                <Chip label={value} color={chip} size="small" /> :
                <Typography>{value}</Typography>
            }
        </Stack>
    )
}
