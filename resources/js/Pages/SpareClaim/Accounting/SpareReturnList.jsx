
import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, Button, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid2, Divider, IconButton, Alert, Stack,
    TableContainer, InputAdornment, MenuItem, FormControl, InputLabel, Select,
    Collapse, Tooltip, Popover
} from '@mui/material';
import {
    CheckCircle, Cancel, RemoveRedEye, Close, Warning,
    Inventory2, AssignmentTurnedIn, ReportProblem,
    CloudUpload, CameraAlt, Image as ImageIcon,
    HistoryEdu, AdminPanelSettings, Search, FilterList,
    KeyboardArrowDown, KeyboardArrowUp, Info as InfoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// --- Styled Components ---
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

// --- Sub-Component: Row สำหรับแสดงรายการแบบ Accordion ---
const AccountVerifyRow = ({
    group,
    groupedQuantities,
    receiveQuantities,
    handleChangeGroupQty,
    handleItemQtyChange,
    status,
    setPreviewImage
}) => {
    const [open, setOpen] = useState(false);

    const spImage = import.meta.env.VITE_IMAGE_SP_NEW + group.sp_code + '.jpg';
    const imageNotFound = (e) => { e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT; }

    // --- คำนวณยอดคงเหลือของ Group ---
    const groupTotalReceived = group.total_rc_account || 0;
    const groupRemaining = group.total_qty - groupTotalReceived;

    // ค่า Input ปัจจุบัน
    const currentGroupInput = groupedQuantities[group.sp_code] ?? groupRemaining;

    // สถานะ
    const isReadOnly = status === 'complete';
    const isLost = (currentGroupInput + groupTotalReceived) < group.total_qty;
    const isLostReadonly = groupTotalReceived < group.total_qty;

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: open ? '#f5f5f5' : 'inherit' }}>
                <TableCell width="40px" align="center">
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell width="80px" align="center">
                    <Box
                        onClick={() => setPreviewImage(spImage)}
                        sx={{
                            width: 50, height: 50, borderRadius: 1, border: '1px solid #eee',
                            overflow: 'hidden', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', bgcolor: 'white',
                            cursor: 'pointer', // ให้เปลี่ยนเป็นรูปมือ
                            '&:hover': { transform: 'scale(1.1)', transition: '0.2s' } // เพิ่ม effect เล็กน้อย
                        }}
                    >
                        <img
                            src={spImage}
                            onError={imageNotFound}
                            alt={group.sp_code}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </Box>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" fontWeight="bold">{group.sp_code}</Typography>
                    <Typography variant="caption" color="text.secondary">{group.sp_name}</Typography>
                </TableCell>
                <TableCell align="center">{group.unit}</TableCell>
                <TableCell align="center">
                    <Typography variant="body2">{group.total_qty}</Typography>
                    {groupTotalReceived > 0 && (
                        <Typography variant="caption" color="success.main" display="block">
                            (รับแล้ว {groupTotalReceived})
                        </Typography>
                    )}
                </TableCell>
                <TableCell align="center" sx={{ bgcolor: (!isReadOnly && isLost) ? '#fff3e0' : 'inherit', width: '150px' }}>
                    {!isReadOnly ? (
                        <TextField
                            type="number" size="small" fullWidth
                            value={currentGroupInput}
                            // แก้ไข: ส่ง groupRemaining ไปเป็น Max
                            onChange={(e) => handleChangeGroupQty(group.sp_code, e.target.value, groupRemaining, group.items)}
                            placeholder="เพิ่ม"
                            inputProps={{
                                style: { textAlign: 'center', fontWeight: 'bold', color: isLost ? '#ed6c02' : '#2e7d32' },
                                min: 0,
                                max: groupRemaining // ล็อกไม่ให้เกินยอดที่เหลือ
                            }}
                        />
                    ) : (
                        <Typography fontWeight="bold" color={isLostReadonly ? 'error.main' : 'success.main'} sx={{ fontSize: '1.1rem' }}>
                            {group.total_rc_account}
                        </Typography>
                    )}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, ml: { xs: 0, md: 6 }, p: 0, bgcolor: 'white', borderRadius: 2, border: '1px dashed #ccc' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Job No</TableCell>
                                        <TableCell>Serial</TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                ส่งมา: {group.total_qty} <br />
                                                <small>(รับแล้ว: {groupTotalReceived})</small>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" width="120px" sx={{ bgcolor: '#fff3e0' }}>รับเพิ่ม (ระบุเอง)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {group.items.map((detail) => {
                                        // --- คำนวณยอดคงเหลือราย Item ---
                                        const itemReceived = detail.account_rc_qty || 0;
                                        const itemRemaining = detail.qty - itemReceived;
                                        const currentItemInput = receiveQuantities[detail.id] ?? itemRemaining;

                                        const jobId = detail.original_claim_detail?.job_id || 'N/A';
                                        const serialId = detail.original_claim_detail?.serial_id || '-';

                                        return (
                                            <TableRow key={detail.id}>
                                                <TableCell component="th" scope="row">{jobId}</TableCell>
                                                <TableCell>{serialId}</TableCell>
                                                <TableCell align="center">
                                                    {detail.qty} <br />
                                                    {itemReceived > 0 && <span style={{ fontSize: '0.75rem', color: 'green' }}>(รับแล้ว {itemReceived})</span>}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {!isReadOnly ? (
                                                        <TextField
                                                            type="number" size="small"
                                                            value={currentItemInput}
                                                            // แก้ไข: ส่ง itemRemaining ไปเป็น Max
                                                            onChange={(e) => handleItemQtyChange(detail.id, e.target.value, itemRemaining, group.sp_code, group.items)}
                                                            inputProps={{
                                                                style: { textAlign: 'center' },
                                                                min: 0,
                                                                max: itemRemaining // ล็อกรายตัวไม่ให้เกินที่เหลือ
                                                            }}
                                                            sx={{ bgcolor: 'white' }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {detail.account_rc_qty}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

// --- Main Component ---
export default function SpareReturnList({ jobs, filterStatus }) {
    // --- State ---
    const [selectedJob, setSelectedJob] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [receiveQuantities, setReceiveQuantities] = useState({});
    const [groupedQuantities, setGroupedQuantities] = useState({});

    const [processing, setProcessing] = useState(false);
    const [accRemark, setAccRemark] = useState('');
    const [accFiles, setAccFiles] = useState([]);
    const [accPreviews, setAccPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const openPopover = Boolean(anchorEl);

    const filteredJobs = useMemo(() => {
        const cleanSearch = searchTerm.trim().toLowerCase();
        return jobs.filter(job => {
            // 1. ค้นหาจากระดับ Header (เลขที่รับคืน, ใบเคลม)
            const matchesHeader =
                job.return_job_no.toLowerCase().includes(cleanSearch) ||
                job.claim_id.toLowerCase().includes(cleanSearch);

            // 2. ค้นหาจากระดับ Details (เลข JOB)
            // ใช้ .some() เพื่อเช็คว่ามี item ไหนใน details ที่มี job_id ตรงกับคำค้นหาหรือไม่
            const matchesJobNo = job.details?.some(dt =>
                dt.original_claim_detail?.job_id?.toLowerCase().includes(cleanSearch)
            );

            const matchesSearch = !cleanSearch || matchesHeader || matchesJobNo;

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
    // const handleCheck = (job) => {
    //     setSelectedJob(job);
    //     setAccRemark('');
    //     setAccFiles([]);
    //     setAccPreviews([]);
    //     const initialQty = {};
    //     const groups = {};
    //     job.details.forEach(dt => {
    //         initialQty[dt.id] = dt.qty; // Default ให้รับครบ
    //         if (!groups[dt.sp_code]) groups[dt.sp_code] = 0;
    //         groups[dt.sp_code] += dt.qty;
    //     });
    //     setReceiveQuantities(initialQty);
    //     setGroupedQuantities(groups);
    //     setOpenDialog(true);
    // };

    const handleCheck = (job) => {
        setSelectedJob(job);
        setAccRemark('');
        setAccFiles([]);
        setAccPreviews([]);
        const initialQty = {};
        const groups = {};
        job.details.forEach(dt => {
            // คำนวณจำนวนที่เหลือ: ยอดส่งมา - ยอดที่บัญชีเคยรับไปแล้ว
            const remaining = dt.qty - (dt.account_rc_qty || 0);

            // ให้ Default ในช่อง Input เป็นจำนวนที่ยังค้างอยู่
            initialQty[dt.id] = remaining;

            if (!groups[dt.sp_code]) groups[dt.sp_code] = 0;
            groups[dt.sp_code] += remaining;
        });

        setReceiveQuantities(initialQty);
        setGroupedQuantities(groups);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setTimeout(() => setSelectedJob(null), 300);
    };

    // เปลี่ยนยอดรวม Group -> กระจายลง Item รายตัว (FIFO)
    const handleChangeGroupQty = (sp_code, val, maxGroupQty, itemsInGroup) => {
        let inputVal = parseInt(val);
        if (isNaN(inputVal) || inputVal < 0) inputVal = 0;

        // ป้องกันไม่ให้กรอกเกินยอดรวมที่เหลือ
        if (inputVal > maxGroupQty) inputVal = maxGroupQty;

        setGroupedQuantities(prev => ({ ...prev, [sp_code]: inputVal }));

        let remainingToDistribute = inputVal;
        const newReceiveQuantities = { ...receiveQuantities };

        itemsInGroup.forEach(item => {
            // คำนวณพื้นที่ว่างที่เหลือของ Item นี้
            const alreadyReceived = item.account_rc_qty || 0;
            const itemCapacity = item.qty - alreadyReceived;

            if (remainingToDistribute > 0) {
                if (remainingToDistribute >= itemCapacity) {
                    // ถ้าสิทธิ์ที่เหลือ มากกว่าหรือเท่ากับที่ว่าง -> ให้เติมเต็มที่ว่าง
                    newReceiveQuantities[item.id] = itemCapacity;
                    remainingToDistribute -= itemCapacity;
                } else {
                    // ถ้าสิทธิ์ที่เหลือ น้อยกว่าที่ว่าง -> ให้ใส่เท่าที่เหลือ
                    newReceiveQuantities[item.id] = remainingToDistribute;
                    remainingToDistribute = 0;
                }
            } else {
                // ถ้าไม่มีสิทธิ์เหลือแล้ว -> ใส่ 0
                newReceiveQuantities[item.id] = 0;
            }
        });

        setReceiveQuantities(newReceiveQuantities);
    };

    // เปลี่ยนยอด Item รายตัว -> อัปเดตยอดรวม Group
    const handleItemQtyChange = (itemId, val, maxQty, sp_code, itemsInGroup) => {
        let inputVal = parseInt(val);
        if (isNaN(inputVal) || inputVal < 0) inputVal = 0;
        if (inputVal > maxQty) inputVal = maxQty;

        // 1. อัปเดตรายตัว
        const newReceiveQuantities = { ...receiveQuantities, [itemId]: inputVal };
        setReceiveQuantities(newReceiveQuantities);

        // 2. คำนวณผลรวมใหม่ของ Group นั้น
        const newGroupTotal = itemsInGroup.reduce((sum, item) => {
            const qty = item.id === itemId ? inputVal : (newReceiveQuantities[item.id] ?? 0);
            return sum + qty;
        }, 0);

        setGroupedQuantities(prev => ({ ...prev, [sp_code]: newGroupTotal }));
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
        // 1. คำนวณตัวเลขสรุปก่อนแสดง Alert
        let totalSent = 0;          // จำนวนที่เซลล์ส่งมาทั้งหมด
        let totalPrevReceived = 0;  // จำนวนที่บัญชีเคยรับไปแล้ว (ใน DB)
        let totalAddingNow = 0;     // จำนวนที่กำลังจะบันทึกเพิ่มในครั้งนี้

        selectedJob.details.forEach(dt => {
            totalSent += dt.qty;
            totalPrevReceived += (dt.account_rc_qty || 0);

            // ดึงค่าจาก State ถ้าไม่มีให้ใช้ค่า Default (ที่คำนวณไว้ตอน handleCheck)
            // หรือถ้า User ไม่ได้แก้อะไรเลย ก็ถือว่าเป็น 0 หรือค่าที่เหลืออยู่
            const val = receiveQuantities[dt.id];
            totalAddingNow += (parseInt(val) || 0);
        });

        const totalNewAccumulated = totalPrevReceived + totalAddingNow; // ยอดสะสมใหม่
        const isJobDone = totalNewAccumulated >= totalSent; // รับครบแล้วหรือยัง?

        // 2. กำหนดข้อความที่จะแสดงตามเงื่อนไข 4 ข้อ
        let title = "";
        let htmlText = "";
        let iconType = "question";
        let confirmColor = "#1976d2";

        if (selectedJob.status === 'active') {
            // --- กรณี: กดรับครั้งแรก ---
            if (isJobDone) {
                // เงื่อนไขที่ 2: กดรับครบ (ครั้งแรก)
                title = "ยืนยันการรับสินค้า";
                htmlText = `คุณตรวจสอบสินค้าครบทั้งหมด <b>${totalSent}</b> ชิ้นแล้ว<br/><br/>สถานะงานจะเปลี่ยนเป็น <b style="color:green">Complete</b>`;
                confirmColor = "#2e7d32"; // Green
                iconType = "success";
            } else {
                // เงื่อนไขที่ 1: กดรับไม่ครบ (ครั้งแรก)
                title = "ยืนยันการรับสินค้า (Partial)";
                htmlText = `คุณกำลังรับของ <b>${totalAddingNow}</b> ชิ้น (จาก ${totalSent})
                            <small style="color:#d32f2f">ยังขาดอีก ${totalSent - totalAddingNow} ชิ้น</small><br/><br/>
                            สถานะงานจะเป็น <b style="color:orange">Partial</b> (สามารถมารับเพิ่มทีหลังได้)`;
                confirmColor = "#2e7d32"; // Orange
                iconType = "warning";
            }
        } else {
            // --- กรณี: มารับเพิ่ม (สถานะเดิมคือ Partial) ---
            if (isJobDone) {
                // เงื่อนไขที่ 4: รับเพิ่ม จนครบ
                title = "ยืนยันการรับเพิ่ม";
                htmlText = `รับเพิ่มครั้งนี้: <b>${totalAddingNow}</b> ชิ้น<br/>
                            รวมสะสม: <b>${totalNewAccumulated} / ${totalSent}</b> ชิ้น<br/>
                           <br/>
                            สินค้าครบตามจำนวนแล้ว! สถานะจะเปลี่ยนเป็น <b style="color:green">Complete</b>`;
                confirmColor = "#2e7d32"; // Green
                iconType = "success";
            } else {
                // เงื่อนไขที่ 3: รับเพิ่ม แต่ยังไม่ครบ
                title = "ยืนยันการรับเพิ่ม (ยังไม่ครบ)";
                htmlText = `รับเพิ่มครั้งนี้: <b>${totalAddingNow}</b> ชิ้น<br/>
                            รวมสะสม: <b>${totalNewAccumulated} / ${totalSent}</b> ชิ้น
                            <small style="color:#d32f2f">ยังขาดอีก ${totalSent - totalNewAccumulated} ชิ้น</small><br/><br/>
                            สถานะจะยังคงเป็น <b style="color:orange">Partial</b>`;
                confirmColor = "#ed6c02"; // Orange
                iconType = "info";
            }
        }

        // 3. แสดง SweetAlert
        Swal.fire({
            title: title,
            html: htmlText, // ใช้ html แทน text เพื่อจัดรูปแบบตัวหนา/สี
            icon: iconType,
            showCancelButton: true,
            confirmButtonColor: confirmColor,
            cancelButtonColor: '#d33',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ตรวจสอบใหม่',
            reverseButtons: false, // สลับปุ่มให้ Confirm อยู่ขวา (หรือซ้ายแล้วแต่ Design System)
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
                    is_full_receive: isJobDone, // ส่งไปบอก Backend ด้วย (แม้ Backend จะคำนวณเองอีกรอบ)
                    remark: accRemark,
                    files: accFiles
                }, {
                    forceFormData: true,
                    onSuccess: () => {
                        setProcessing(false);
                        handleCloseDialog();
                        Swal.fire({
                            title: 'บันทึกสำเร็จ',
                            text: isJobDone ? 'ปิดงานเรียบร้อยแล้ว' : 'บันทึกยอดรับเพิ่มเรียบร้อย',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            didOpen: () => { Swal.getContainer().style.zIndex = '9999'; }
                        });
                    },
                    onError: () => {
                        setProcessing(false);
                        Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่', icon: 'error', didOpen: () => { Swal.getContainer().style.zIndex = '9999'; } });
                    }
                });
            }
        });
    };

    const summary = useMemo(() => {
        if (!selectedJob) return { isFull: false, missing: 0, adding: 0 };

        let totalSent = 0;
        let totalPrev = 0;
        let totalAdding = 0;

        selectedJob.details.forEach(dt => {
            totalSent += dt.qty;
            totalPrev += (dt.account_rc_qty || 0);
            // แปลงค่าจาก Input เป็นตัวเลข
            totalAdding += (parseInt(receiveQuantities[dt.id]) || 0);
        });

        const totalAccumulated = totalPrev + totalAdding;

        return {
            isFull: totalAccumulated >= totalSent, // ครบไหม?
            missing: totalSent - totalAccumulated, // ขาดอีกเท่าไหร่?
            adding: totalAdding // ครั้งนี้กำลังกรอกรับกี่ชิ้น?
        };
    }, [selectedJob, receiveQuantities]);

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
                <Button
                    sx={{ mb: 2 }}
                    // variant="contained"
                    onClick={() => {
                        router.get(route('spareClaim.history'));
                    }}
                >
                    กลับไปยังหน้าตรวจสอบ
                </Button>
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
                                        // แก้ไข placeholder ให้สื่อสารชัดเจนขึ้น
                                        placeholder="ค้นหาเลขที่รับคืน / ใบเคลม / เลข JOB..."
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

                                {/* ปุ่ม Icon Info */}
                                <IconButton size="small" onClick={handlePopoverOpen} color="primary">
                                    <InfoIcon fontSize="small" />
                                </IconButton>

                                {/* เนื้อหาที่จะแสดงเมื่อคลิก */}
                                <Popover
                                    open={openPopover}
                                    anchorEl={anchorEl}
                                    onClose={handlePopoverClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <Box sx={{ p: 2, maxWidth: 300 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                            คำแนะนำการใช้งาน
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            - คุณสามารถค้นหาได้จาก เลขที่ใบเคลม, เลข JOB หรือ เลขใบ RT<br />
                                            - คุณสามารถตรวจสอบรายการรอตรวจสอบที่แท็บ<b> รายการรอตรวจสอบ </b><br />
                                            - คุณสามารถดูประวัติการตรวจสอบที่แท็บ<b> กลุ่มประวัติการตรวจสอบ </b> และคุณสามารถรับอะไหล่เพิ่มในเอกสารที่ <b> รับไม่ครบ </b>ได้ในแท็บนี้ได้
                                        </Typography>
                                    </Box>
                                </Popover>
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
                                                    {/* <Button
                                                        variant={job.status === 'active' ? "contained" : "outlined"}
                                                        size="small"
                                                        onClick={() => handleCheck(job)}
                                                        startIcon={job.status === 'active' ? <AssignmentTurnedIn /> : <RemoveRedEye />}
                                                    >
                                                        {job.status === 'active' ? "ตรวจสอบ" : "รายละเอียด"}
                                                    </Button> */}
                                                    <Button
                                                        // ยอมให้สถานะ active และ partial กดเข้าไปจัดการได้
                                                        variant={(job.status === 'active' || job.status === 'partial') ? "contained" : "outlined"}
                                                        size="small"
                                                        onClick={() => handleCheck(job)}
                                                        startIcon={(job.status === 'active' || job.status === 'partial') ? <AssignmentTurnedIn /> : <RemoveRedEye />}
                                                        color={job.status === 'partial' ? "warning" : "primary"}
                                                    >
                                                        {(job.status === 'active' || job.status === 'partial') ? "ตรวจสอบ/รับเพิ่ม" : "รายละเอียด"}
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

                {/* --- Dialog (แก้ไขส่วนนี้) --- */}
                {/* --- Dialog --- */}
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
                                {/* 1. ส่วนของเซลล์ (แสดงเสมอ) */}
                                <Grid2 size={12}>
                                    <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'bold' }}>
                                        <HistoryEdu fontSize="small" /> 1. ข้อมูลการส่งคืนจากเซลล์
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8faff', borderLeft: '4px solid #1976d2' }}>
                                        {/* ... (โค้ดส่วนแสดงข้อมูลเซลล์ เหมือนเดิม) ... */}
                                        <Grid2 container spacing={2}>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <Typography variant="caption" color="text.secondary">หมายเหตุจากเซลล์</Typography>
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

                                {/* 2. ส่วนตารางสินค้า (แสดงเสมอ) */}
                                <Grid2 size={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>2. ตรวจสอบจำนวนสินค้า</Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableRow>
                                                    <TableCell width="40px" />
                                                    <TableCell align="center">รูปภาพ</TableCell>
                                                    <TableCell>รหัสสินค้า / ชื่อ</TableCell>
                                                    <TableCell align="center">หน่วย</TableCell>
                                                    <TableCell align="center">จำนวนส่งมา</TableCell>
                                                    <TableCell align="center" width="160px" sx={{ bgcolor: '#fff3e0', fontWeight: 'bold' }}>รับจริง</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groupedDetails.map((group) => (
                                                    <AccountVerifyRow
                                                        key={group.sp_code}
                                                        group={group}
                                                        groupedQuantities={groupedQuantities}
                                                        receiveQuantities={receiveQuantities}
                                                        handleChangeGroupQty={handleChangeGroupQty}
                                                        handleItemQtyChange={handleItemQtyChange}
                                                        status={selectedJob.status}
                                                        setPreviewImage={setPreviewImage}
                                                    />
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid2>

                                {/* 3. ส่วนประวัติการตรวจสอบ (แสดงถ้าไม่ใช่ active) */}
                                {selectedJob.status !== 'active' && (
                                    <Grid2 size={12}>
                                        <Typography variant="subtitle2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'bold' }}>
                                            <AdminPanelSettings fontSize="small" /> 3. ประวัติการรับของ (ล่าสุด)
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f6fff6', borderLeft: '4px solid #2e7d32' }}>
                                            <Grid2 container spacing={2}>
                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                    <Typography variant="caption" color="text.secondary">หมายเหตุการตรวจสอบล่าสุด</Typography>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ whiteSpace: 'pre-line' }}>{selectedJob.acc_remark_actual}</Typography>
                                                </Grid2>
                                                <Grid2 size={12}>
                                                    <Typography variant="caption" color="text.secondary">หลักฐานรูปภาพจากบัญชี (ทั้งหมด)</Typography>
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

                                {/* 4. Input ของบัญชี (แสดงเมื่อ active หรือ partial) */}
                                {(selectedJob.status === 'active' || selectedJob.status === 'partial') && (
                                    <Grid2 size={12}>
                                        <Divider sx={{ mb: 1 }} />
                                        {/* {!isFullReceive && (
                                            <Alert severity="warning" variant="filled" sx={{ mb: 2 }}>
                                                <strong>คำเตือน:</strong> ยอดรับไม่ครบ ระบบจะบันทึกเป็น "รับไม่ครบ (Partial)" เพื่อให้มารับเพิ่มภายหลังได้
                                            </Alert>
                                        )} */}

                                        {/* กรณีที่ 1 & 3: รับยังไม่ครบ (Warning) */}
                                        {!summary.isFull && (
                                            <Alert severity="warning" variant="filled" sx={{ mb: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>
                                                        {selectedJob.status === 'active'
                                                            ? "⚠️ ยอดรับยังไม่ครบตามจำนวนที่ส่งมา"
                                                            : "⚠️ รับเพิ่มแล้วแต่ยังไม่ครบ"}
                                                    </strong>
                                                    <br />
                                                    - กำลังรับครั้งนี้: <strong>{summary.adding}</strong> ชิ้น
                                                    <br />
                                                    - ขาดอีก: <strong>{summary.missing}</strong> ชิ้น
                                                    <br />
                                                    - สถานะงานจะเป็น: <u>รับไม่ครบ (Partial)</u> {selectedJob.status === 'active' ? 'สามารถรับเพิ่มภายหลังได้' : '(ยังต้องมารับเพิ่มอีก)'}
                                                </Typography>
                                            </Alert>
                                        )}
                                        {/* กรณีที่ 2 & 4: รับครบแล้ว (Success) */}
                                        {summary.isFull && (
                                            <Alert severity="success" variant="filled" sx={{ mb: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>
                                                        {selectedJob.status === 'active'
                                                            ? "✅ ตรวจสอบสินค้าครบถ้วนแล้ว"
                                                            : "✅ รับเพิ่มจนครบจำนวนแล้ว"}
                                                    </strong>
                                                    <br />
                                                    {selectedJob.status === 'partial' && <span>- รับเพิ่มครั้งนี้: <strong>{summary.adding}</strong> ชิ้น<br /></span>}
                                                    - สถานะงานจะเป็น: <u>เสร็จสิ้น (Complete)</u> พร้อมปิดงาน
                                                </Typography>
                                            </Alert>
                                        )}
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>📸 แนบรูปหลักฐานเพิ่มเติม (optional):</Typography>
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
                                        <TextField
                                            label={selectedJob.status === 'partial' ? "หมายเหตุการรับเพิ่ม" : "หมายเหตุการรับของ"}
                                            multiline rows={3} fullWidth value={accRemark}
                                            onChange={(e) => setAccRemark(e.target.value)}
                                            placeholder="รายละเอียดเพิ่มเติม..." sx={{ mt: 1 }}
                                        />
                                    </Grid2>
                                )}
                            </Grid2>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                        <Button onClick={handleCloseDialog} color="inherit" variant="outlined" disabled={processing}>ยกเลิก</Button>
                        {/* แสดงปุ่มเมื่อ active หรือ partial */}
                        {(selectedJob?.status === 'active' || selectedJob?.status === 'partial') && (
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                color={isFullReceive ? "success" : "warning"}
                                startIcon={isFullReceive ? <CheckCircle /> : <ReportProblem />}
                                disabled={processing}
                                sx={{ px: 4 }}
                            >
                                {/* เปลี่ยนข้อความปุ่มตามสถานะ */}
                                {selectedJob.status === 'partial' ? 'ยืนยันรับเพิ่ม' : 'ยืนยันรับของ'}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={Boolean(previewImage)}
                    onClose={() => setPreviewImage(null)}
                    maxWidth="md"
                    sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' }, zIndex: 10000 }} // ให้ zIndex สูงกว่า Dialog ตรวจรับ
                >
                    <Box position="relative">
                        <IconButton
                            onClick={() => setPreviewImage(null)}
                            sx={{ position: 'absolute', right: 0, top: 0, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', m: 1 }}
                        >
                            <Close />
                        </IconButton>
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: 8, border: '2px solid white' }}
                        />
                    </Box>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}