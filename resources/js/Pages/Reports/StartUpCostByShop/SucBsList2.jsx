import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Container, Grid2, Table, TableCell, TableHead, TableRow,
    TableBody, Typography, useMediaQuery, Stack, Button, Card, CardContent,
    Box, Avatar, Chip, Divider, Paper,
    Autocomplete,
    TextField,
    Checkbox,
    Pagination,
    MenuItem
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle.js";
import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
export default function SucBsList2({
    jobs,
    total_start_up_cost,
    shops,
    selected_shop,
    current_shop_name,
    is_admin,
    is_acc,
    filters
}) {
    const isMobile = useMediaQuery('(max-width:900px)');

    // --- State Management ---
    const [selected, setSelected] = useState([]);
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [status, setStatus] = useState(filters?.status || 'Y');

    // --- Checkbox Logic ---
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = jobs.data.map((n) => n.job_id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        if (!is_admin && !is_acc) {
            return;
        }
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    // --- Filter & Search Logic ---
    const handleSearch = (overrideShopId = null) => {
        router.get(route('report.start-up-cost-shop.index'), {
            shop: overrideShopId !== null ? overrideShopId : selected_shop,
            start_date: startDate,
            end_date: endDate,
            status: status,
            page: 1, // เมื่อค้นหาใหม่ ให้กลับไปหน้า 1 เสมอ
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearDate = () => {
        setStartDate('');
        setEndDate('');
        router.get(route('report.start-up-cost-shop.index'), {
            shop: selected_shop,
            start_date: '',
            end_date: '',
            status: 'Y',
            page: 1,
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            shop: selected_shop || '',
            start_date: startDate || '',
            end_date: endDate || '',
            status: status || 'Y'
        });
        window.open(route('report.start-up-cost-shop.export') + '?' + params.toString(), "_blank");
    };

    // --- Pagination Handler (เพิ่มใหม่) ---
    const handlePageChange = (event, value) => {
        router.get(route('report.start-up-cost-shop.index'), {
            shop: selected_shop,
            start_date: startDate,
            end_date: endDate,
            status: status,
            page: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // --- เพิ่มฟังก์ชันจัดการการสร้างเอกสาร ---
    const handleCreateDocument = () => {
        if (selected.length === 0) return;
        const selectedIds = selected.join(',');

        router.get(route('report.start-up-cost-shop.create-doc'), {
            ids: selectedIds,
            start_date: startDate,
        });
        // router.post(route('report.start-up-cost-shop.create-doc'), { ids: selected });
    };

    //แปลงสถานะ เป็น ชื่อสถานะ
    const getStatusName = (status) => {
        if (status === 'Y') return 'รอจ่าย';
    }

    // --- Desktop Table Component ---
    const TableComponent = () => {
        const rowCount = jobs.data.length;
        const numSelected = selected.length;

        return (
            <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" sx={{ ...TableStyle.TableHead, width: 50 }}>
                                {(is_admin || is_acc) && (
                                    <Checkbox
                                        color="primary"
                                        indeterminate={numSelected > 0 && numSelected < rowCount}
                                        checked={rowCount > 0 && numSelected === rowCount}
                                        onChange={handleSelectAllClick}
                                        inputProps={{ 'aria-label': 'select all jobs' }}
                                    />
                                )}

                            </TableCell>
                            <TableCell sx={TableStyle.TableHead}>ลำดับ</TableCell>
                            <TableCell sx={TableStyle.TableHead}>หมายเลข Job</TableCell>
                            <TableCell sx={TableStyle.TableHead}>ข้อมูลสินค้า</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">ค่าเปิดเครื่อง</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">สถานะ</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">วันที่ปิดงาน</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">#</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.data.length > 0 ? jobs.data.map((job, index) => {
                            const isItemSelected = isSelected(job.job_id);
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                                <TableRow
                                    key={job.job_id || index}
                                    hover
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    selected={isItemSelected}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={(event) => handleClick(event, job.job_id)}
                                >
                                    <TableCell padding="checkbox">
                                        {(is_admin || is_acc) && (<Checkbox
                                            color="primary"
                                            checked={isItemSelected}
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />)}

                                    </TableCell>
                                    <TableCell>
                                        <Chip label={jobs.from + index} variant="outlined" size="small" />
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
                                                sx={{ width: 50, height: 50, bgcolor: 'grey.200' }}
                                                onError={(e) => e.target.src = '/images/default-product.png'}
                                            />
                                            <Stack spacing={0.5}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {job.p_name}
                                                </Typography>
                                                <Stack direction="row" spacing={1}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        PID: {job.pid}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">|</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        SN: {job.serial_id}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body1" fontWeight="bold" color="primary">
                                            ฿{job.start_up_cost?.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body1" fontWeight="bold" color="success">
                                            {getStatusName(job.stuc_status)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {new Date(job.updated_at).toLocaleDateString('th-TH')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button variant="outlined" size="small" onClick={(e) => e.stopPropagation()}>
                                            รายละเอียด
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        );
    }

    // --- Mobile Card Component ---
    const MobileComponent = ({ job, index }) => (
        <Card elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction='row' spacing={1}>
                            <Chip label={`#${jobs.from + index}`} color="primary" variant="outlined" size="small" />
                            <Chip label='Success' color="success" size="small" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(job.updated_at).toLocaleDateString('th-TH')}
                        </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar
                            src={job.image_sku} variant="rounded" sx={{ width: 70, height: 70 }}
                            onError={(e) => e.target.src = '/images/default-product.png'}
                        />
                        <Stack spacing={0.5} flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {job.p_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Job: {job.job_id}</Typography>
                            <Typography variant="caption" color="text.secondary">PID: {job.pid}</Typography>
                            <Typography variant="caption" color="text.secondary">SN: {job.serial_id}</Typography>
                        </Stack>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="caption" color="text.secondary">ค่าเปิดเครื่อง</Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                                ฿{job.start_up_cost?.toLocaleString()}
                            </Typography>
                        </Box>
                        <Button variant="contained" size="small" onClick={() => { }}>
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
            <Container maxWidth={false} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
                <Grid2 container spacing={3}>
                    {/* Header */}
                    <Grid2 size={12}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={2}
                        >
                            <Box>
                                <Typography variant={isMobile ? "h6" : "h5"} fontWeight='bold' color="text.primary">
                                    รายงานค่าตอบแทน (ค่าเปิดเครื่องในประกัน)
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    ร้านค้า: <Box component="span" fontWeight="bold" color="primary.main">{current_shop_name}</Box>
                                </Typography>
                            </Box>

                            {/* ปุ่มประวัติการสร้างเอกสาร */}
                            {(is_admin || is_acc) && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<HistoryIcon />}
                                    onClick={() => router.get(route('report.start-up-cost-shop.doc-list'))} // ลิ้งค์ไปหน้า DocList
                                    sx={{ bgcolor: 'white' }}
                                >
                                    ประวัติเอกสาร
                                </Button>
                            )}
                        </Stack>
                    </Grid2>

                    {/* Filter & Actions Toolbar */}
                    <Grid2 size={12}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                gap: 2,
                                justifyContent: "space-between",
                                alignItems: isMobile ? "stretch" : "center"
                            }}>
                                {/* Left Side: Filters */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: 2,
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    flex: 1
                                }}>
                                    {(is_admin || is_acc) && (
                                        <Autocomplete
                                            size="small"
                                            sx={{ width: isMobile ? "100%" : 250 }}
                                            options={shops}
                                            getOptionLabel={(option) => option.shop_name}
                                            value={shops.find((s) => s.is_code_cust_id == selected_shop) || null}
                                            onChange={(_, newValue) => handleSearch(newValue?.is_code_cust_id || '')}
                                            renderInput={(params) => <TextField {...params} label="เลือกร้านค้า" />}
                                        />
                                    )}

                                    {/* <Stack direction="row" spacing={1} alignItems="center" width={isMobile ? "100%" : "auto"}>
                                        <TextField
                                            label="เริ่มวันที่"
                                            type="date"
                                            size="small"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: isMobile ? "50%" : 150 }}
                                        />
                                        <Typography>-</Typography>
                                        <TextField
                                            label="ถึงวันที่"
                                            type="date"
                                            size="small"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: isMobile ? "50%" : 150 }}
                                        />
                                    </Stack> */}

                                    <Stack direction="row" spacing={1} alignItems="center" width={isMobile ? "100%" : "auto"}>
                                        <TextField
                                            label="ตั้งแต่เดือน"
                                            type="month" // <--- เปลี่ยนเป็น month
                                            size="small"
                                            value={startDate ? startDate.substring(0, 7) : ''} // ตัดเอาแค่ YYYY-MM
                                            onChange={(e) => setStartDate(e.target.value)} // ค่าที่ได้จะเป็น YYYY-MM
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: isMobile ? "50%" : 180 }} // ขยายความกว้างนิดหน่อย
                                        />
                                        <Typography>-</Typography>
                                        <TextField
                                            label="ถึงเดือน"
                                            type="month" // <--- เปลี่ยนเป็น month
                                            size="small"
                                            value={endDate ? endDate.substring(0, 7) : ''}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: isMobile ? "50%" : 180 }}
                                        />
                                    </Stack>

                                    {/* เพิ่มฟังก์ชั่น กรองสถานะ (Y คือ อยู่ในรับประกันแต่ยังไม่จ่าย, P คือ อยู่ในรับประกันและจ่ายแล้ว)*/}
                                    <TextField
                                        select
                                        label="สถานะ"
                                        size="small"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        sx={{ width: isMobile ? "100%" : 150 }}
                                    >
                                        <MenuItem value="Y">รอจ่าย (Y)</MenuItem>
                                        <MenuItem value="P">จ่ายแล้ว (P)</MenuItem>
                                        <MenuItem value="All">ทั้งหมด</MenuItem>
                                    </TextField>

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

                                {/* Right Side: Actions */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: 2,
                                    alignItems: 'center',
                                    justifyContent: 'flex-end'
                                }}>
                                    {selected.length > 0 && (
                                        <>
                                            <Chip label={`เลือก ${selected.length} รายการ`} color="primary" variant="soft" />

                                            {/* ปุ่มสร้างเอกสาร (แสดงเฉพาะเมื่อมีการเลือก) */}
                                            <Button
                                                variant="contained"
                                                color="warning" // ใช้สีที่แตกต่าง เช่น สีส้ม
                                                startIcon={<DescriptionIcon />}
                                                onClick={handleCreateDocument}
                                                fullWidth={isMobile}
                                            >
                                                สร้างเอกสาร
                                            </Button>
                                        </>
                                    )}

                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={handleExport}
                                        fullWidth={isMobile}
                                    >
                                        Export Excel
                                    </Button>

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            bgcolor: 'info.lighter',
                                            color: 'info.dark',
                                            px: 2, py: 1,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'info.light',
                                            textAlign: 'center',
                                            width: isMobile ? "100%" : "auto"
                                        }}
                                    >
                                        <Typography variant="caption" display="block">
                                            รวมค่าเปิดเครื่อง{" "}
                                            <span className="font-bold text-sm">
                                                ฿{total_start_up_cost?.toLocaleString() ?? "0"}
                                            </span>
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid2>

                    {/* Content */}
                    <Grid2 size={12}>
                        {isMobile ? (
                            <Box>
                                {jobs.data.map((job, index) => (
                                    <MobileComponent key={index} job={job} index={index} />
                                ))}
                                {jobs.data.length === 0 && (
                                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</Typography>
                                    </Paper>
                                )}
                            </Box>
                        ) : (
                            <Box sx={{ minHeight: 400 }}>
                                <TableComponent />
                            </Box>
                        )}

                        {/* Pagination Section (เพิ่มใหม่ตรงนี้) */}
                        {jobs.last_page > 1 && (
                            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    แสดง {jobs.from} ถึง {jobs.to} จากทั้งหมด {jobs.total} รายการ
                                </Typography>
                                <Pagination
                                    count={jobs.last_page}
                                    page={jobs.current_page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                    shape="rounded"
                                    size={isMobile ? "small" : "medium"}
                                />
                            </Box>
                        )}
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}