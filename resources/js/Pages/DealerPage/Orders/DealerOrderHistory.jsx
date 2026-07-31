import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Grid2, IconButton, Stack, Table,
    TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { Head, Link, router } from "@inertiajs/react";
import { Check, ContentCopy, Refresh, RemoveRedEye, History } from "@mui/icons-material";
import { useState } from "react";
import axios from "axios";
import { AlertDialog } from "@/Components/AlertDialog";

const STATUS_MAP = {
    pending: "กำลังรอรับคำสั่งซื้อ",
    "กำลังรอรับคำสั่งซื้อ": "กำลังรอรับคำสั่งซื้อ",
    รอรับงานซ่อม: "กำลังรอรับคำสั่งซื้อ",
    กำลังซ่อม: "กำลังรอรับคำสั่งซื้อ",
    พักงานซ่อม: "กำลังรอรับคำสั่งซื้อ",
    รอปิดงานซ่อม: "กำลังรอรับคำสั่งซื้อ",
    รับคำสั่งซื้อ: "รับคำสั่งซื้อ",
    กำลังเปิดคำสั่งซื้อ: "รับคำสั่งซื้อ",
    เปิดออเดอร์แล้ว: "รับคำสั่งซื้อ",
    รอเปิดSO: "รับคำสั่งซื้อ",
    progress: "กำลังดำเนินการจัดเตรียมสินค้า",
    "กำลังดำเนินการจัดเตรียมสินค้า": "กำลังดำเนินการจัดเตรียมสินค้า",
    พร้อมส่ง: "กำลังดำเนินการจัดเตรียมสินค้า",
    แพ็คสินค้าเสร็จ: "กำลังดำเนินการจัดเตรียมสินค้า",
    กำลังจัดสินค้า: "กำลังดำเนินการจัดเตรียมสินค้า",
    shipping: "อยู่ระหว่างการจัดส่ง",
    "อยู่ระหว่างการจัดส่ง": "อยู่ระหว่างการจัดส่ง",
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

const COLOR_MAP = {
    "กำลังรอรับคำสั่งซื้อ": "warning",
    "รับคำสั่งซื้อ": "secondary",
    "กำลังดำเนินการจัดเตรียมสินค้า": "secondary",
    "อยู่ระหว่างการจัดส่ง": "primary",
    "จัดส่งสำเร็จ": "success",
    "ยกเลิกคำสั่งซื้อ": "error",
    "ไม่พบคำสั่งซื้อ": "error",
};

const getStatusDisplay = (s) => STATUS_MAP[s] ?? s;
const getStatusColor   = (s) => COLOR_MAP[getStatusDisplay(s)] ?? "default";

export default function DealerOrderHistory({ history, dealer_list = [], is_sale = false, selected_dealer = null, start_date = null, end_date = null }) {
    const isMobile = useMediaQuery("(max-width:600px)");
    const [historyList, setHistoryList] = useState(history.data);
    const [loadingId, setLoadingId]     = useState(null);
    const [dealerCode, setDealerCode]   = useState(selected_dealer || null);
    const [copiedId, setCopiedId]       = useState(null);
    const [startDate, setStartDate]     = useState(start_date || "");
    const [endDate, setEndDate]         = useState(end_date || "");

    const copyOrderId = (order_id) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(order_id);
        } else {
            const el = document.createElement("textarea");
            el.value = order_id;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
        setCopiedId(order_id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const checkStatus = async (order_id) => {
        try {
            setLoadingId(order_id);
            const { data } = await axios.post(route("orders.checkStatusOrder"), { order_id });
            const newStatus = data.data.status;
            setHistoryList((prev) =>
                prev.map((item) => item.order_id === order_id ? { ...item, status: newStatus } : item)
            );
        } catch (err) {
            AlertDialog({ title: "เกิดข้อผิดพลาด", text: err.response?.data?.message || err.message });
        } finally {
            setLoadingId(null);
        }
    };

    const applyFilters = ({ code = dealerCode, sd = startDate, ed = endDate } = {}) => {
        const params = {};
        if (code)  params.dealer_code  = code;
        if (sd)    params.start_date   = sd;
        if (ed)    params.end_date     = ed;
        router.get(route("dealerRepair.orders.history"), params, {
            preserveState: true,
            onSuccess: (page) => setHistoryList(page.props.history.data),
        });
    };

    const handleDealerFilter = (newCode) => {
        setDealerCode(newCode);
        applyFilters({ code: newCode });
    };

    const handleDateFilter = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleClearDates = () => {
        setStartDate("");
        setEndDate("");
        applyFilters({ sd: "", ed: "" });
    };

    return (
        <AuthenticatedLayout>
            <Head title="ประวัติการสั่งซื้ออะไหล่" />
            <Container maxWidth={false} sx={{ mt: 4, bgcolor: "white", p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <History color="action" />
                        <Typography variant="h5" fontWeight="bold">ประวัติการสั่งซื้ออะไหล่</Typography>
                    </Stack>
                    <IconButton onClick={() => router.reload()} title="รีเฟรช">
                        <Refresh />
                    </IconButton>
                </Stack>

                <Box component="form" onSubmit={handleDateFilter} mb={3}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-end" flexWrap="wrap">
                        {is_sale && (
                            <Autocomplete
                                options={dealer_list}
                                getOptionLabel={(o) => `${o.shop_name} (${o.is_code_cust_id})`}
                                value={dealer_list.find((d) => d.is_code_cust_id === dealerCode) || null}
                                onChange={(_, newVal) => handleDealerFilter(newVal?.is_code_cust_id || null)}
                                renderInput={(params) => (
                                    <TextField {...params} size="small" label="ร้านค้า" placeholder="ค้นหาร้านค้า" />
                                )}
                                sx={{ minWidth: 280 }}
                            />
                        )}
                        <TextField
                            size="small" type="date" label="ตั้งแต่วันที่"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            size="small" type="date" label="ถึงวันที่"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <Button type="submit" variant="contained" size="small">ค้นหา</Button>
                        {(startDate || endDate) && (
                            <Button variant="outlined" size="small" onClick={handleClearDates}>ล้างวันที่</Button>
                        )}
                    </Stack>
                </Box>

                {historyList.length === 0 ? (
                    <Box textAlign="center" py={8} color="text.secondary">
                        <Typography variant="body1">ยังไม่มีประวัติการสั่งซื้อ</Typography>
                    </Box>
                ) : isMobile ? (
                    <Stack spacing={2}>
                        {historyList.map((item, idx) => {
                            const display = getStatusDisplay(item.status);
                            const color   = getStatusColor(item.status);
                            const loading = loadingId === item.order_id;
                            return (
                                <Card variant="outlined" key={item.order_id}>
                                    <CardContent>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" color="text.secondary">รายการที่ {idx + 1}</Typography>
                                                <IconButton size="small" color="info" disabled={loading} onClick={() => checkStatus(item.order_id)}>
                                                    {loading ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
                                                </IconButton>
                                            </Box>
                                            <Divider />
                                            {is_sale && item.dealer_shop_name && (
                                                <Typography variant="body2"><b>ร้านค้า:</b> {item.dealer_shop_name}</Typography>
                                            )}
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2"><b>หมายเลขคำสั่งซื้อ:</b> {item.order_id}</Typography>
                                                <IconButton size="small" onClick={() => copyOrderId(item.order_id)} color={copiedId === item.order_id ? "success" : "default"}>
                                                    {copiedId === item.order_id ? <Check fontSize="inherit" /> : <ContentCopy fontSize="inherit" />}
                                                </IconButton>
                                            </Stack>
                                            <Typography variant="body2"><b>วันที่สั่งซื้อ:</b> {new Date(item.buy_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}</Typography>
                                            {/* <Typography variant="body2"><b>ที่อยู่:</b> {item.address || "-"}</Typography> */}
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body2" fontWeight="bold">สถานะ:</Typography>
                                                <Chip label={display} color={color} size="small" />
                                            </Stack>
                                            <Divider />
                                            <Button
                                                fullWidth startIcon={<RemoveRedEye />} variant="contained" size="small"
                                                component={Link}
                                                href={route("dealerRepair.orders.historyDetail", { order_id: item.order_id })}
                                            >
                                                ดูรายละเอียด
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                ) : (
                    <Grid2 container>
                        <Grid2 size={12} overflow="auto">
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        {is_sale && <TableCell>ร้านค้า</TableCell>}
                                        <TableCell>หมายเลขคำสั่งซื้อ</TableCell>
                                        <TableCell>วันที่สั่งซื้อ</TableCell>
                                        {/* <TableCell>ที่อยู่</TableCell> */}
                                        <TableCell align="center">สถานะ</TableCell>
                                        <TableCell>รายละเอียด</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyList.map((item, idx) => {
                                        const display = getStatusDisplay(item.status);
                                        const color   = getStatusColor(item.status);
                                        const loading = loadingId === item.order_id;
                                        return (
                                            <TableRow key={item.order_id} hover>
                                                <TableCell>{idx + 1}</TableCell>
                                                {is_sale && (
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">{item.dealer_shop_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{item.is_code_key}</Typography>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <Typography variant="body2">{item.order_id}</Typography>
                                                        <IconButton size="small" onClick={() => copyOrderId(item.order_id)} color={copiedId === item.order_id ? "success" : "default"}>
                                                            {copiedId === item.order_id ? <Check fontSize="inherit" /> : <ContentCopy fontSize="inherit" />}
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>{new Date(item.buy_at).toLocaleString()}</TableCell>
                                                {/* <TableCell>{item.address || "-"}</TableCell> */}
                                                <TableCell>
                                                    <Box display="flex" justifyContent="center" alignItems="center" gap={1.5}>
                                                        <Button
                                                            color="info" size="small" variant="outlined"
                                                            disabled={loading}
                                                            startIcon={loading ? null : <Refresh />}
                                                            onClick={() => checkStatus(item.order_id)}
                                                        >
                                                            {loading ? <CircularProgress size={16} color="inherit" /> : "เช็คสถานะ"}
                                                        </Button>
                                                        <Chip label={display} color={color} />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained" size="small" component={Link}
                                                        href={route("dealerRepair.orders.historyDetail", { order_id: item.order_id })}
                                                    >
                                                        ดู
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Grid2>
                    </Grid2>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}
