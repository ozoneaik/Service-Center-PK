import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Container, Grid2, Table, TableCell, TableHead, TableRow,
    TableBody, Typography, useMediaQuery, Button, Card, CardContent,
    Box, Chip, Paper, Autocomplete, TextField, Pagination, Stack, Divider,
    Tooltip, IconButton, Snackbar, Alert,
    MenuItem
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle.js";
import React, { useState } from "react";
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StoreIcon from '@mui/icons-material/Store';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncIcon from '@mui/icons-material/Sync'; // <--- 1. เพิ่ม Import ไอคอน Sync

export default function DocList({ docs, shops, selected_shop, current_shop_name, is_admin, is_acc, filters }) {
    const isMobile = useMediaQuery('(max-width:900px)');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [status, setStatus] = useState(filters?.status || 'All');

    // --- สร้าง Options ร้านค้า (เพิ่ม All) ---
    const shopOptions = [
        { is_code_cust_id: 'all', shop_name: '--- ทั้งหมด (All Shops) ---' },
        ...shops
    ];

    const handleSearch = (newShop, newStatus) => {
        router.get(route('report.start-up-cost-shop.doc-list'), {
            shop: newShop !== undefined ? newShop : selected_shop,
            status: newStatus !== undefined ? newStatus : status,
            page: 1
        }, { preserveState: true, preserveScroll: true });
    };

    // --- Filter Logic ---
    const handleShopChange = (newShopId) => {
        router.get(route('report.start-up-cost-shop.doc-list'), {
            shop: newShopId,
            page: 1
        });
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        handleSearch(selected_shop, newStatus);
    };

    const handlePageChange = (event, value) => {
        router.get(route('report.start-up-cost-shop.doc-list'), {
            shop: selected_shop,
            page: value,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            shop: selected_shop || 'all',
            status: status || 'All'
        });
        window.open(route('report.start-up-cost-shop.export-doc-list') + '?' + params.toString(), "_blank");
    }

    // --- ฟังก์ชันสำหรับกดเช็ค CN ---
    const handleCheckCN = (doc) => {
        // ใช้ confirm เพื่อป้องกันการกดพลาด (หรือเอาออกก็ได้ถ้าต้องการให้กดได้เลย)
        // if (!confirm(`ต้องการเช็คสถานะ CN สำหรับเอกสาร ${doc.stuc_doc_no} หรือไม่?`)) return;

        router.post(route('report.start-up-cost-shop.check-cn'), {
            doc_no: doc.stuc_doc_no,
            shop_code: doc.is_code_key
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Backend จะ redirect back พร้อม flash message
                // Inertia จะจัดการ state ให้เอง เราแค่อาจจะเปิด snackbar บอก
            },
            onError: (errors) => {
                console.error(errors);
                alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            }
        });
    };

    // --- Copy to clipboard ---
    const handleCopy = (text) => {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(() => setOpenSnackbar(true))
                .catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            setOpenSnackbar(true);
        } catch (err) {
            console.error('Fallback copy error', err);
        }
        document.body.removeChild(textarea);
    };

    const getStatusChip = (doc) => {
        const { stuc_status, cn_doc } = doc;
        if (stuc_status === 'P') {
            return <Chip label="ตัดชำระแล้ว" color="success" size="small" variant="filled" />;
        } else if (stuc_status === 'Y') {
            const label = cn_doc ? "สร้าง CN แล้ว" : "รอสร้าง CN";
            const color = cn_doc ? "primary" : "warning";

            return (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-end', md: 'center' }}>
                    <Chip label={label} color={color} size="small" variant="filled" />

                    {/* ปุ่ม Sync แสดงเสมอสำหรับสถานะ Y */}
                    <Tooltip title="กดเพื่อเช็คสถานะ">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCheckCN(doc);
                            }}
                            sx={{
                                border: '1px solid #ff9800',
                                color: '#ff9800',
                                padding: '4px',
                                '&:hover': {
                                    backgroundColor: '#fff3e0'
                                }
                            }}
                        >
                            <SyncIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            );
        } else {
            return <Chip label="ไม่ทราบสถานะ" color="error" size="small" variant="filled" />;
        }
    };

    // --- Desktop Table ---
    const TableComponent = () => (
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={TableStyle.TableHead}>เลขที่เอกสาร (Cover)</TableCell>
                            <TableCell sx={TableStyle.TableHead}>เลขที่เอกสาร CT</TableCell>
                            <TableCell sx={TableStyle.TableHead}>ร้านค้า</TableCell>
                            <TableCell sx={TableStyle.TableHead}>เลขที่เอกสาร CN</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">วันที่สร้าง</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">รายการ</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">ยอดรวม</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">สถานะ</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">ผู้สร้าง</TableCell>
                            <TableCell sx={TableStyle.TableHead} align="center">#</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {docs.data.length > 0 ? docs.data.map((doc, index) => (
                            <TableRow key={index} hover>
                                {/* ใบปะหน้า */}
                                <TableCell>
                                    {doc.stuc_cover_doc_no ? (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <Typography variant="body2" fontWeight="medium">
                                                {doc.stuc_cover_doc_no}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopy(doc.stuc_cover_doc_no)}>
                                                <ContentCopyIcon fontSize="inherit" />
                                            </IconButton>
                                        </Stack>
                                    ) : '-'}
                                </TableCell>

                                {/* เลข CT */}
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <DescriptionIcon color="action" fontSize="small" />
                                        <Typography fontWeight="bold" color="primary" variant="body2">
                                            {doc.stuc_doc_no}
                                        </Typography>
                                        <Tooltip title="คัดลอก">
                                            <IconButton size="small" onClick={() => handleCopy(doc.stuc_doc_no)}>
                                                <ContentCopyIcon fontSize="inherit" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>

                                {/* ร้านค้า */}
                                <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <StoreIcon fontSize="small" color="disabled" />
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">{doc.shop_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{doc.is_code_key}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>

                                {/* เลข CN */}
                                <TableCell>
                                    {doc.cn_doc ? (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <Typography fontWeight="bold" color="success.main" variant="body2">
                                                {doc.cn_doc}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopy(doc.cn_doc)}>
                                                <ContentCopyIcon fontSize="inherit" />
                                            </IconButton>
                                        </Stack>
                                    ) : '-'}
                                </TableCell>

                                <TableCell align="center">
                                    {new Date(doc.created_at).toLocaleDateString('th-TH')}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label={doc.job_count} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="center">
                                    <Typography fontWeight="bold" color="success.main">
                                        ฿{doc.total_amount?.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    {/* เรียกใช้ getStatusChip แบบส่ง doc ไปทั้งก้อน */}
                                    {getStatusChip(doc)}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="caption">{doc.created_by_name}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => router.get(route('report.start-up-cost-shop.show-doc', { doc_no: doc.stuc_doc_no }))}
                                    >
                                        รายละเอียด
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">ไม่พบเอกสาร</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Paper>
    );

    // --- Mobile Card ---
    const MobileComponent = ({ doc }) => (
        <Card elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
                <Stack spacing={1.5}>
                    {/* Header: CT No & Status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                    {doc.stuc_doc_no}
                                </Typography>
                                <IconButton size="small" onClick={() => handleCopy(doc.stuc_doc_no)}>
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(doc.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                            </Typography>
                        </Box>
                        {/* Status + Sync Button */}
                        <Box>
                            {getStatusChip(doc)}
                        </Box>
                    </Stack>
                    <Divider />

                    {/* Shop Info */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <StoreIcon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">{doc.shop_name}</Typography>
                    </Stack>

                    {/* Cover Doc */}
                    {doc.stuc_cover_doc_no && (
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">เลขที่เอกสาร (Cover):</Typography>
                            <Typography variant="body2">{doc.stuc_cover_doc_no}</Typography>
                        </Stack>
                    )}

                    {/* Stats */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" bgcolor="grey.50" p={1} borderRadius={1}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">จำนวน</Typography>
                            <Typography variant="body1" fontWeight="bold">{doc.job_count} รายการ</Typography>
                        </Box>
                        <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary">ยอดรวม</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                ฿{doc.total_amount?.toLocaleString()}
                            </Typography>
                        </Box>
                    </Stack>

                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => router.get(route('report.start-up-cost-shop.show-doc', { doc_no: doc.stuc_doc_no }))}
                    >
                        ดูรายละเอียด
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <AuthenticatedLayout>
            <Head title="รายการเอกสารค่าเปิดเครื่อง" />
            <Container maxWidth={false} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
                <Grid2 container spacing={3}>
                    {/* Header & New Doc Button */}
                    <Grid2 size={12}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                            <Box>
                                <Typography variant="h5" fontWeight='bold' color="text.primary">
                                    ประวัติเอกสารเบิกค่าเปิดเครื่อง
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    ร้านค้า: <Box component="span" fontWeight="bold" color="primary.main">{current_shop_name}</Box>
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={() => router.get(route('report.start-up-cost-shop.index'))}
                                startIcon={<ArrowBackIcon />}
                            >
                                กลับไปยังหน้าสร้างเอกสาร
                            </Button>
                        </Stack>
                    </Grid2>

                    {/* Filters */}
                    <Grid2 size={12}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    {(is_admin || is_acc) && (
                                        <Autocomplete
                                            size="small"
                                            sx={{ width: isMobile ? "100%" : 300 }}
                                            options={shopOptions}
                                            getOptionLabel={(option) => option.shop_name}
                                            value={shopOptions.find((s) => s.is_code_cust_id == selected_shop) || null}
                                            onChange={(_, newValue) => handleShopChange(newValue?.is_code_cust_id || '')}
                                            renderInput={(params) => <TextField {...params} label="กรองร้านค้า" />}
                                        />
                                    )}
                                    <TextField
                                        select
                                        label="สถานะเอกสาร"
                                        size="small"
                                        value={status}
                                        onChange={handleStatusChange}
                                        sx={{ width: isMobile ? "100%" : 200 }}
                                    >
                                        <MenuItem value="All">ทั้งหมด</MenuItem>
                                        <MenuItem value="WaitCN">รอสร้าง CN</MenuItem>
                                        <MenuItem value="HasCN">สร้าง CN แล้ว</MenuItem>
                                        <MenuItem value="Paid">ตัดชำระแล้ว</MenuItem>
                                    </TextField>
                                </Stack>

                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleExport}
                                >
                                    ส่งออก Excel
                                </Button>
                            </Box>
                        </Paper>
                    </Grid2>

                    {/* Table / List */}
                    <Grid2 size={12}>
                        {isMobile ? (
                            <Box>
                                {docs.data.map((doc, index) => (
                                    <MobileComponent key={index} doc={doc} />
                                ))}
                            </Box>
                        ) : (
                            <TableComponent />
                        )}

                        {/* Pagination */}
                        {docs.last_page > 1 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={docs.last_page}
                                    page={docs.current_page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </Grid2>
                </Grid2>

                {/* Snackbar Notification */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={2000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                        คัดลอกเรียบร้อยแล้ว
                    </Alert>
                </Snackbar>
            </Container>
        </AuthenticatedLayout>
    );
}