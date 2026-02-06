import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, Button, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid2, Divider, IconButton, Alert, Stack,
    TableContainer,
    InputAdornment,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    CheckCircle, Cancel, RemoveRedEye, Close, Warning,
    Inventory2, AssignmentTurnedIn, ReportProblem,
    CloudUpload, CameraAlt, Image as ImageIcon,
    HistoryEdu, AdminPanelSettings,
    Search,
    FilterList
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function SpareReturnList({ jobs, filterStatus }) {
    // --- State ---
    const [selectedJob, setSelectedJob] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // เพิ่ม State สำหรับกรองสถานะ

    const [receiveQuantities, setReceiveQuantities] = useState({});
    const [groupedQuantities, setGroupedQuantities] = useState({});

    const [processing, setProcessing] = useState(false);
    const [accRemark, setAccRemark] = useState('');
    const [accFiles, setAccFiles] = useState([]);
    const [accPreviews, setAccPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const filteredJobs = useMemo(() => {
        // ตัดช่องว่างออกจากคำค้นหา
        const cleanSearch = searchTerm.trim().toLowerCase();

        return jobs.filter(job => {
            // ค้นหาจากเลขที่รับคืน และ Claim ID (ตัดช่องว่างและแปลงเป็นตัวพิมพ์เล็กทั้งหมด)
            const matchesSearch = !cleanSearch ||
                job.return_job_no.toLowerCase().includes(cleanSearch) ||
                job.claim_id.toLowerCase().includes(cleanSearch);

            // กรองตามสถานะ
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, jobs]);

    // --- Logic การ Group ข้อมูลสินค้า (ใน Dialog) ---
    const groupedDetails = useMemo(() => {
        if (!selectedJob) return [];
        const groups = {};
        selectedJob.details.forEach(dt => {
            if (!groups[dt.sp_code]) {
                groups[dt.sp_code] = {
                    sp_code: dt.sp_code,
                    sp_name: dt.sp_name,
                    unit: dt.unit,
                    total_qty: 0,
                    total_rc_account: 0,
                    items: []
                };
            }
            groups[dt.sp_code].total_qty += dt.qty;
            groups[dt.sp_code].total_rc_account += (dt.account_rc_qty || 0);
            groups[dt.sp_code].items.push(dt);
        });
        return Object.values(groups);
    }, [selectedJob]);

    // --- Actions ---
    const handleCheck = (job) => {
        setSelectedJob(job);
        setAccRemark('');
        setAccFiles([]);
        setAccPreviews([]);
        const initialQty = {};
        const groups = {};
        job.details.forEach(dt => {
            initialQty[dt.id] = dt.qty;
            if (!groups[dt.sp_code]) groups[dt.sp_code] = 0;
            groups[dt.sp_code] += dt.qty;
        });
        setReceiveQuantities(initialQty);
        setGroupedQuantities(groups);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setTimeout(() => setSelectedJob(null), 300);
    };

    const handleChangeGroupQty = (sp_code, val, maxGroupQty, itemsInGroup) => {
        let inputVal = parseInt(val);
        if (isNaN(inputVal) || inputVal < 0) inputVal = 0;
        if (inputVal > maxGroupQty) inputVal = maxGroupQty;
        setGroupedQuantities(prev => ({ ...prev, [sp_code]: inputVal }));
        let remaining = inputVal;
        const newReceiveQuantities = { ...receiveQuantities };
        itemsInGroup.forEach(item => {
            if (remaining > 0) {
                if (remaining >= item.qty) {
                    newReceiveQuantities[item.id] = item.qty;
                    remaining -= item.qty;
                } else {
                    newReceiveQuantities[item.id] = remaining;
                    remaining = 0;
                }
            } else {
                newReceiveQuantities[item.id] = 0;
            }
        });
        setReceiveQuantities(newReceiveQuantities);
    };

    const processFiles = (files) => {
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length > 0) {
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setAccFiles(prev => [...prev, ...validFiles]);
            setAccPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
        e.target.value = '';
    };

    const handleRemoveImage = (index) => {
        setAccFiles(prev => prev.filter((_, i) => i !== index));
        setAccPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFiles(Array.from(e.dataTransfer.files)); };

    const isFullReceive = useMemo(() => {
        if (!selectedJob) return true;
        const totalSent = selectedJob.details.reduce((sum, dt) => sum + dt.qty, 0);
        const totalReceived = Object.values(receiveQuantities).reduce((sum, qty) => sum + qty, 0);
        return totalReceived >= totalSent;
    }, [selectedJob, receiveQuantities]);

    const handleSubmit = () => {
        const actionText = isFullReceive ? "ยืนยันการรับอะไหล่" : "ยืนยันปิดงาน (ยอดไม่ครบ)";
        Swal.fire({
            title: actionText,
            text: isFullReceive ? "ตรวจสอบความถูกต้องแล้วใช่หรือไม่?" : "คุณกำลังรับอะไหล่ไม่ครบตามจำนวน ยืนยันปิดงาน?",
            icon: isFullReceive ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: isFullReceive ? '#2e7d32' : '#ed6c02',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            didOpen: () => { Swal.getContainer().style.zIndex = '9999'; }
        }).then((result) => {
            if (result.isConfirmed) {
                setProcessing(true);
                const itemsToSubmit = Object.entries(receiveQuantities).map(([id, qty]) => ({
                    detail_id: id,
                    receive_qty: qty
                }));
                router.post(route('accounting.return.confirm'), {
                    return_header_id: selectedJob.id,
                    items: itemsToSubmit,
                    is_full_receive: isFullReceive,
                    remark: accRemark,
                    files: accFiles
                }, {
                    forceFormData: true,
                    onSuccess: () => {
                        setProcessing(false);
                        handleCloseDialog();
                        Swal.fire({ title: 'สำเร็จ', icon: 'success', didOpen: () => { Swal.getContainer().style.zIndex = '9999'; } });
                    },
                    onError: () => {
                        setProcessing(false);
                        Swal.fire({ title: 'เกิดข้อผิดพลาด', icon: 'error', didOpen: () => { Swal.getContainer().style.zIndex = '9999'; } });
                    }
                });
            }
        });
    };

    const RenderStatus = ({ status }) => {
        let color = 'default';
        let label = status;
        if (status === 'active') { color = 'warning'; label = 'รอตรวจสอบ'; }
        else if (status === 'complete') { color = 'success'; label = 'รับของแล้ว'; }
        else if (status === 'partial') { color = 'error'; label = 'รับไม่ครบ'; }
        return <Chip label={label} color={color} size="small" variant="filled" />;
    };

    return (
        <AuthenticatedLayout headTitle="ตรวจสอบรับอะไหล่คืน (Account)">
            <div className='p-6 lg:p-12'>
                <h1 className='mb-4 text-2xl font-bold text-gray-800'>รับอะไหล่คืน (บัญชี)</h1>
                <Head title="รายการรับอะไหล่คืน" />

                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        {/* --- FILTER PANEL --- */}
                        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                            <Grid2 container spacing={2} alignItems="center">
                                <Grid2 size={{ xs: 12, md: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Inventory2 color="primary" /> Inbox ({filteredJobs.length})
                                    </Typography>
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth size="small"
                                        placeholder="ค้นหาเลขที่รับคืน/ใบเคลม..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="status-filter-label">สถานะ</InputLabel>
                                        <Select
                                            labelId="status-filter-label"
                                            value={statusFilter}
                                            label="สถานะ"
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            startAdornment={<FilterList fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                                        >
                                            <MenuItem value="all">ทั้งหมด</MenuItem>
                                            <MenuItem value="active">รอตรวจสอบ</MenuItem>
                                            <MenuItem value="complete">รับของแล้ว</MenuItem>
                                            <MenuItem value="partial">รับไม่ครบ</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid2>

                                <Box flexGrow={1} />

                                <Grid2 size={{ xs: 12, md: 'auto' }}>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant={filterStatus === 'active' ? "contained" : "outlined"}
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                                router.get(route('accounting.return.index'), { status: 'active' });
                                            }}
                                        >
                                            รายการรอตรวจสอบ
                                        </Button>
                                        <Button
                                            variant={filterStatus === 'complete' ? "contained" : "outlined"}
                                            color="success"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                                router.get(route('accounting.return.index'), { status: 'complete' });
                                            }}
                                        >
                                            กลุ่มประวัติการตรวจสอบ
                                        </Button>
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        </Paper>

                        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>เลขที่ใบรับคืน</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>อ้างอิงใบเคลม</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ผู้ส่ง (Sales)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>วันที่ส่ง</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>การจัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredJobs.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>ไม่พบรายการที่ตรงตามเงื่อนไข</TableCell></TableRow>
                                    ) : (
                                        filteredJobs.map((job) => (
                                            <TableRow key={job.id} hover>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{job.return_job_no}</TableCell>
                                                <TableCell>{job.claim_id}</TableCell>
                                                <TableCell>{job.receive_by_sale || '-'}</TableCell>
                                                <TableCell>{DateFormatTh({ date: job.created_at })}</TableCell>
                                                <TableCell align="center">{job.details?.length || 0} รายการ</TableCell>
                                                <TableCell align="center"><RenderStatus status={job.status} /></TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant={job.status === 'active' ? "contained" : "outlined"}
                                                        size="small"
                                                        onClick={() => handleCheck(job)}
                                                        startIcon={job.status === 'active' ? <AssignmentTurnedIn /> : <RemoveRedEye />}
                                                    >
                                                        {job.status === 'active' ? "ตรวจสอบ" : "รายละเอียด"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>
                </Grid2>

                {/* --- Dialog (โค้ดส่วนเดิมที่มี Drag & Drop และแยก Remark) --- */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
                    <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Inventory2 /> ตรวจสอบใบรับคืน : {selectedJob?.return_job_no}
                        </Box>
                        <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}><Close /></IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        {selectedJob && (
                            <Grid2 container spacing={3}>
                                {/* ส่วนของเซลล์ */}
                                <Grid2 size={12}>
                                    <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'bold' }}>
                                        <HistoryEdu fontSize="small" /> 1. ข้อมูลการส่งคืนจากเซลล์
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8faff', borderLeft: '4px solid #1976d2' }}>
                                        <Grid2 container spacing={2}>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <Typography variant="caption" color="text.secondary">หมายเหตุจากเซลล์</Typography>
                                                {/* เปลี่ยนเป็น sales_remark_actual */}
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{selectedJob.sales_remark_actual}</Typography>
                                            </Grid2>
                                            <Grid2 size={12}>
                                                <Typography variant="caption" color="text.secondary">รูปภาพแนบจากเซลล์</Typography>
                                                <Stack direction="row" spacing={1.5} mt={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                                    {selectedJob.sales_files?.length > 0 ? selectedJob.sales_files.map((file, i) => (
                                                        <Box key={i} component="img"
                                                            src={`/storage/${file.file_path}`}
                                                            sx={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 2, border: '1px solid #ddd', cursor: 'pointer' }}
                                                            onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                                        />
                                                    )) : <Typography variant="caption" color="text.disabled">ไม่มีรูปภาพประกอบ</Typography>}
                                                </Stack>
                                            </Grid2>
                                        </Grid2>
                                    </Paper>
                                </Grid2>

                                {/* ส่วนตารางสินค้า */}
                                <Grid2 size={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>2. ตรวจสอบจำนวนสินค้า</Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableRow>
                                                    <TableCell>รหัสสินค้า / ชื่อ</TableCell>
                                                    <TableCell align="center">หน่วย</TableCell>
                                                    <TableCell align="center">จำนวนส่งมา</TableCell>
                                                    <TableCell align="center" width="160px" sx={{ bgcolor: '#fff3e0', fontWeight: 'bold' }}>รับจริง</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groupedDetails.map((group) => {
                                                    const currentInput = groupedQuantities[group.sp_code] ?? group.total_qty;
                                                    const isLost = currentInput < group.total_qty;
                                                    const isLostReadonly = group.total_rc_account < group.total_qty;
                                                    return (
                                                        <TableRow key={group.sp_code}>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="bold">{group.sp_code}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{group.sp_name}</Typography>
                                                            </TableCell>
                                                            <TableCell align="center">{group.unit}</TableCell>
                                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{group.total_qty}</TableCell>
                                                            <TableCell align="center" sx={{ bgcolor: (selectedJob.status === 'active' && isLost) ? '#fff3e0' : 'inherit' }}>
                                                                {selectedJob.status === 'active' ? (
                                                                    <TextField
                                                                        type="number" size="small" fullWidth value={currentInput}
                                                                        onChange={(e) => handleChangeGroupQty(group.sp_code, e.target.value, group.total_qty, group.items)}
                                                                        inputProps={{ style: { textAlign: 'center', fontWeight: 'bold', color: isLost ? '#ed6c02' : '#2e7d32' } }}
                                                                    />
                                                                ) : (
                                                                    <Typography fontWeight="bold" color={isLostReadonly ? 'error.main' : 'success.main'} sx={{ fontSize: '1.1rem' }}>
                                                                        {group.total_rc_account}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid2>

                                {/* ส่วนของบัญชี (History) */}
                                {selectedJob.status !== 'active' && (
                                    <Grid2 size={12}>
                                        <Typography variant="subtitle2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'bold' }}>
                                            <AdminPanelSettings fontSize="small" /> 3. ผลการตรวจสอบโดยบัญชี
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f6fff6', borderLeft: '4px solid #2e7d32' }}>
                                            <Grid2 container spacing={2}>
                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                    <Typography variant="caption" color="text.secondary">หมายเหตุการตรวจสอบ</Typography>
                                                    {/* เปลี่ยนเป็น acc_remark_actual */}
                                                    <Typography variant="body2" fontWeight="bold">{selectedJob.acc_remark_actual}</Typography>
                                                </Grid2>
                                                <Grid2 size={12}>
                                                    <Typography variant="caption" color="text.secondary">หลักฐานรูปภาพจากบัญชี</Typography>
                                                    <Stack direction="row" spacing={1.5} mt={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                                        {selectedJob.acc_files_actual?.length > 0 ? selectedJob.acc_files_actual.map((file, i) => (
                                                            <Box key={i} component="img"
                                                                src={`/storage/${file.file_path}`}
                                                                sx={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 2, border: '1px solid #2e7d32', cursor: 'pointer' }}
                                                                onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                                            />
                                                        )) : <Typography variant="caption" color="text.disabled">ไม่มีรูปภาพแนบ</Typography>}
                                                    </Stack>
                                                </Grid2>
                                            </Grid2>
                                        </Paper>
                                    </Grid2>
                                )}

                                {/* Input ของบัญชี (Active) */}
                                {selectedJob.status === 'active' && (
                                    <Grid2 size={12}>
                                        <Divider sx={{ mb: 3 }} />
                                        {!isFullReceive && (
                                            <Alert severity="warning" variant="filled" sx={{ mb: 2 }}>
                                                <strong>คำเตือน:</strong> ยอดรับไม่ครบตามจำนวนที่เซลล์รับอะไหล่ ระบบจะปิดงานทันทีและไม่สามารถแก้ไขได้  
                                            </Alert>
                                        )}
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>📸 แนบรูปหลักฐาน (optional):</Typography>
                                        <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} sx={{ border: isDragging ? '2px dashed #1976d2' : '1px dashed #ccc', borderRadius: 2, p: 2, bgcolor: isDragging ? '#e3f2fd' : '#fafafa', position: 'relative', minHeight: 120 }}>
                                            {isDragging && <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(25, 118, 210, 0.1)', zIndex: 10 }}><Typography color="primary" fontWeight="bold">ปล่อยเพื่อวาง</Typography></Box>}
                                            <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                                {accPreviews.map((url, index) => (
                                                    <Box key={index} sx={{ position: 'relative', width: 90, height: 90 }}>
                                                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', border: '1px solid #ccc' }}><Close fontSize="small" color="error" /></IconButton>
                                                    </Box>
                                                ))}
                                                <Button component="label" variant="outlined" sx={{ width: 90, height: 90, borderStyle: 'dashed', flexDirection: 'column' }}><CameraAlt /><Typography variant="caption">เพิ่มรูป</Typography><VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} /></Button>
                                            </Stack>
                                        </Box>
                                        <TextField label="หมายเหตุการรับของ (optional)" multiline rows={3} fullWidth value={accRemark} onChange={(e) => setAccRemark(e.target.value)} placeholder="รายละเอียดเพิ่มเติมถึงฝ่ายขาย" sx={{ mt: 1 }} />
                                    </Grid2>
                                )}
                            </Grid2>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                        <Button onClick={handleCloseDialog} color="inherit" variant="outlined" disabled={processing}>ยกเลิก</Button>
                        {selectedJob?.status === 'active' && (
                            <Button onClick={handleSubmit} variant="contained" color={isFullReceive ? "success" : "warning"} startIcon={isFullReceive ? <CheckCircle /> : <ReportProblem />} disabled={processing} sx={{ px: 4 }}>ยืนยันรับของ (Close)</Button>
                        )}
                    </DialogActions>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}