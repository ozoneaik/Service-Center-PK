import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { Download, Store } from "@mui/icons-material";
import { useState } from "react";

const thStyle = {
    fontWeight: 700,
    fontSize: 13,
    bgcolor: "#f0faf8",
    color: "#00796b",
    whiteSpace: "nowrap",
    borderBottom: "2px solid #b2dfdb",
    py: 1.5,
};

export default function ServiceCenterList({ shops: initialShops }) {
    const [shops, setShops] = useState(initialShops);
    const [loadingId, setLoadingId] = useState(null);

    const handleExport = () => {
        window.open(route("admin.service-centers.export"), "_blank");
    };

    const handleToggle = (shop) => {
        setLoadingId(shop.is_code_cust_id);
        axios
            .patch(
                route("admin.service-centers.toggle-filter", {
                    is_code_cust_id: shop.is_code_cust_id,
                })
            )
            .then(() => {
                setShops((prev) =>
                    prev.map((s) =>
                        s.is_code_cust_id === shop.is_code_cust_id
                            ? { ...s, show_in_report_filter: !s.show_in_report_filter }
                            : s
                    )
                );
            })
            .finally(() => setLoadingId(null));
    };

    const visibleCount = shops.filter((s) => s.show_in_report_filter).length;

    return (
        <AuthenticatedLayout>
            <Head title="ข้อมูลศูนย์ซ่อม" />
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Paper
                    elevation={0}
                    sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
                >
                    {/* Header */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                        sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: "#e0f2f1", width: 40, height: 40 }}>
                                <Store sx={{ color: "#00796b", fontSize: 20 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                                    ข้อมูลร้านศูนย์ซ่อม
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" mt={0.3}>
                                    <Typography variant="caption" color="text.secondary">
                                        ทั้งหมด{" "}
                                        <strong style={{ color: "#00796b" }}>{shops.length}</strong>{" "}
                                        ร้าน
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">·</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        แสดงใน Report{" "}
                                        <strong style={{ color: "#1976d2" }}>{visibleCount}</strong>{" "}
                                        ร้าน
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                        <Button
                            variant="contained"
                            startIcon={<Download />}
                            onClick={handleExport}
                            sx={{
                                bgcolor: "#00796b",
                                "&:hover": { bgcolor: "#004d40" },
                                borderRadius: 2,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                            }}
                        >
                            ส่งออก Excel
                        </Button>
                    </Stack>

                    {/* Table */}
                    <TableContainer sx={{ maxHeight: "calc(100vh - 220px)" }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thStyle, width: 50 }}>#</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 220 }}>ชื่อร้าน</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 160 }}>รหัสร้านค้า</TableCell>
                                    <TableCell sx={{ ...thStyle, minWidth: 260 }}>ที่อยู่</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 160 }}>เซลล์ที่ดูแล</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 120 }}>สถานะ</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 160 }}>
                                        <Tooltip
                                            title="เปิด/ปิด เพื่อกำหนดว่าร้านนี้จะโผล่ในตัวกรองของหน้า Report หรือไม่"
                                            placement="top"
                                        >
                                            <span>แสดงใน Report</span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {shops.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary">
                                                ไม่พบข้อมูลศูนย์ซ่อม
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    shops.map((shop, index) => (
                                        <TableRow
                                            key={shop.id}
                                            hover
                                            sx={{
                                                "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                                                "&:hover": { bgcolor: "#e0f2f1 !important" },
                                                opacity: shop.show_in_report_filter ? 1 : 0.55,
                                            }}
                                        >
                                            <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 220 }}>
                                                <Tooltip title={shop.shop_name} placement="top">
                                                    <Typography
                                                        fontSize={13}
                                                        fontWeight={600}
                                                        sx={{
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {shop.shop_name}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    fontSize={12}
                                                    fontFamily="monospace"
                                                    color="primary.main"
                                                >
                                                    {shop.is_code_cust_id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 260 }}>
                                                <Tooltip title={shop.address || ""} placement="top">
                                                    <Typography
                                                        fontSize={12}
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {shop.address || "-"}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                {shop.sale_name ? (
                                                    <Chip
                                                        label={shop.sale_name}
                                                        size="small"
                                                        variant="outlined"
                                                        color="info"
                                                        sx={{ fontSize: 11, maxWidth: 150 }}
                                                    />
                                                ) : (
                                                    <Typography fontSize={12} color="text.disabled">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={shop.is_active === "Y" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                                    size="small"
                                                    sx={{
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        bgcolor: shop.is_active === "Y" ? "#e8f5e9" : "#f5f5f5",
                                                        color: shop.is_active === "Y" ? "#2e7d32" : "#757575",
                                                        border: `1px solid ${shop.is_active === "Y" ? "#a5d6a7" : "#e0e0e0"}`,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    title={
                                                        shop.show_in_report_filter
                                                            ? "คลิกเพื่อซ่อนออกจากตัวกรอง Report"
                                                            : "คลิกเพื่อแสดงในตัวกรอง Report"
                                                    }
                                                    placement="left"
                                                >
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Switch
                                                            size="small"
                                                            checked={!!shop.show_in_report_filter}
                                                            disabled={loadingId === shop.is_code_cust_id}
                                                            onChange={() => handleToggle(shop)}
                                                            sx={{
                                                                "& .MuiSwitch-switchBase.Mui-checked": {
                                                                    color: "#00796b",
                                                                },
                                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                                    bgcolor: "#00796b",
                                                                },
                                                            }}
                                                        />
                                                        <Typography
                                                            fontSize={11}
                                                            color={shop.show_in_report_filter ? "#00796b" : "text.disabled"}
                                                            fontWeight={600}
                                                        >
                                                            {shop.show_in_report_filter ? "แสดง" : "ซ่อน"}
                                                        </Typography>
                                                    </Stack>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}
