import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    Avatar,
    Box,
    Button,
    ButtonGroup,
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
import { useState, useMemo } from "react";

const thStyle = {
    fontWeight: 700,
    fontSize: 13,
    bgcolor: "#f0faf8",
    color: "#00796b",
    whiteSpace: "nowrap",
    borderBottom: "2px solid #b2dfdb",
    py: 1.5,
};

const ToggleSwitch = ({ checked, disabled, onChange, onLabel, offLabel, color = "#00796b" }) => (
    <Tooltip title={checked ? `คลิกเพื่อปิด${onLabel}` : `คลิกเพื่อเปิด${onLabel}`} placement="left">
        <Stack direction="row" spacing={0.5} alignItems="center">
            <Switch
                size="small"
                checked={!!checked}
                disabled={disabled}
                onChange={onChange}
                sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: color },
                }}
            />
            <Typography fontSize={11} color={checked ? color : "text.disabled"} fontWeight={600}>
                {checked ? onLabel : offLabel}
            </Typography>
        </Stack>
    </Tooltip>
);

export default function ServiceCenterList({ shops: initialShops }) {
    const [shops, setShops] = useState(initialShops);
    const [loadingId, setLoadingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all"); // "all" | "Y" | "N"

    const filteredShops = useMemo(() => {
        if (filterStatus === "all") return shops;
        return shops.filter((s) => s.is_active === filterStatus);
    }, [shops, filterStatus]);

    const callToggle = (routeName, id, updater) => {
        setLoadingId(id);
        axios
            .patch(route(routeName, { is_code_cust_id: id }))
            .then(() => setShops((prev) => prev.map((s) => s.is_code_cust_id === id ? updater(s) : s)))
            .finally(() => setLoadingId(null));
    };

    const handleToggleActive = (shop) =>
        callToggle("admin.service-centers.toggle-active", shop.is_code_cust_id, (s) => ({
            ...s,
            is_active: s.is_active === "Y" ? "N" : "Y",
        }));

    const handleToggleFilter = (shop) =>
        callToggle("admin.service-centers.toggle-filter", shop.is_code_cust_id, (s) => ({
            ...s,
            show_in_report_filter: !s.show_in_report_filter,
        }));

    const activeCount  = shops.filter((s) => s.is_active === "Y").length;
    const visibleCount = shops.filter((s) => s.show_in_report_filter).length;

    return (
        <AuthenticatedLayout>
            <Head title="ข้อมูลศูนย์ซ่อม" />
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
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
                                        ทั้งหมด <strong style={{ color: "#00796b" }}>{shops.length}</strong> ร้าน
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">·</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        เปิดใช้งาน <strong style={{ color: "#2e7d32" }}>{activeCount}</strong> ร้าน
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">·</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        แสดงใน Report <strong style={{ color: "#1976d2" }}>{visibleCount}</strong> ร้าน
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ButtonGroup size="small" variant="outlined">
                                {[
                                    { label: "ทั้งหมด", value: "all", count: shops.length },
                                    { label: "เปิดใช้งาน", value: "Y", count: activeCount },
                                    { label: "ปิดใช้งาน", value: "N", count: shops.length - activeCount },
                                ].map((opt) => (
                                    <Button
                                        key={opt.value}
                                        onClick={() => setFilterStatus(opt.value)}
                                        variant={filterStatus === opt.value ? "contained" : "outlined"}
                                        sx={{
                                            borderColor: "#b2dfdb",
                                            color: filterStatus === opt.value ? "white" : "#00796b",
                                            bgcolor: filterStatus === opt.value ? "#00796b" : "transparent",
                                            "&:hover": { bgcolor: filterStatus === opt.value ? "#004d40" : "#e0f2f1", borderColor: "#00796b" },
                                            fontWeight: filterStatus === opt.value ? 700 : 400,
                                            fontSize: 12,
                                        }}
                                    >
                                        {opt.label} ({opt.count})
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Stack>

                        <Tooltip title="Export เฉพาะร้านที่เปิดใช้งาน (is_active = Y)">
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={() => window.open(route("admin.service-centers.export"), "_blank")}
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
                        </Tooltip>
                    </Stack>

                    {/* Table */}
                    <TableContainer sx={{ maxHeight: "calc(100vh - 220px)" }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thStyle, width: 50 }}>#</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 220 }}>ชื่อร้าน</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 160 }}>รหัสร้านค้า</TableCell>
                                    <TableCell sx={{ ...thStyle, minWidth: 240 }}>ที่อยู่</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 150 }}>เซลล์ที่ดูแล</TableCell>
                                    <TableCell sx={{ ...thStyle, width: 150 }}>
                                        <Tooltip title="เปิด/ปิดสถานะร้านค้า — ร้านที่ปิดจะไม่ถูก Export" placement="top">
                                            <span>สถานะร้าน</span>
                                        </Tooltip>
                                    </TableCell>
                                    {/* <TableCell sx={{ ...thStyle, width: 160 }}>
                                        <Tooltip title="เปิด/ปิด เพื่อกำหนดว่าร้านนี้จะโผล่ในตัวกรองของหน้า Report หรือไม่" placement="top">
                                            <span>แสดงใน Report</span>
                                        </Tooltip>
                                    </TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredShops.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary">ไม่พบข้อมูลศูนย์ซ่อม</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredShops.map((shop, index) => {
                                        const isActive = shop.is_active === "Y";
                                        const isLoading = loadingId === shop.is_code_cust_id;
                                        return (
                                            <TableRow
                                                key={shop.id}
                                                hover
                                                sx={{
                                                    "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                                                    "&:hover": { bgcolor: "#e0f2f1 !important" },
                                                    opacity: isActive ? 1 : 0.5,
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
                                                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                                        >
                                                            {shop.shop_name}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontSize={12} fontFamily="monospace" color="primary.main">
                                                        {shop.is_code_cust_id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 240 }}>
                                                    <Tooltip title={shop.address || ""} placement="top">
                                                        <Typography
                                                            fontSize={12}
                                                            color="text.secondary"
                                                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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
                                                            sx={{ fontSize: 11, maxWidth: 140 }}
                                                        />
                                                    ) : (
                                                        <Typography fontSize={12} color="text.disabled">-</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <ToggleSwitch
                                                        checked={isActive}
                                                        disabled={isLoading}
                                                        onChange={() => handleToggleActive(shop)}
                                                        onLabel="เปิดใช้งาน"
                                                        offLabel="ปิดใช้งาน"
                                                        color="#2e7d32"
                                                    />
                                                </TableCell>
                                                {/* <TableCell>
                                                    <ToggleSwitch
                                                        checked={!!shop.show_in_report_filter}
                                                        disabled={isLoading}
                                                        onChange={() => handleToggleFilter(shop)}
                                                        onLabel="แสดง"
                                                        offLabel="ซ่อน"
                                                        color="#00796b"
                                                    />
                                                </TableCell> */}
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}
