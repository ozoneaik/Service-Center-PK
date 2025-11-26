import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    Autocomplete,
    TextField,
    Grid,
    Card,
    CardContent,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";
import { Button } from "flowbite-react";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#f44336", "#d1ffe4"];

export default function SumLists() {
    const { shops, stats, selectedShop, currentShopName, isAdmin, barData, selectedMonth: serverMonth, showAll: serverShowAll } = usePage().props;

    const defaultShop = shops.find(s => s.is_code_cust_id === selectedShop) || null;
    const [shopValue, setShopValue] = useState(defaultShop);
    const [selectedMonth, setSelectedMonth] = useState(serverMonth);
    const [showAll, setShowAll] = useState(serverShowAll == 1);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setSelectedMonth(serverMonth);
        setShowAll(serverShowAll == 1);
    }, [serverMonth, serverShowAll]);

    // Update state เมื่อ backend reload
    useEffect(() => {
        const newDefault = shops.find(s => s.is_code_cust_id === selectedShop) || null;
        setShopValue(newDefault);
    }, [selectedShop, shops]);

    const handleSelectShop = (newValue) => {
        setShopValue(newValue);

        router.get(
            route("admin.summary-center-repairs.index"),
            { shop: newValue?.is_code_cust_id || "", month: selectedMonth || "" }, // ส่ง month กลับไปด้วย
            { replace: true }
        );
    };

    // กำหนดขนาด Chart ตาม Responsive
    const pieOuterRadius = isMobile ? 80 : 120;
    const pieChartWidth = isMobile ? 300 : 500;
    const barChartHeight = isMobile ? 300 : 330;

    // แก้ไข route สำหรับ Filter เดือน (ใช้ admin.summary-center-repairs.index)
    const handleMonthChange = (e) => {
        router.get(
            route("admin.summary-center-repairs.index"),
            {
                shop: shopValue?.is_code_cust_id || "",
                month: e.target.value
            },
            { replace: true }
        );
    };

    const goToDetail = (statuses) => {
        router.get(
            route(
                isAdmin
                    ? "admin.summary-center-repairs.detail"
                    : "report.summary-center-repairs.detail"
            ),
            {
                shop: shopValue?.is_code_cust_id || "",
                status: statuses,
                month: selectedMonth,
                all: showAll ? 1 : 0
            });
    };

    return (
        <AuthenticatedLayout>
            <Head title="สรุปงานศูนย์ซ่อม" />
            <section className="p-4">
                {/* Header และ Filter เดือน/Export */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row", // จัดเรียงเป็น Column บนมือถือ
                        mr: 2,
                        justifyContent: "space-between",
                        alignItems: isMobile ? "flex-start" : "center", // ปรับการจัดเรียง
                        mb: isMobile ? 2 : 0
                    }}
                >
                    <Typography variant="h6" sx={{ mb: isMobile ? 1 : 2 }}>
                        Dashboard สรุปงานศูนย์ซ่อม — ร้าน <span style={{ fontWeight: "bold" }}>{currentShopName}</span>
                    </Typography>

                    {/* กล่อง Filter เดือน และ Button Export */}
                    <Box sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 2,
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: isMobile ? 'space-between' : 'flex-end',
                    }}>
                        {!showAll && (
                            <Box>
                                <Typography sx={{ fontWeight: 500, mb: 1 }}>
                                    เลือกเดือนของรายงาน
                                </Typography>
                                <TextField
                                    type="month"
                                    size="small"
                                    sx={{ width: 220 }}
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        router.get(
                                            route(
                                                isAdmin
                                                    ? "admin.summary-center-repairs.index"
                                                    : "report.summary-center-repairs.index"
                                            ),
                                            {
                                                shop: shopValue?.is_code_cust_id || "",
                                                month: e.target.value,
                                                all: 0
                                            });
                                    }}
                                />
                            </Box>
                        )}
                        {/* ปุ่มสลับโหมด */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                alignItems: isMobile ? "stretch" : "center",
                                gap: 2,
                                width: isMobile ? "100%" : "auto"
                            }}
                        >
                            <Button
                                fullWidth={isMobile}
                                color={showAll ? "warning" : "dark"}
                                onClick={() => {
                                    const next = !showAll;
                                    setShowAll(next);

                                    router.get(
                                        route(
                                            isAdmin
                                                ? "admin.summary-center-repairs.index"
                                                : "report.summary-center-repairs.index"
                                        ),
                                        {
                                            shop: shopValue?.is_code_cust_id || "",
                                            all: next ? 1 : 0,
                                            ...(next ? {} : { month: selectedMonth }),
                                        }
                                    );
                                }}
                            >
                                {showAll ? "กลับเป็นรายเดือน" : "ดูทั้งหมด"}
                            </Button>

                            <Button
                                fullWidth={isMobile}
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    window.open(
                                        route("admin.summary-center-repairs.export", {
                                            shop: shopValue?.is_code_cust_id || "",
                                            month: selectedMonth,
                                            all: showAll ? 1 : 0
                                        }),
                                        "_blank"
                                    );
                                }}
                            >
                                Excel
                                <FileDownloadIcon />
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Autocomplete สำหรับ Admin */}
                {isAdmin && (
                    <Autocomplete
                        options={shops}
                        sx={{ width: isMobile ? '100%' : 400, mb: 3 }} // ใช้เต็มความกว้างบนมือถือ
                        value={shopValue}
                        onChange={(e, v) => handleSelectShop(v)}
                        getOptionLabel={(option) =>
                            option?.shop_name
                                ? `${option.shop_name}`
                                : ""
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="เลือกสาขา / ร้านค้า" />
                        )}
                    />
                )}

                {/* User ปกติ — ไม่ให้เลือกร้าน */}
                {/* {!isAdmin && (
                    <Typography sx={{ mb: 3, fontSize: 16, fontWeight: 500 }}>
                        ร้านของคุณ: <span style={{ fontWeight: "bold" }}>{currentShopName}</span>
                    </Typography>
                )} */}

                {/* Card Stats */}
                <Grid container spacing={2} sx={{ mt: 2, justifyContent: "space-evenly" }}>
                    {/* เปลี่ยน xs={12} md={3} เป็น xs={6} sm={4} md={3} เพื่อให้แสดง 2 คอลัมน์บนมือถือ */}
                    <Grid item xs={6} sm={4} md={2}>
                        {/* <Card sx={{ background: "#f1f1f1" }}> */}
                        <Card sx={{
                            background: "#dfe9ff",
                            cursor: "pointer",
                            ":hover": {
                                // เปลี่ยนเป็นสีฟ้าที่เข้มขึ้น
                                background: "#c8d7ff"
                            }
                        }}
                            onClick={() => goToDetail(['success', 'pending', 'canceled', 'send'])}>
                            <CardContent sx={{ textAlign: "center", p: isMobile ? 1 : 3 }}>
                                <Typography variant="h4">{stats.total}</Typography>
                                <Typography sx={{ fontSize: isMobile ? 12 : 14 }}>รวมทั้งหมด</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={4} md={2}>
                        <Card sx={{
                            background: "#dfe9ff", cursor: "pointer", ":hover": {
                                // เปลี่ยนเป็นสีฟ้าที่เข้มขึ้น
                                background: "#c8d7ff"
                            }
                        }} onClick={() => goToDetail('success')}>
                            <CardContent sx={{ textAlign: "center", p: isMobile ? 1 : 3 }}>
                                <Typography variant="h4">{stats.success}</Typography>
                                <Typography sx={{ fontSize: isMobile ? 12 : 14 }}>ปิดงานซ่อมแล้ว</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={4} md={2}>
                        <Card
                            sx={{
                                background: "#fff7c2", cursor: "pointer",
                                ":hover": {
                                    // เปลี่ยนเป็นสีเหลืองที่เข้มขึ้น
                                    background: "#FFCC66"
                                }
                            }}
                            onClick={() => goToDetail('pending')}
                        >
                            <CardContent sx={{ textAlign: "center", p: isMobile ? 1 : 3 }}>
                                <Typography variant="h4">{stats.pending}</Typography>
                                <Typography sx={{ fontSize: isMobile ? 12 : 14 }}>กำลังดำเนินการ</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={4} md={2}>
                        <Card
                            sx={{
                                background: "#fff7c2", cursor: "pointer",
                                ":hover": {
                                    // เปลี่ยนเป็นสีเหลืองที่เข้มขึ้น
                                    background: "#FFCC66"
                                }
                            }}
                            onClick={() => goToDetail('canceled')}
                        >
                            <CardContent sx={{ textAlign: "center", p: isMobile ? 1 : 3 }}>
                                <Typography variant="h4">{stats.canceled}</Typography>
                                <Typography sx={{ fontSize: isMobile ? 12 : 14 }}>ยกเลิกซ่อม</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Card stats.send */}
                    <Grid item xs={6} sm={4} md={2}>
                        <Card
                            sx={{
                                background: "#fff7c2", cursor: "pointer",
                                ":hover": {
                                    // เปลี่ยนเป็นสีเหลืองที่เข้มขึ้น
                                    background: "#FFCC66"
                                }
                            }}
                            onClick={() => goToDetail('send')}
                        >
                            <CardContent sx={{ textAlign: "center", p: isMobile ? 1 : 3 }}>
                                <Typography variant="h4">{stats.send}</Typography>
                                <Typography sx={{ fontSize: isMobile ? 12 : 14 }}>ส่งซ่อมไปยัง PK</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={2} sx={{ mt: 3 }}>

                    {/* Chart ด้านซ้าย (Pie Chart) */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Box sx={{ display: "column", justifyContent: "center", mb: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    สัดส่วนงานซ่อม แจกแจงตามสถานะ
                                </Typography>
                                <PieChart width={pieChartWidth} height={330}>
                                    <Pie
                                        data={[
                                            { name: "ปิดงานซ่อมแล้ว", value: stats.success },
                                            { name: "กำลังดำเนินการ", value: stats.pending },
                                            { name: "ยกเลิกซ่อม", value: stats.canceled },
                                            { name: "ส่งซ่อมไปยัง PK", value: stats.send },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={pieOuterRadius} // ปรับขนาดตาม Responsive
                                        dataKey="value"
                                        label={!isMobile} // ซ่อน label บนมือถือเพื่อไม่ให้ทับซ้อน
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={index} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </Box>

                        </Box>
                    </Grid>

                    {/* แผนภูมิแท่ง ด้านขวา (Bar Chart) */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ width: '100%', height: barChartHeight }}>
                            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                ปริมาณ JOB ตามช่วงเวลาการปิดงาน
                            </Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d">
                                        {barData.map((entry, index) => (
                                            <Cell key={index} fill="#82ca9d" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>

                            <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                                ช่วงเวลาการปิดงาน
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </section>
        </AuthenticatedLayout>
    );
}