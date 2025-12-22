import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Container, Grid2, Table, TableCell, TableHead, TableRow,
    TableBody, Typography, useMediaQuery, Stack, Button, Card, CardContent,
    Box, Avatar, Chip, Divider, Paper,
    Autocomplete,
    TextField,
    MenuItem
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { TableStyle } from "../../../../css/TableStyle.js";
import React, { useState } from "react";

export default function SucBsList({ jobs, total_start_up_cost, shops, selected_shop, current_shop_name, is_admin, is_acc, filters }) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [status, setStatus] = useState(filters?.status || 'WaitCN');

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <Chip label="ตัดชำระแล้ว" color="success" size="small" variant="filled" />;
            case 'has_cn':
                return <Chip label="สร้าง CN แล้ว" color="primary" size="small" variant="filled" />;
            case 'wait_cn':
                return <Chip label="รอสร้าง CN" color="warning" size="small" variant="filled" />;
            case 'wait_job':
            default:
                return <Chip label="รอสร้าง Job" size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: 'text.disabled' }} />;
        }
    };

    const handleSearch = (overrideShop, overrideStatus) => {
        router.get(route('report.g-start-up-cost-shop.index'), {
            shop: overrideShop !== undefined ? overrideShop : selected_shop,
            status: overrideStatus !== undefined ? overrideStatus : status,
            start_date: startDate,
            end_date: endDate,
            page: 1
        }, { preserveState: true, preserveScroll: true });
    };

    const handleFilterChange = (newShop, newStatus) => {
        handleSearch(newShop, newStatus);
    }

    const handleClearDate = () => {
        setStartDate('');
        setEndDate('');
        router.get(route('report.g-start-up-cost-shop.index'), {
            shop: selected_shop,
            status: status,
            start_date: '',
            end_date: '',
            page: 1,
        }, { preserveState: true, preserveScroll: true });
    };

    const TableComponent = () => (
        <Paper elevation={1}>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={TableStyle.TableHead}>ลำดับ</TableCell>
                            <TableCell sx={TableStyle.TableHead}>หมายเลข job</TableCell>
                            <TableCell sx={TableStyle.TableHead}>ข้อมูลสินค้า</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">สถานะ</TableCell> {/* เพิ่ม */}
                            <TableCell sx={TableStyle.TableHead} align="center">ค่าเปิดเครื่อง</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">วันที่ปิดงาน</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">#</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.data.map((job, index) => (
                            <TableRow key={index} hover>
                                <TableCell>
                                    <Chip label={index + 1} variant="outlined" size="small" />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium" mb={1}>
                                        {job.job_id}
                                    </Typography>
                                    <Chip label='ปิดงานซ่อมแล้ว' color="success" size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Stack direction='row' spacing={2} alignItems='center'>
                                        <Avatar
                                            src={job.image_sku}
                                            variant="rounded"
                                            sx={{ width: 60, height: 60, bgcolor: 'grey.100' }}
                                            onError={(e) => e.target.src = import.meta.env.VITE_IMAGE_DEFAULT}
                                        />
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {job.p_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                PID: {job.pid}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Serial: {job.serial_id}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </TableCell>

                                {/* แสดงสถานะ */}
                                <TableCell align="center">
                                    {getStatusBadge(job.display_status)}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        ฿{job.start_up_cost?.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {new Date(job.updated_at).toLocaleDateString('th-TH')}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => alert('รายละเอียดอยู่ระหว่างในการพัฒนา')}
                                    >
                                        รายละเอียด
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Paper>
    );

    const MobileComponent = ({ job, index }) => (
        <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction='row' spacing={1}>
                            <Chip label={`#${index + 1}`} color="primary" variant="outlined" size="small" />
                            {getStatusBadge(job.display_status)}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Job: {job.job_id}
                        </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar
                            src={job.image_sku} variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'grey.100' }}
                            onError={(e) => e.target.src = import.meta.env.VITE_IMAGE_DEFAULT}
                        />
                        <Stack spacing={1} flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {job.p_name}
                            </Typography>
                            <Stack spacing={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>PID:</strong> {job.pid}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Serial:</strong> {job.serial_id}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack>
                            <Typography variant="caption" color="text.secondary">
                                ค่าเปิดเครื่อง
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                                ฿{job.start_up_cost?.toLocaleString()}
                            </Typography>
                        </Stack>
                        <Button variant="contained" size="small" color="primary">
                            รายละเอียด
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    )

    return (
        <AuthenticatedLayout>
            <Head title={'รายงานค่าตอบแทน (ค่าเปิดเครื่องในประกัน)'} />
            <Container maxWidth={false} sx={{ bgcolor: 'grey.50', py: 3 }}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography fontSize={20} fontWeight='bold'>
                                รายงานค่าตอบแทน (ค่าเปิดเครื่องในประกัน) ร้าน {current_shop_name}
                            </Typography>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                justifyContent: "space-between",
                                alignItems: isMobile ? "stretch" : "center",
                                gap: 2
                            }}>
                            {/* LEFT SIDE */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: 2,
                                alignItems: 'center',
                                flexWrap: 'wrap', // ให้ตกบรรทัดได้ถ้าที่ไ่ม่พอ
                                flex: 1
                            }}>
                                {/* 1. Shop Filter (Admin Only) */}
                                {is_admin && (
                                    <Autocomplete
                                        size="small"
                                        sx={{ width: isMobile ? "100%" : 250 }}
                                        options={shops}
                                        getOptionLabel={(option) => option.shop_name}
                                        value={shops.find((s) => s.is_code_cust_id == selected_shop) || null}
                                        onChange={(_, newValue) =>
                                            handleFilterChange(newValue?.is_code_cust_id || '', status)
                                        }
                                        renderInput={(params) => <TextField {...params} label="กรองร้านค้า" />}
                                    />
                                )}

                                {/* 2. Date Filter */}
                                <Stack direction="row" spacing={1} alignItems="center" width={isMobile ? "100%" : "auto"}>
                                    <TextField
                                        label="ตั้งแต่เดือน"
                                        type="month"
                                        size="small"
                                        value={startDate ? startDate.substring(0, 7) : ''}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ width: isMobile ? "50%" : 160 }}
                                    />
                                    <Typography>-</Typography>
                                    <TextField
                                        label="ถึงเดือน"
                                        type="month"
                                        size="small"
                                        value={endDate ? endDate.substring(0, 7) : ''}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ width: isMobile ? "50%" : 160 }}
                                    />
                                </Stack>

                                {/* 3. Status Filter */}
                                <TextField
                                    select
                                    label="สถานะ"
                                    size="small"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    sx={{ width: isMobile ? "100%" : 150 }}
                                >
                                    <MenuItem value="All">ทั้งหมด</MenuItem>
                                    <MenuItem value="WaitJob">รอสร้าง Job</MenuItem>
                                    <MenuItem value="WaitCN">รอสร้าง CN</MenuItem>
                                    <MenuItem value="HasCN">สร้าง CN แล้ว</MenuItem>
                                    <MenuItem value="Paid">ตัดชำระแล้ว</MenuItem>
                                </TextField>

                                {/* Search & Clear Buttons */}
                                <Stack direction="row" spacing={1} width={isMobile ? "100%" : "auto"}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleSearch()}
                                        startIcon={<SearchIcon />}
                                        fullWidth={isMobile}
                                    >
                                        ค้นหา
                                    </Button>
                                    {(startDate || endDate) && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleClearDate}
                                            startIcon={<ClearIcon />}
                                            fullWidth={isMobile}
                                        >
                                            ล้าง
                                        </Button>
                                    )}
                                </Stack>
                            </Box>

                            {/* RIGHT SIDE */}
                            <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems={isMobile ? "stretch" : "center"} sx={{ width: isMobile ? "100%" : "auto" }}>
                                <Button
                                    fullWidth={isMobile}
                                    variant="contained"
                                    color="success"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={() => {
                                        window.open(
                                            route('report.g-start-up-cost-shop.export', {
                                                shop: selected_shop,
                                                status: status,
                                                start_date: startDate,
                                                end_date: endDate
                                            }),
                                            "_blank"
                                        );
                                    }}
                                >
                                    ส่งออก Excel
                                </Button>

                                <Chip
                                    sx={{ width: isMobile ? "100%" : "auto", textAlign: "center", fontSize: isMobile ? 14 : "inherit", py: isMobile ? 1 : 0 }}
                                    color="info"
                                    label={`รวมค่าเปิดเครื่อง: ฿ ${total_start_up_cost?.toLocaleString() || 0}`}
                                />
                            </Stack>
                        </Box>
                    </Grid2>

                    <Grid2 size={12}>
                        {isMobile ? (
                            <Box>
                                {jobs.data.map((job, index) => (
                                    <MobileComponent key={index} job={job} index={index} />
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                                <TableComponent />
                            </Box>
                        )}
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}