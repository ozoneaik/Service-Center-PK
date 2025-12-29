import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Autocomplete, Paper, TextField, useMediaQuery, useTheme,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter,
    Chip, Pagination, Stack, Typography, Grid, Box, // เพิ่ม Grid, Box
    InputAdornment,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import SearchIcon from '@mui/icons-material/Search';
import { Button } from "flowbite-react";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function WDReportList() {
    const { shops, selectedShop, currentShopName, isAdmin, withdrawals, stats, filters } = usePage().props;
    console.log(filters);
    const defaultShop = shops.find(s => s.is_code_cust_id === selectedShop) || null;
    const [shopValue, setShopValue] = useState(defaultShop);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchData = (additionalParams = {}) => {
        const params = {
            shop: selectedShop,
            search: searchTerm,
            status: statusFilter,
            start_date: filters?.start_date || '',
            end_date: filters?.end_date || '',
            ...additionalParams
        };
        Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

        router.get(
            route(isAdmin ? "admin.withdraw-report.index" : "report.withdraw-report.index"), params, {
            preserveState: true,
            replace: true
        });
    }

    const handleSelectShop = (newValue) => {
        setShopValue(newValue);
        router.get(
            route("admin.withdraw-report.index"),
            { shop: newValue?.is_code_cust_id || "" },
            { replace: true }
        );
    }

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setStatusFilter(newStatus);
        fetchData({ status: newStatus });
    };

    const handleStartDateChange = (event) => {
        const val = event.target.value;
        setStartDate(val);
        fetchData({ start_date: val });
    };

    const handleEndDateChange = (event) => {
        const val = event.target.value;
        setEndDate(val);
        fetchData({ end_date: val });
    };

    const handleSearchOnKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchData({ search: searchTerm });
        }
    }

    const handlePageChange = (event, value) => {
        router.get(
            withdrawals.links.find(link => link.label == value)?.url || window.location.href,
            {},
            { preserveState: true }
        );
    };

    const calculateRowTotal = (qty, price, discountPercent) => {
        const q = Number(qty) || 0;
        const p = Number(price) || 0;
        const d = Number(discountPercent) || 0;
        const total = q * p;
        const discountAmount = total * (d / 100);
        return total - discountAmount;
    };

    const pageTotal = useMemo(() => {
        return withdrawals.data.reduce((acc, row) => {
            return acc + calculateRowTotal(row.sp_qty, row.stdprice_per_unit, row.discount_percent);
        }, 0);
    }, [withdrawals.data]);

    // Component ย่อยสำหรับ Card (เขียนไว้ในไฟล์เดียวกันนี้แหละครับ)
    const StatCard = ({ title, value, bgColor }) => (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: bgColor,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                border: '1px solid rgba(0,0,0,0.05)'
            }}
        >
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>
                {title}
            </Typography>
        </Paper>
    );

    //chip สถานะ
    const getStatusChip = (status) => {
        const statusMap = {
            'processing': { label: 'กำลังดำเนินการ', color: 'warning' },
            'complete': { label: 'เสร็จสิ้น', color: 'success' },
            'delete': { label: 'ลบ', color: 'error' }
        };
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
    };

    const handleExport = () => {
        // สร้าง Query String จาก state ปัจจุบัน
        const params = new URLSearchParams({
            shop: selectedShop,
            search: searchTerm,
            status: statusFilter,
            start_date: startDate,
            end_date: endDate
        });

        // ตรวจสอบว่าเป็น Admin หรือ User เพื่อเลือก Route ให้ถูก
        const routeName = isAdmin ? "admin.withdraw-report.export" : "report.withdraw-report.export";

        // เปิด Tab ใหม่เพื่อ Download
        window.open(`${route(routeName)}?${params.toString()}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="รายงานการเบิกอะไหล่" />
            <Paper elevation={3} sx={{ padding: 2 }}>
                <div className="flex justify-between items-center mb-7 flex-wrap gap-2">
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                        รายงานการเบิกอะไหล่ร้าน: {currentShopName}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    {isAdmin && (
                        <Autocomplete
                            options={shops}
                            sx={{ width: isMobile ? "100%" : 300 }}
                            value={shopValue}
                            onChange={(e, v) => handleSelectShop(v)}
                            getOptionLabel={(option) => option?.shop_name ? `${option.shop_name}` : ""}
                            renderInput={(params) => <TextField {...params} label="เลือกสาขา / ร้าน" size="small" />}
                        />
                    )}
                    <TextField
                        label="ค้นหา รหัส/ชื่อสินค้า"
                        size="small"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchOnKeyDown}
                        sx={{ width: isMobile ? "100%" : 250 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="วันที่เริ่มต้น"
                        type="date"
                        size="small"
                        value={startDate}
                        onChange={handleStartDateChange}
                        sx={{ width: isMobile ? "100%" : 180 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* [เพิ่ม] Date Picker: End Date */}
                    <TextField
                        label="วันที่สิ้นสุด"
                        type="date"
                        size="small"
                        value={endDate}
                        onChange={handleEndDateChange}
                        sx={{ width: isMobile ? "100%" : 180 }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl size="small" sx={{ width: 150 }}>
                        <InputLabel id="status-select-label">สถานะงาน</InputLabel>
                        <Select
                            labelId="status-select-label"
                            value={statusFilter}
                            label="สถานะงาน"
                            onChange={handleStatusChange}
                        >
                            <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
                            <MenuItem value="processing">กำลังดำเนินการ (processing)</MenuItem>
                            <MenuItem value="complete">เสร็จสิ้น (complete)</MenuItem>
                            <MenuItem value="delete">ลบแล้ว (delete)</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="success" // สีเขียวสื่อถึง Excel
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExport}
                        sx={{ height: 40, whiteSpace: 'nowrap' }} // ปรับความสูงให้เท่า Input
                    >
                        Export Excel
                    </Button>
                </div>

                {/* ส่วน Dashboard Cards */}
                <Box sx={{
                    mt: 2,
                    mb: 2,
                    p: 2,
                    border: '1px dashed #ccc', // เส้นประรอบนอกตามรูป
                    borderRadius: 2
                }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="จำนวน JOB ทั้งหมด"
                                value={stats?.total || 0}
                                bgColor="#F0F2F5" // สีเทาอ่อน
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="จำนวน JOB (process)"
                                value={stats?.process || 0}
                                bgColor="#FFF9C4" // สีเหลืองอ่อน
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="จำนวน JOB (complete)"
                                value={stats?.complete || 0}
                                bgColor="#FFE0B2" // สีส้มอ่อน
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="รวมยอดสุทธิ (complete)"
                                value={Number(stats?.totalNet || 0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                bgColor="#FFCCBC"
                            />
                        </Grid>
                    </Grid>
                </Box>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="withdraw table">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>เลขที่ใบงาน</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>วันที่</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>รหัสสินค้า</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อสินค้า</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>ราคา/หน่วย</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>ส่วนลด</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>ยอดสุทธิ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {withdrawals.data.length > 0 ? (
                                withdrawals.data.map((row, index) => {
                                    const netTotal = calculateRowTotal(row.sp_qty, row.stdprice_per_unit, row.discount_percent);
                                    return (
                                        <TableRow key={`${row.stock_job_id}-${index}`} hover>
                                            <TableCell>
                                                {getStatusChip(row.job_status)}
                                            </TableCell>
                                            <TableCell>{row.stock_job_id}</TableCell>
                                            <TableCell>
                                                {dayjs(row.created_at).locale('th').format('DD/MM/YYYY HH:mm')}
                                            </TableCell>
                                            <TableCell>{row.sp_code}</TableCell>
                                            <TableCell>{row.sp_name}</TableCell>
                                            <TableCell>{row.sp_unit}</TableCell>
                                            <TableCell align="right">{Number(row.sp_qty).toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {Number(row.stdprice_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.discount_percent ? `${row.discount_percent}%` : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                                        ไม่พบข้อมูลการเบิก
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {withdrawals.data.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={8} />
                                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                                        รวมทั้งสิ้น:
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 16, color: 'primary.main' }}>
                                        {pageTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </TableContainer>

                <Stack spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                    <Pagination
                        count={withdrawals.last_page}
                        page={withdrawals.current_page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                    <Typography variant="caption" color="text.secondary">
                        รายการที่ {withdrawals.from} - {withdrawals.to} จากทั้งหมด {withdrawals.total} รายการ
                    </Typography>
                </Stack>

            </Paper>
        </AuthenticatedLayout>
    )
}