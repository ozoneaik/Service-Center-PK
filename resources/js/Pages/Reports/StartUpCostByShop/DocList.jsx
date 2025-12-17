import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Container, Grid2, Table, TableCell, TableHead, TableRow,
    TableBody, Typography, useMediaQuery, Button, Card, CardContent,
    Box, Chip, Paper, Autocomplete, TextField, Pagination, Stack, Divider,
    Tooltip,
    IconButton,
    Snackbar,
    Alert,
    MenuItem
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle.js";
import React, { useState } from "react";
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function DocList({ docs, shops, selected_shop, current_shop_name, is_admin, is_acc, filters }) {
    const isMobile = useMediaQuery('(max-width:900px)');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [status, setStatus] = useState(filters?.status || 'All');

    const handleSearch = (overrideShop = undefined, overrideStatus = undefined) => {
        const queryShop = overrideShop !== undefined ? overrideShop : selected_shop;
        const queryStatus = overrideStatus !== undefined ? overrideStatus : status;

        router.get(route('report.start-up-cost-shop.doc-list'), {
            shop: queryShop,
            status: queryStatus,
            page: 1
        }, { preserveState: true, preserveScroll: true });
    };

    // --- Pagination Logic ---
    const handlePageChange = (event, value) => {
        router.get(route('report.start-up-cost-shop.doc-list'), {
            shop: selected_shop,
            page: value,
        }, { preserveState: true, preserveScroll: true });
    };

    // --- Filter Logic ---
    const handleShopChange = (newShopId) => {
        router.get(route('report.start-up-cost-shop.doc-list'), {
            shop: newShopId,
            page: 1
        });
    };

    // ---Copy to clipboard---
    const handleCopy = (text) => {
        if (!text) return;

        // เช็คว่า Browser รองรับ API ใหม่ไหม และต้องเป็น HTTPS หรือ Localhost
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(() => setOpenSnackbar(true))
                .catch((err) => {
                    console.error('Modern copy failed', err);
                    fallbackCopy(text);
                });
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;

        // ซ่อน textarea
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = 0;

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setOpenSnackbar(true);
            } else {
                console.error('Fallback copy failed.');
            }
        } catch (err) {
            console.error('Fallback copy error', err);
        }

        document.body.removeChild(textarea);
    };

    // --- Desktop Table ---
    const TableComponent = () => (
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={TableStyle.TableHead}>เลขที่เอกสาร</TableCell>
                        <TableCell sx={TableStyle.TableHead}>เลขที่เอกสาร CN</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">วันที่สร้างเอกสาร</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">จำนวนรายการ</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">ยอดรวม (บาท)</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">สถานะเอกสาร</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">ผู้สร้างเอกสาร</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {docs.data.length > 0 ? docs.data.map((doc, index) => (
                        <TableRow key={index} hover>
                            <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <DescriptionIcon color="action" />
                                    <Typography fontWeight="bold" color="primary">
                                        {doc.stuc_doc_no}
                                    </Typography>
                                    <Tooltip title="คัดลอกเลขที่เอกสาร">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopy(doc.stuc_doc_no)}
                                            sx={{
                                                bgcolor: 'action.hover',
                                                '&:hover': { bgcolor: 'action.selected' },
                                                ml: 1
                                            }}
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <DescriptionIcon color="action" />
                                    <Typography fontWeight="bold" color="success">
                                        {doc.cn_doc}
                                    </Typography>
                                    <Tooltip title="คัดลอกเลขที่เอกสาร CN">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopy(doc.cn_doc)}
                                            sx={{
                                                bgcolor: 'action.hover',
                                                '&:hover': { bgcolor: 'action.selected' },
                                                ml: 1
                                            }}
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                            <TableCell align="center">
                                {new Date(doc.created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </TableCell>
                            <TableCell align="center">
                                <Chip label={`${doc.job_count} รายการ`} size="small" />
                            </TableCell>
                            <TableCell align="center">
                                <Typography fontWeight="bold" color="success.main">
                                    ฿{doc.total_amount?.toLocaleString()}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={doc.stuc_status === 'Y' ? 'รอจ่าย' : (doc.stuc_status === 'P' ? 'จ่ายแล้ว' : doc.stuc_status)}
                                    color={doc.stuc_status === 'Y' ? 'warning' : (doc.stuc_status === 'P' ? 'success' : 'error')}
                                    size="small" />
                            </TableCell>
                            <TableCell align="center">{doc.created_by_name}</TableCell>
                            <TableCell align="center">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => router.get(route('report.start-up-cost-shop.show-doc', { doc_no: doc.stuc_doc_no }))}                                >
                                    รายละเอียด
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">ไม่พบเอกสาร</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={2000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                        คัดลอกเลขที่เอกสารแล้ว
                    </Alert>
                </Snackbar>
            </Table>
        </Paper>
    );

    // --- Mobile Card ---
    const MobileComponent = ({ doc }) => (
        <Card elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="flex-start" alignItems="center">

                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            {doc.stuc_doc_no}
                        </Typography>
                        <Tooltip title="คัดลอกเลขที่เอกสาร">
                            <IconButton
                                size="small"
                                // --- FIX: ส่งค่า doc.stuc_doc_no เข้าไป ---
                                onClick={() => handleCopy(doc.stuc_doc_no)}
                                sx={{
                                    bgcolor: 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' },
                                    ml: 1,
                                    mr: 1
                                }}
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Snackbar
                            open={openSnackbar}
                            autoHideDuration={2000}
                            onClose={() => setOpenSnackbar(false)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        >
                            <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                                คัดลอกเลขที่เอกสารแล้ว
                            </Alert>
                        </Snackbar>
                        <Chip label={`${doc.job_count} รายการ`} size="small" />
                    </Stack>
                    <Divider />
                    <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">วันที่สร้างเอกสาร</Typography>
                            <Typography variant="body2">
                                {new Date(doc.created_at).toLocaleDateString('th-TH')}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">ยอดรวม</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                ฿{doc.total_amount?.toLocaleString()}
                            </Typography>
                        </Stack>
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
                    {/* Header */}
                    <Grid2 size={12}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', sm: 'center' }} spacing={2}>
                            <Box>
                                <Typography variant="h5" fontWeight='bold' color="text.primary">
                                    รายการเอกสารเบิกค่าเปิดเครื่อง
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    ร้านค้า: <Box component="span" fontWeight="bold" color="primary.main">{current_shop_name}</Box>
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => router.get(route('report.start-up-cost-shop.index'))}
                            >
                                ไปหน้าสร้างเอกสารใหม่
                            </Button>
                        </Stack>
                    </Grid2>

                    {/* Filter */}
                    <Grid2 size={12}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                            {(is_admin || is_acc) && (
                                <Autocomplete
                                    size="small"
                                    sx={{ width: isMobile ? "100%" : 300 }}
                                    options={shops}
                                    getOptionLabel={(option) => option.shop_name}
                                    value={shops.find((s) => s.is_code_cust_id == selected_shop) || null}
                                    onChange={(_, newValue) => handleShopChange(newValue?.is_code_cust_id || '')}
                                    renderInput={(params) => <TextField {...params} label="กรองร้านค้า" />}
                                />
                            )}
                        </Paper>
                    </Grid2>

                    {/* List Content */}
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
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}