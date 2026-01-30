import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Chip, IconButton, TextField,
    InputAdornment, Button, Stack, Tooltip,
    MenuItem
} from "@mui/material";
import { Search, CheckCircle, Visibility } from "@mui/icons-material";
import Swal from "sweetalert2";
import axios from "axios";

const StatusBadge = ({ status }) => {
    let color = 'default';
    if (status === 'send') color = 'warning';
    if (status === 'process') color = 'info';
    if (status === 'complete') color = 'success';
    return <Chip
        // label={status.toUpperCase()} 
        label={status}
        color={color} size="small" />;
};

export default function ReceiveRepairIndex({ jobs, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('repair.receive.index'), { search, status }, { preserveState: true });
    };

    // const handleAcceptJob = (job_id) => {
    //     Swal.fire({
    //         title: 'ยืนยันการรับงาน?',
    //         text: `ต้องการรับงาน ${job_id} เข้าสู่กระบวนการซ่อมใช่หรือไม่`,
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'รับงาน',
    //         cancelButtonText: 'ยกเลิก',
    //         confirmButtonColor: '#2e7d32',
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             axios.post(route('repair.receive.accept'), { job_id })
    //                 .then((res) => {
    //                     Swal.fire('สำเร็จ', 'รับงานเรียบร้อยแล้ว', 'success');
    //                     router.reload(); // โหลดข้อมูลใหม่
    //                 })
    //                 .catch((err) => {
    //                     Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถรับงานได้', 'error');
    //                 });
    //         }
    //     });
    // };
    const handleAcceptJob = (job_id) => {
        Swal.fire({
            title: 'ยืนยันการรับงาน?',
            text: `ต้องการรับงาน ${job_id} เข้าสู่กระบวนการซ่อมใช่หรือไม่`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'รับงาน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#2e7d32',
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(route('repair.receive.accept'), { job_id })
                    .then((res) => {
                        Swal.fire({
                            title: 'สำเร็จ',
                            text: 'รับงานเรียบร้อยแล้ว กำลังเข้าสู่หน้าลายละเอียด',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            // [แก้ไข] Redirect ไปหน้า Show แทนการ reload
                            router.visit(route('repair.receive.show', { job_id }));
                        });
                    })
                    .catch((err) => {
                        Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถรับงานได้', 'error');
                    });
            }
        });
    };
    return (
        <AuthenticatedLayout>
            <Head title="รับงานแจ้งซ่อม (เซลล์)" />

            <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1976d2' }}>
                    รายการงานแจ้งซ่อมจากเซลล์ (รอรับงาน)
                </Typography>

                {/* Filter Section */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <form onSubmit={handleSearch}>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2}
                            alignItems={{ xs: 'stretch', md: 'center' }}
                        >
                            {/* Search */}
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="ค้นหา Job ID, ร้านค้า, ชื่อเซลล์..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Status Filter */}
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="text.secondary" whiteSpace="nowrap">
                                    กรองสถานะ
                                </Typography>

                                <TextField
                                    select
                                    size="small"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    sx={{ minWidth: 160 }}
                                >
                                    <MenuItem value="all">ทุกสถานะ</MenuItem>
                                    <MenuItem value="send">รอรับงาน</MenuItem>
                                    <MenuItem value="process">กำลังซ่อม</MenuItem>
                                    <MenuItem value="complete">เสร็จสิ้น</MenuItem>
                                </TextField>
                            </Stack>

                            {/* Submit */}
                            <Button
                                type="submit"
                                variant="contained"
                                disableElevation
                                sx={{ minWidth: 100 }}
                            >
                                ค้นหา
                            </Button>
                        </Stack>
                    </form>
                </Paper>

                {/* Table Section */}
                <TableContainer component={Paper} elevation={2}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell><strong>วันที่ส่งงาน</strong></TableCell>
                                <TableCell><strong>Job ID</strong></TableCell>
                                <TableCell><strong>ผู้แจ้ง (Sale)</strong></TableCell>
                                {/* <TableCell><strong>ร้านค้า</strong></TableCell> */}
                                <TableCell><strong>สินค้า</strong></TableCell>
                                <TableCell align="center"><strong>สถานะ</strong></TableCell>
                                <TableCell align="center"><strong>จัดการ</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobs.data.length > 0 ? (
                                jobs.data.map((job) => (
                                    <TableRow key={job.id} hover>
                                        <TableCell>{job.date_sent}</TableCell>
                                        <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>{job.job_id}</TableCell>

                                        {/* <TableCell>
                                            {job.status === 'process' ? (
                                                <Link
                                                    href={route('repair.index', { job_id: job.job_id })}
                                                    style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                                                >
                                                    {job.job_id}
                                                </Link>
                                            ) : (
                                                <span style={{ color: 'inherit' }}>
                                                    {job.job_id}
                                                </span>
                                            )}
                                        </TableCell> */}

                                        {/* <TableCell>{job.shop_name}</TableCell> */}
                                        <TableCell>{job.sale_name}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{job.product_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{job.pid}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <StatusBadge status={job.status} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                {/* ปุ่มดูรายละเอียด (ถ้ามีหน้า View) */}
                                                {/* <Tooltip title="ดูรายละเอียด">
                                                    <IconButton size="small" color="primary" onClick={() => router.get(route('repair.receive.show', job.job_id))}>
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip> 
                                                */}

                                                {/* {job.status === 'send' && (
                                                    <Tooltip title="กดรับงาน">
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => handleAcceptJob(job.job_id)}
                                                        >
                                                            รับงาน
                                                        </Button>
                                                    </Tooltip>
                                                )} */}
                                                {job.status === 'send' && (
                                                    <Tooltip title="ดูรายละเอียด">
                                                        <IconButton size="small" color="primary" onClick={() => router.get(route('repair.receive.show', { job_id: job.job_id }))}>
                                                            {/* <Visibility /> */}
                                                            รับงาน
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {job.status === 'process' && (
                                                    <Tooltip title="ดูรายละเอียด">
                                                        <IconButton size="small" color="primary" onClick={() => router.get(route('repair.index', { job_id: job.job_id }))}>
                                                            {/* <Visibility /> */}
                                                            ไปยังหน้าซ่อม
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {job.status === 'complete' && (
                                                    <Tooltip title="ดูรายละเอียด">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => router.get(route('repair.receive.show', { job_id: job.job_id }))}
                                                        >
                                                            {/* <Visibility /> */}
                                                            รายละเอียด
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        ไม่พบรายการงานแจ้งซ่อมที่รอรับ
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination (ถ้าจำเป็น) */}
                {/* <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                     // ใส่ Component Pagination ของคุณที่นี่
                </Box> */}
            </Box>
        </AuthenticatedLayout>
    );
}