import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Container, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, Chip, Button, useMediaQuery, Grid2, Card, CardContent, Divider, Stack,
    Box, IconButton, useTheme
} from "@mui/material";
import { Link } from "@inertiajs/react";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import { Refresh, RemoveRedEye } from "@mui/icons-material";
import { useState } from "react";
import axios from "axios";
import { AlertDialog } from "@/Components/AlertDialog";

export default function WithdrawHistory({ history }) {
    const [loading, setLoading] = useState(false);
    const [historyList, setHistoryList] = useState(history.data || []);
    const isMobile = useMediaQuery('(max-width:600px)');

    const ColorStatus = (status) => ({
        pending: 'warning',
        processing: 'secondary',
        completed: 'success',
        canceled: 'error'
    }[status] || 'info');

    const checkWithdrawStatus = async (withdraw_id) => {
        try {
            setLoading(true);
            const { data } = await axios.get(route('withdrawSp.checkStatus', { withdraw_id }));
            const newStatus = data.data.status;
            const order = historyList.find((h) => h.withdraw_id === withdraw_id);
            if (order) {
                order.status = newStatus;
                setHistoryList([...historyList]);
            }
        } catch (error) {
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
            <Container maxWidth="false" sx={{ mt: 4, bgcolor: 'white', p: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    ประวัติการเบิกอะไหล่
                </Typography>

                <Grid2 container spacing={2}>
                    {/* 📱 MOBILE LAYOUT */}
                    {isMobile ? (
                        <Grid2 size={12}>
                            {historyList.length ? historyList.map((item, index) => (
                                <Card variant="outlined" key={index} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <TextDetail label="รายการที่" value={index + 1} />
                                                <IconButton
                                                    disabled={loading}
                                                    onClick={() => alert("ขณะนี้ยังไม่สามารถเช็คสถานะได้")}
                                                    color="info"
                                                    size="small"
                                                >
                                                    <Refresh />
                                                </IconButton>
                                            </Box>

                                            <TextDetail label="รหัสใบเบิก" value={item.withdraw_id} />
                                            <TextDetail label="วันที่สร้างใบเบิก" value={DateFormatTh({ date: item.created_at })} />
                                            <TextDetail label="ที่อยู่จัดส่ง" value={item.address || "-"} />
                                            <TextDetail label="เบอร์โทร" value={item.phone || "-"} />
                                            <TextDetail label="สถานะ" value={item.status} />
                                            {/* <TextDetail label="ยอดรวม" value={`${Number(item.total_price || 0).toLocaleString()} บาท`} /> */}

                                            <Divider />

                                            <Button
                                                fullWidth
                                                startIcon={<RemoveRedEye />}
                                                variant="contained"
                                                size="small"
                                                // component={Link}
                                                // href={`/admin/withdraw/history-detail/${item.withdraw_id}`}
                                                onClick={() => alert("ขณะนี้ยังไม่สามารถดูรายละเอียดได้")}
                                            >
                                                ดูรายละเอียด
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )) : (
                                <Typography textAlign="center" color="text.secondary" mt={2}>
                                    ไม่มีประวัติการเบิก
                                </Typography>
                            )}
                        </Grid2>
                    ) : (
                        /* 💻 DESKTOP LAYOUT */
                        <Grid2 size={12} overflow="auto">
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>รหัสใบเบิก</TableCell>
                                        <TableCell>วันที่สร้างใบเบิก</TableCell>
                                        <TableCell>ที่อยู่จัดส่ง</TableCell>
                                        <TableCell align="center">สถานะ</TableCell>
                                        {/* <TableCell align="right">ยอดรวม (บาท)</TableCell> */}
                                        <TableCell align="center">รายละเอียด</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyList.length ? (
                                        historyList.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{item.withdraw_id}</TableCell>
                                                <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                                                <TableCell>{item.address || "-"}</TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                                                        <Button
                                                            color="info"
                                                            startIcon={<Refresh />}
                                                            size="small"
                                                            disabled={loading}
                                                            onClick={() => alert("อยู่ระหว่างการพัฒนา")}
                                                        >
                                                            รีเฟรช
                                                        </Button>
                                                        <Chip label={item.status} color={ColorStatus(item.status)} />
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {Number(item.total_price || 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        // component={Link}
                                                        // href={`/admin/withdraw/history-detail/${item.withdraw_id}`}
                                                        onClick={() => alert("ขณะนี้ยังไม่สามารถดูรายละเอียดได้")}
                                                    >
                                                        ดู
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                ไม่มีข้อมูลใบเบิก
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

const TextDetail = ({ label, value }) => {
    const { palette } = useTheme();
    const pumpkinColor = palette.pumpkinColor?.main || "#f97316";
    return (
        <Stack direction="row" spacing={1}>
            <Typography color={pumpkinColor} fontWeight="bold">{label}</Typography>
            <Typography>:</Typography>
            <Typography sx={{ flex: 1 }}>{value}</Typography>
        </Stack>
    );
};