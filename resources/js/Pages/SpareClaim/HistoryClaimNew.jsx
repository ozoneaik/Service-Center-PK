
import { router } from "@inertiajs/react";
import {
    Breadcrumbs, Button, Card, CardContent, Chip, Grid2, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, useMediaQuery, Box, Divider, Stack,
    Paper, Autocomplete, TextField, Dialog, DialogTitle, IconButton,
    DialogContent, DialogActions, Checkbox, Tooltip, Collapse
} from "@mui/material";
import {
    Close, CloudUpload, Info, PhotoCamera, RemoveRedEye, Save, CameraAlt,
    Image as ImageIcon, KeyboardArrowDown, KeyboardArrowUp
} from "@mui/icons-material";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import React, { useMemo, useState, useEffect } from "react";
import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";
import { styled } from '@mui/material/styles';

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

const TABLE_HEADER_STYLE = { backgroundColor: '#c7c7c7', fontWeight: 'bold', fontSize: 16 };

// --- Sub-Components ---

// 1. Row Component (สำหรับจัดการ Accordion/Grouping)
const Row = ({
    group,
    isReadOnly,
    selectedItems,
    handleCheckboxChange,
    handleGroupCheckboxChange,
    itemQuantities,
    handleQtyChange,
    setPreviewImage
}) => {
    const [open, setOpen] = useState(false); // State เปิด-ปิด Accordion

    // คำนวณยอดรวมของ Group
    const totalQty = group.items.reduce((sum, item) => sum + item.qty, 0);
    const totalRc = group.items.reduce((sum, item) => sum + (item.rc_qty || 0), 0);

    // ตรวจสอบว่า Group นี้รับของครบหมดแล้วหรือยัง
    const isFullyReceivedGroup = group.items.every(item => (item.rc_qty || 0) >= item.qty);

    // Logic สำหรับ Parent Checkbox
    // หา items ที่ยังรับไม่ครบ (Eligible)
    const eligibleItems = group.items.filter(item => (item.rc_qty || 0) < item.qty);
    // นับจำนวนที่ถูกเลือก
    const numSelected = eligibleItems.filter(item => selectedItems[item.id]).length;
    // สถานะ Checkbox
    const isGroupSelected = eligibleItems.length > 0 && numSelected === eligibleItems.length;
    const isGroupIndeterminate = numSelected > 0 && numSelected < eligibleItems.length;

    const spImage = import.meta.env.VITE_IMAGE_SP_NEW + group.sp_code + '.jpg';
    const imageNotFound = (e) => { e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT; }

    return (
        <React.Fragment>
            {/* --- Parent Row (หัวข้อ Group) --- */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: isFullyReceivedGroup ? '#e8f5e9' : '#f5f5f5' }}>
                <TableCell width="40px" padding="none" align="center">
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                {!isReadOnly && (
                    <TableCell padding="checkbox" align="center">
                        <Checkbox
                            indeterminate={isGroupIndeterminate}
                            checked={isGroupSelected}
                            onChange={(e) => handleGroupCheckboxChange(eligibleItems, e.target.checked)}
                            disabled={isFullyReceivedGroup || eligibleItems.length === 0}
                            color="primary"
                        />
                    </TableCell>
                )}
                <TableCell width="80px">
                    <Box width={50} height={50} onClick={() => setPreviewImage(spImage)}
                        sx={{
                            border: '1px solid #eee', borderRadius: 1, p: 0.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', cursor: 'pointer',
                            '&:hover': { transform: 'scale(1.1)', transition: '0.2s' }
                        }}>
                        <img src={spImage} onError={imageNotFound} alt={group.sp_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </Box>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" fontWeight="bold">{group.sp_code}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{group.sp_name}</Typography>
                </TableCell>
                <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">{totalQty} {group.sp_unit}</Typography>
                </TableCell>
                <TableCell align="center">
                    <Typography variant="body2" color={isFullyReceivedGroup ? 'success.main' : 'warning.main'} fontWeight="bold">
                        {totalRc} / {totalQty}
                    </Typography>
                </TableCell>
            </TableRow>

            {/* --- Child Row (ตารางย่อย Job List) --- */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, ml: { xs: 0, sm: 6 }, p: 1, bgcolor: 'white', borderRadius: 1, border: '1px dashed #ccc' }}>
                            <Typography variant="caption" gutterBottom component="div" fontWeight="bold" color="primary">
                                เลือก Job ที่ต้องการรับอะไหล่:
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        {!isReadOnly && <TableCell padding="checkbox"></TableCell>}
                                        <TableCell>Job No</TableCell>
                                        <TableCell>Serial</TableCell>
                                        <TableCell align="center">จำนวน</TableCell>
                                        <TableCell align="center" width="120px">ระบุจำนวนรับ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {group.items.map((detail) => {
                                        const received = detail.rc_qty || 0;
                                        const isFull = received >= detail.qty;
                                        const isChecked = selectedItems[detail.id] || false;

                                        return (
                                            <TableRow key={detail.id} hover selected={isChecked}>
                                                {!isReadOnly && (
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onChange={() => handleCheckboxChange(detail.id)}
                                                            disabled={isFull}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell component="th" scope="row">{detail.job_id}</TableCell>
                                                <TableCell>{detail.serial_id || '-'}</TableCell>
                                                <TableCell align="center">{detail.qty} {detail.unit} (รับแล้ว {received})</TableCell>
                                                <TableCell align="center">
                                                    {isReadOnly ? (
                                                        <Typography variant="body2" fontWeight="bold">{received}</Typography>
                                                    ) : (
                                                        <TextField
                                                            type="number" size="small"
                                                            value={itemQuantities[detail.id] || ''}
                                                            onChange={(e) => handleQtyChange(detail.id, e.target.value, detail.qty)}
                                                            disabled={!isChecked || isFull}
                                                            placeholder="1"
                                                            inputProps={{ min: 1, max: detail.qty, style: { textAlign: 'center' } }}
                                                            sx={{ bgcolor: isFull ? '#eee' : 'white' }}
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
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

// 2. ReceiveModal Component (Modal หลัก)
const ReceiveModal = ({
    open, onClose, selectedClaim, receiveForm, setReceiveForm, processing, onSubmit
}) => {
    const isReadOnly = selectedClaim?.receive_status === 'Y';
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedItems, setSelectedItems] = useState({}); // เก็บ ID ที่เลือก (Flat)
    const [itemQuantities, setItemQuantities] = useState({}); // เก็บจำนวน (Flat)

    // --- Logic การ Group Data ---
    const groupedList = useMemo(() => {
        if (!selectedClaim?.list) return [];
        const groups = {};
        selectedClaim.list.forEach(item => {
            if (!groups[item.sp_code]) {
                groups[item.sp_code] = {
                    sp_code: item.sp_code,
                    sp_name: item.sp_name,
                    sp_unit: item.unit,
                    items: [] // เก็บ array ของ Job ย่อย
                };
            }
            groups[item.sp_code].items.push(item);
        });
        return Object.values(groups);
    }, [selectedClaim]);

    // --- Logic สำหรับ Select All ---
    // 1. หาลิสต์สินค้าทั้งหมดที่ "ยังรับไม่ครบ" (Eligible)
    const allEligibleItems = useMemo(() => {
        return selectedClaim?.list?.filter(item => (item.rc_qty || 0) < item.qty) || [];
    }, [selectedClaim]);

    // 2. คำนวณสถานะ Checkbox All
    const numSelectedAll = allEligibleItems.filter(item => selectedItems[item.id]).length;
    const isAllSelected = allEligibleItems.length > 0 && numSelectedAll === allEligibleItems.length;
    const isIndeterminateAll = numSelectedAll > 0 && numSelectedAll < allEligibleItems.length;

    // 3. ฟังก์ชัน Handle Select All
    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        const newSelected = { ...selectedItems };
        allEligibleItems.forEach(item => {
            newSelected[item.id] = isChecked;
        });
        setSelectedItems(newSelected);
    };

    // Initial State เมื่อเปิด Modal
    useEffect(() => {
        if (open && selectedClaim?.list) {
            const initialSelected = {};
            const initialQty = {};
            selectedClaim.list.forEach(item => {
                const received = item.rc_qty || 0;
                const isFull = received >= item.qty;
                if (!isFull) {
                    initialSelected[item.id] = true; // Auto select รายการที่ยังไม่ครบ
                    initialQty[item.id] = item.qty;
                } else {
                    initialSelected[item.id] = false;
                    initialQty[item.id] = item.qty;
                }
            });
            setSelectedItems(initialSelected);
            setItemQuantities(initialQty);
        }
    }, [open, selectedClaim]);

    // Toggle Checkbox รายตัว
    const handleCheckboxChange = (id) => {
        setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Toggle Checkbox ทั้ง Group
    const handleGroupCheckboxChange = (itemsInGroup, isChecked) => {
        const newSelected = { ...selectedItems };
        itemsInGroup.forEach(item => {
            newSelected[item.id] = isChecked;
        });
        setSelectedItems(newSelected);
    };

    // เปลี่ยนจำนวน
    const handleQtyChange = (id, val, maxQty) => {
        if (val === '') {
            setItemQuantities(prev => ({ ...prev, [id]: '' }));
            return;
        }
        let value = parseInt(val);
        if (isNaN(value)) value = 1;
        if (value < 1) value = 1;
        if (value > maxQty) value = maxQty;
        setItemQuantities(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        // เตรียมข้อมูลส่งกลับ (แปลงจาก State Flat กลับเป็น Array)
        const itemsToSubmit = selectedClaim.list
            .filter(item => selectedItems[item.id])
            .map(item => ({
                id: item.id,
                qty: (itemQuantities[item.id] === '' || !itemQuantities[item.id]) ? 1 : itemQuantities[item.id]
            }));

        if (itemsToSubmit.length === 0) {
            alert("กรุณาเลือกรายการสินค้าอย่างน้อย 1 รายการ");
            return;
        }
        onSubmit(itemsToSubmit);
    };

    // Image Handlers
    const imageNotFound = (e) => { e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT; }
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length > 0) {
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setReceiveForm(prev => ({
                ...prev,
                images: [...prev.images, ...validFiles],
                previews: [...prev.previews, ...newPreviews]
            }));
        }
        e.target.value = '';
    };
    const handleRemoveImage = (index) => {
        setReceiveForm(prev => {
            const newImages = [...prev.images];
            const newPreviews = [...prev.previews];
            newImages.splice(index, 1);
            newPreviews.splice(index, 1);
            return { ...prev, images: newImages, previews: newPreviews };
        });
    };



    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: isReadOnly ? '#2e7d32' : '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={1}>
                    {isReadOnly ? <RemoveRedEye /> : <Info />}
                    {isReadOnly ? 'รายละเอียดการรับคืนอะไหล่ ' : 'ยืนยันรับคืนอะไหล่ '}
                    ({selectedClaim?.claim_id})
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        📦 รายการสินค้า (รวม {selectedClaim?.list?.length} jobs ใน {groupedList.length} รายการอะไหล่)
                    </Typography>

                    {/* ตารางแสดงผลแบบ Grouping */}
                    <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', bgcolor: '#fff' }}>
                        <Table stickyHeader aria-label="collapsible table">
                            <TableHead>
                                <TableRow>
                                    <TableCell width="40px" />
                                    {/* --- ส่วนที่แก้ไข: เพิ่ม Checkbox Select All --- */}
                                    {!isReadOnly && (
                                        <TableCell padding="checkbox" align="center">
                                            <Tooltip title="เลือกทั้งหมด / ยกเลิกทั้งหมด">
                                                <Checkbox
                                                    indeterminate={isIndeterminateAll}
                                                    checked={isAllSelected}
                                                    onChange={handleSelectAll}
                                                    disabled={allEligibleItems.length === 0}
                                                    color="default" // ใช้สี default หรือ primary ตามธีม
                                                />
                                            </Tooltip>
                                        </TableCell>
                                    )}
                                    {/* ------------------------------------------- */}
                                    <TableCell width="80px">รูปภาพ</TableCell>
                                    <TableCell>รหัส : รายการ</TableCell>
                                    <TableCell align="center">จำนวน</TableCell>
                                    <TableCell align="center">รับแล้ว</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupedList.map((group) => (
                                    <Row
                                        key={group.sp_code}
                                        group={group}
                                        isReadOnly={isReadOnly}
                                        selectedItems={selectedItems}
                                        handleCheckboxChange={handleCheckboxChange}
                                        handleGroupCheckboxChange={handleGroupCheckboxChange}
                                        itemQuantities={itemQuantities}
                                        handleQtyChange={handleQtyChange}
                                        setPreviewImage={setPreviewImage}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>

                    <Divider />
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">📸 หลักฐานรูปภาพ (จำเป็น*):</Typography>
                    <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 2, bgcolor: '#fafafa', minHeight: 150 }}>
                        {receiveForm.previews.length > 0 ? (
                            <Grid2 container spacing={1}>
                                {receiveForm.previews.map((url, index) => (
                                    <Grid2 key={index} size={4}>
                                        <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                                            <img src={url} alt={`preview-${index}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }} />
                                            {!isReadOnly && (
                                                <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', padding: '2px' }}><Close fontSize="small" /></IconButton>
                                            )}
                                        </Box>
                                    </Grid2>
                                ))}
                                {!isReadOnly && (
                                    <Grid2 size={4}>
                                        <Button component="label" variant="outlined" fullWidth sx={{ height: '100%', borderStyle: 'dashed', flexDirection: 'column' }}>
                                            <CameraAlt /> เพิ่มรูป
                                            <VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} />
                                        </Button>
                                    </Grid2>
                                )}
                            </Grid2>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                                <CloudUpload sx={{ fontSize: 48, color: '#bdbdbd' }} />
                                <Typography variant="caption" color="text.secondary" mb={2}>อัปโหลดรูปภาพหลักฐาน</Typography>
                                {!isReadOnly && (
                                    <Button component="label" variant="contained" startIcon={<ImageIcon />} size="small">
                                        เลือกรูปภาพ <VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} />
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* หมายเหตุ */}
                    <TextField
                        label="หมายเหตุเพิ่มเติม" multiline rows={2} fullWidth size="small"
                        value={receiveForm.remark} onChange={(e) => !isReadOnly && setReceiveForm(prev => ({ ...prev, remark: e.target.value }))}
                        InputProps={{ readOnly: isReadOnly, sx: { bgcolor: isReadOnly ? '#fafafa' : '#fff' } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">ปิด/ยกเลิก</Button>
                {!isReadOnly && (
                    <Button onClick={handleSave} variant="contained" color="success" startIcon={<Save />} disabled={processing || receiveForm.images.length === 0}>
                        {processing ? 'กำลังบันทึก...' : 'ยืนยันการรับของ'}
                    </Button>
                )}
            </DialogActions>

            {/* Dialog Preview Image */}
            <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md" sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' } }}>
                <Box position="relative">
                    <IconButton onClick={() => setPreviewImage(null)} sx={{ position: 'absolute', right: 0, top: 0, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', m: 1 }}><Close /></IconButton>
                    <img src={previewImage} onError={imageNotFound} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: 4 }} />
                </Box>
            </Dialog>
        </Dialog>
    );
};

// 3. Main Helper Components
const ReceiveStatusChip = ({ status }) => {
    if (status === 'Y') return <Chip size='small' variant="filled" color="success" label="Complete" sx={{ minWidth: '80px', fontWeight: 'bold' }} />;
    if (status === 'P') return <Chip size='small' variant="filled" color="warning" label="Partial" sx={{ minWidth: '80px', color: '#fff', fontWeight: 'bold' }} />;
    return <Chip size='small' variant="outlined" color="primary" label="Active" sx={{ minWidth: '80px', fontWeight: 'bold' }} />;
}

//chip แสดงเลข RT
const RTCHIP = ({ jobNo }) => {
    // ถ้าไม่มีเลขที่ใบ RT ไม่ต้องแสดงอะไรเลย หรือแสดงเป็น -
    if (!jobNo) return <Typography variant="body2" color="text.disabled">-</Typography>;

    return (
        <Chip
            label={jobNo}
            size="small"
            variant="filled"
            color="default"
            sx={{
                minWidth: '100px',
                // fontWeight: 'bold',
                fontFamily: 'monospace' // ใช้ font monospace จะทำให้อ่านรหัสภาษาอังกฤษผสมตัวเลขง่ายขึ้น
            }}
        />
    );
};

const StatusClaim = ({ status }) => {
    const status_formated = {
        'pending': { status: 'secondary', label: 'กำลังตรวจสอบคำขอเคลม' },
        'approved': { status: 'success', label: 'อนุมัติคำสั่งส่งเคลม' },
        'rejected': { status: 'error', label: 'ไม่อนุมัติ' },
        'กำลังจัดเตรียมสินค้า': { status: 'info', label: 'กำลังจัดเตรียมสินค้า' },
        'อยู่ระหว่างจัดส่ง': { status: 'warning', label: 'อยู่ระหว่างจัดส่ง' },
        'จัดส่งสำเร็จ': { status: 'success', label: 'จัดส่งสำเร็จ' },
    }[status] || { status: 'info', label: 'ไม่สามารถระบุได้' };
    return <Chip size='small' color={status_formated.status} label={status_formated.label} />
}

// 4. Main Page Component
export default function HistoryClaimNew({ history, shops, filters, isAdmin, areas, currentSale, userRole }) {
    const isMobile = useMediaQuery('(max-width:600px)');

    const [openModal, setOpenModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [receiveForm, setReceiveForm] = useState({
        images: [],
        previews: [],
        remark: ''
    });
    const [processing, setProcessing] = useState(false);

    const statusOptions = [
        { label: 'ทั้งหมด', value: '' },
        { label: 'กำลังตรวจสอบเอกสารเคลม', value: 'pending' },
        { label: 'อนุมัติคำสั่งส่งเคลม', value: 'approved' },
        { label: 'กำลังจัดเตรียมสินค้า', value: 'กำลังจัดเตรียมสินค้า' },
        { label: 'อยู่ระหว่างจัดส่ง', value: 'อยู่ระหว่างจัดส่ง' },
        { label: 'จัดส่งสำเร็จ', value: 'จัดส่งสำเร็จ' },
        { label: 'ไม่อนุมัติ', value: 'ไม่อนุมัติ' },
    ];

    const receiveStatusOptions = [
        { label: 'ทั้งหมด', value: 'all' },
        { label: 'Complete', value: 'Y' },
        { label: 'Partial', value: 'P' },
        { label: 'Active', value: 'N' },
    ];

    const handleOpenReceiveModal = (item) => {
        setSelectedClaim(item);
        // ถ้าสถานะเป็น Y (Complete) ให้ดึงข้อมูลหลักฐานมาโชว์
        const isCompleted = item.receive_status === 'Y';
        if (isCompleted && item.receive_evidence) {
            setReceiveForm({
                images: [],
                previews: item.receive_evidence.images || [],
                remark: item.receive_evidence.remark || ''
            });
        } else {
            setReceiveForm({ images: [], previews: [], remark: '' });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setTimeout(() => setSelectedClaim(null), 300);
    };

    const handleSubmitReceive = (itemsToSubmit) => {
        if (!selectedClaim || receiveForm.images.length === 0) {
            alert('กรุณาแนบรูปภาพหลักฐานอย่างน้อย 1 รูป');
            return;
        }
        setProcessing(true);
        const formData = new FormData();
        formData.append('claim_id', selectedClaim.claim_id);
        formData.append('remark', receiveForm.remark || '');
        receiveForm.images.forEach((file) => {
            formData.append('images[]', file);
        });
        itemsToSubmit.forEach((item, index) => {
            formData.append(`items[${index}][id]`, item.id);
            formData.append(`items[${index}][qty]`, item.qty);
        });
        router.post(route('spareClaim.updateReceiveStatus'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setProcessing(false);
                handleCloseModal();
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success', title: 'บันทึกสำเร็จ', text: 'บันทึกการรับอะไหล่เรียบร้อยแล้ว',
                        timer: 2000, showConfirmButton: false
                    });
                } else {
                    alert('บันทึกการรับอะไหล่เรียบร้อยแล้ว');
                }
            },
            onError: (err) => {
                setProcessing(false);
                console.error(err);
                const errorMsg = err.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
                alert(errorMsg);
            }
        });
    };

    const selectedShopData = useMemo(() => {
        if (!filters?.shop || !shops) return null;
        return shops.find(s => s.is_code_cust_id === filters.shop);
    }, [filters?.shop, shops]);

    const redirectToDetail = (claim_id) => {
        router.get(route('spareClaim.historyDetail', { claim_id }));
    }

    const accStatusOptions = [
        { label: 'ทั้งหมด', value: '' },
        { label: 'Active (รอตรวจ)', value: 'active' },
        { label: 'Partial (รับไม่ครบ)', value: 'partial' },
        { label: 'Complete (รับครบ)', value: 'complete' },
    ];

    const handleFilterChange = (key, value) => {
        // สร้าง Object ฟิลเตอร์พื้นฐานจากค่าปัจจุบัน
        let newFilters = {
            shop: filters?.shop || '',
            area: filters?.area || '',
            receive_status: filters?.receive_status || 'all',
            status: filters?.status || '',
            acc_status: filters?.acc_status || '',
            [key]: value
        };

        // --- Logic เพิ่มเติมสำหรับการเลือก "ร้านค้า" ---
        if (key === 'shop') {
            if (value) {
                // ค้นหาข้อมูลร้านค้าที่เลือกจากลิสต์ shops
                const selectedShop = shops.find(s => s.is_code_cust_id === value);
                if (selectedShop && selectedShop.sale_area_code) {
                    // ถ้าเจอร้านค้า และร้านนั้นมีรหัสเขตการขาย ให้ Update เขตการขายตามทันที
                    newFilters.area = selectedShop.sale_area_code;
                }
            }
        }

        // Logic เดิม: ถ้าเลือก "เขตการขาย" ใหม่ ให้ล้างค่าร้านค้าเดิมทิ้ง
        if (key === 'area') {
            newFilters.shop = '';
        }

        // ส่ง Request ไปที่ Backend
        router.get(route('spareClaim.history'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const canReceive = userRole === 'admin' || userRole === 'sale';
    const canSee = userRole === 'admin' || userRole === 'sale' || userRole === 'acc';
    const handleClearFilters = () => {
        router.get(route('spareClaim.history'), {
            shop: '',
            area: '',
            receive_status: 'all',
            status: '',
            acc_status: ''
        }, {
            preserveState: true,
            replace: true
        });
    };

    const AccountStatusChip = ({ status }) => {
        const config = {
            'active': { label: 'Active', color: 'primary', variant: 'outlined' },
            'partial': { label: 'Partial', color: 'warning', variant: 'filled' },
            'complete': { label: 'Complete', color: 'success', variant: 'filled' },
        };

        const current = config[status];
        if (!current) return <Typography variant="caption" color="text.disabled">Waiting</Typography>;

        return (
            <Chip
                label={current.label}
                color={current.color}
                variant={current.variant}
                size="small"
                sx={{ minWidth: '100px', fontWeight: 'bold' }}
            />
        );
    };

    function TableData() {
        return (
            <Table>
                <TableHead sx={TABLE_HEADER_STYLE}>
                    <TableRow>
                        <TableCell>เลขที่เอกสารเคลม</TableCell>
                        <TableCell>วันที่แจ้งเคลม</TableCell>
                        <TableCell>วันที่อัพเดท</TableCell>
                        <TableCell>สถานะเคลมอะไหล่</TableCell>
                        <TableCell align="center">สถานะเซลล์รับคืนอะไหล่</TableCell>
                        {canSee && <TableCell align="center">เลขที่ใบ RT</TableCell>}
                        {canSee && <TableCell align="center">สถานะบัญชีรับอะไหล่</TableCell>}
                        <TableCell align='center'>#</TableCell>
                        {canReceive && <TableCell align="center">รับอะไหล่</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.data.map((item) => {
                        const isReceived = item.receive_status === 'Y';
                        const isPartial = item.receive_status === 'P';
                        let btnColor = "warning"; // N
                        if (isPartial) btnColor = "info"; // P
                        if (isReceived) btnColor = "success"; // Y
                        return (
                            <TableRow key={item.id}>
                                <TableCell>{item.claim_id}</TableCell>
                                <TableCell>{DateFormatTh({ date: item.created_at })}</TableCell>
                                <TableCell>{DateFormatTh({ date: item.updated_at })}</TableCell>
                                <TableCell><StatusClaim status={item.status} /></TableCell>
                                <TableCell align="center"><ReceiveStatusChip status={item.receive_status || 'N'} /></TableCell>
                                {canSee && (
                                    <TableCell align="center">
                                        {/* ส่งค่า item.acc_job_no เข้าไปใน prop ชื่อ jobNo */}
                                        <RTCHIP jobNo={item.acc_job_no} />
                                    </TableCell>
                                )}
                                {canSee && (
                                    <TableCell TableCell align="center">
                                        <AccountStatusChip status={item.acc_status} />
                                    </TableCell>
                                )}
                                <TableCell align='center'>
                                    <Button onClick={() => redirectToDetail(item.claim_id)} variant='contained' size='small' startIcon={<RemoveRedEye />}>รายละเอียด</Button>
                                </TableCell>
                                {canReceive && <TableCell align="center">
                                    <Button
                                        onClick={() => handleOpenReceiveModal(item)}
                                        variant="contained" size="small"
                                        startIcon={isReceived ? <RemoveRedEye /> : <Info />}
                                        color={btnColor}
                                    >
                                        {isReceived ? 'ดูข้อมูล' : 'รับอะไหล่'}
                                    </Button>
                                </TableCell>
                                }
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table >
        )
    }

    function MobileData() {
        function BoxComponent({ children }) {
            return <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{children}</Box>
        }
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {history.data.map((item) => {
                    const isReceived = item.receive_status === 'Y';
                    const isPartial = item.receive_status === 'P';
                    let btnColor = "warning";
                    if (isPartial) btnColor = "info";
                    if (isReceived) btnColor = "success";

                    return (
                        <Card key={item.id} variant='outlined'>
                            <CardContent>
                                <Stack spacing={1}>
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>เลขที่เอกสารเคลม</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.claim_id}</Typography>
                                    </BoxComponent>
                                    <Divider sx={{ my: 1 }} />
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>วันที่แจ้งเคลม</Typography>
                                        <Typography variant="body2">{DateFormatTh({ date: item.created_at })}</Typography>
                                    </BoxComponent>
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>สถานะ</Typography>
                                        <StatusClaim status={item.status} />
                                    </BoxComponent>
                                    {canSee && (
                                        <BoxComponent>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>เลขใบ RT</Typography>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{item.acc_job_no}</Typography>
                                        </BoxComponent>
                                    )}
                                    {canReceive && (
                                        <BoxComponent>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>สถานะเซลล์รับคืนอะไหล่</Typography>
                                            <ReceiveStatusChip status={item.receive_status || 'N'} />
                                        </BoxComponent>
                                    )}
                                    {canSee && (
                                        <BoxComponent>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>สถานะบัญชีรับอะไหล่</Typography>
                                            <AccountStatusChip status={item.acc_status || ''} />
                                        </BoxComponent>
                                    )}
                                    <Button onClick={() => redirectToDetail(item.claim_id)} variant='contained' size='small' startIcon={<RemoveRedEye />} fullWidth>รายละเอียด</Button>
                                    {canReceive && (
                                        <Button
                                            onClick={() => handleOpenReceiveModal(item)}
                                            variant="contained" size="small"
                                            startIcon={isReceived ? <RemoveRedEye /> : <Info />}
                                            color={btnColor}
                                            fullWidth
                                        >
                                            {isReceived ? 'ดูข้อมูล' : 'รับอะไหล่'}
                                        </Button>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    )
                })}
            </Box>
        )
    }

    return (
        <LayoutClaim headTitle={'ประวัติเคลม'}>
            <Grid2 container spacing={2}>

                <Grid2 size={12}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 'fit-content' }}>🔍 กรองข้อมูล :</Typography>
                        {areas && areas.length > 0 && (
                            <Box sx={{ minWidth: '200px' }}>
                                <Autocomplete
                                    options={areas}
                                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                                    value={areas.find(a => a.code === filters?.area) || null}
                                    onChange={(e, newValue) => handleFilterChange('area', newValue ? newValue.code : '')}
                                    size="small"
                                    renderInput={(params) => <TextField {...params} label="เขตการขาย (Sale Area)" placeholder="ทั้งหมด" />}
                                />
                            </Box>
                        )}
                        {userRole !== 'service' && (
                            <Box sx={{ minWidth: '250px' }}>
                                <Autocomplete
                                    options={filters?.area ? shops.filter(s => s.sale_area_code === filters.area) : (shops || [])}
                                    getOptionLabel={(option) => `[${option.is_code_cust_id}] ${option.shop_name}`}
                                    value={shops?.find(s => s.is_code_cust_id === filters?.shop) || null}
                                    onChange={(e, newValue) => handleFilterChange('shop', newValue ? newValue.is_code_cust_id : '')}
                                    size="small"
                                    renderInput={(params) => <TextField {...params} label="ค้นหาชื่อร้าน หรือ รหัสลูกค้า" placeholder="พิมพ์เพื่อค้นหา..." />}
                                />
                            </Box>
                        )}
                        {selectedShopData && userRole !== 'admin' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#e3f2fd', color: '#01579b', py: 1, px: 2, borderRadius: 1, border: '1px solid #90caf9' }}>
                                <Info fontSize="small" />
                                <Typography variant="body2">
                                    ร้าน: <strong>{selectedShopData.shop_name}</strong> |
                                    ผู้ดูแล: <strong>{selectedShopData.sale_name || '-'}</strong> |
                                    เขต: <strong>{selectedShopData.sale_area_name || '-'}</strong>
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ minWidth: '200px' }}>
                            <Autocomplete
                                options={statusOptions}
                                getOptionLabel={(option) => option.label}
                                value={statusOptions.find(opt => opt.value === (filters?.status || '')) || statusOptions[0]}
                                onChange={(e, newValue) => handleFilterChange('status', newValue ? newValue.value : '')}
                                size="small"
                                disableClearable
                                renderInput={(params) => <TextField {...params} label="สถานะงานเคลม" placeholder="ทั้งหมด" />}
                            />
                        </Box>
                        <Box sx={{ minWidth: '150px' }}>
                            <Autocomplete
                                options={receiveStatusOptions}
                                getOptionLabel={(option) => option.label}
                                value={receiveStatusOptions.find(opt => opt.value === (filters?.receive_status || 'all')) || receiveStatusOptions[0]}
                                onChange={(e, newValue) => handleFilterChange('receive_status', newValue ? newValue.value : 'all')}
                                size="small"
                                disableClearable
                                renderInput={(params) => <TextField {...params} label="สถานะรับอะไหล่" placeholder="ทั้งหมด" />}
                            />
                        </Box>
                        {canSee && (
                            <Box sx={{ minWidth: '180px' }}>
                                <Autocomplete
                                    options={accStatusOptions}
                                    getOptionLabel={(option) => option.label}
                                    value={accStatusOptions.find(opt => opt.value === (filters?.acc_status || '')) || accStatusOptions[0]}
                                    onChange={(e, newValue) => handleFilterChange('acc_status', newValue ? newValue.value : '')}
                                    size="small"
                                    disableClearable
                                    renderInput={(params) => <TextField {...params} label="สถานะตรวจสอบบัญชี" />}
                                />
                            </Box>
                        )}
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={handleClearFilters}
                            sx={{ height: '38px', borderRadius: 1 }}
                        >
                            ล้างค่า
                        </Button>
                    </Paper>
                </Grid2>
                <Grid2 size={12}>
                    <Breadcrumbs>
                        <Typography sx={{ color: 'text.primary' }}>แจ้งเคลมอะไหล่</Typography>
                        <Typography sx={{ color: 'text.primary' }}>ประวัติเคลม</Typography>
                    </Breadcrumbs>
                </Grid2>
                <Grid2 size={12} overflow='auto'>
                    {isMobile ? <MobileData /> : <TableData />}
                    <Pagination links={history.links} />
                </Grid2>
            </Grid2>

            <ReceiveModal
                open={openModal}
                onClose={handleCloseModal}
                selectedClaim={selectedClaim}
                receiveForm={receiveForm}
                setReceiveForm={setReceiveForm}
                processing={processing}
                onSubmit={handleSubmitReceive}
            />
        </LayoutClaim>
    )
}

const Pagination = ({ links }) => {
    // ถ้ามีหน้าเดียวไม่ต้องแสดง
    if (links.length <= 3) return null;

    return (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            {links.map((link, index) => (
                <Button
                    key={index}
                    size="small"
                    variant={link.active ? "contained" : "outlined"}
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url)}
                    sx={{
                        minWidth: '40px',
                        // แปลง HTML entity เช่น &laquo; ให้แสดงผลสวยงาม
                        display: 'inline-block'
                    }}
                >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Button>
            ))}
        </Box>
    );
};
// ----------------------
// import { router } from "@inertiajs/react";
// import {
//     Breadcrumbs, Button, Card, CardContent, Chip, Grid2, Table, TableBody, TableCell, TableHead, TableRow,
//     Typography, useMediaQuery, Box, Divider, Stack,
//     Paper, Autocomplete, TextField, Dialog, DialogTitle, IconButton,
//     DialogContent, DialogActions, Checkbox, Tooltip, Collapse
// } from "@mui/material";
// import {
//     Close, CloudUpload, Info, PhotoCamera, RemoveRedEye, Save, CameraAlt,
//     Image as ImageIcon, KeyboardArrowDown, KeyboardArrowUp
// } from "@mui/icons-material";
// import { DateFormatTh } from "@/Components/DateFormat.jsx";
// import React, { useMemo, useState, useEffect } from "react";
// import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";
// import { styled } from '@mui/material/styles';

// // --- Styled Components ---
// const VisuallyHiddenInput = styled('input')({
//     clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden', position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap', width: 1,
// });

// const TABLE_HEADER_STYLE = { backgroundColor: '#c7c7c7', fontWeight: 'bold', fontSize: 16 };

// // --- Sub-Components ---

// const RTCHIP = ({ jobNo }) => {
//     if (!jobNo) return <Typography variant="body2" color="text.disabled">-</Typography>;
//     return (
//         <Chip label={jobNo} size="small" variant="filled" color="default" sx={{ minWidth: '100px', fontWeight: 'bold', fontFamily: 'monospace' }} />
//     );
// };

// const AccountStatusChip = ({ status }) => {
//     const config = {
//         'active': { label: 'Active', color: 'primary', variant: 'outlined' },
//         'partial': { label: 'Partial', color: 'warning', variant: 'filled' },
//         'complete': { label: 'Complete', color: 'success', variant: 'filled' },
//     };
//     const current = config[status];
//     if (!current) return <Typography variant="caption" color="text.disabled">Waiting</Typography>;
//     return <Chip label={current.label} color={current.color} variant={current.variant} size="small" sx={{ minWidth: '100px', fontWeight: 'bold' }} />;
// };

// const ReceiveStatusChip = ({ status }) => {
//     if (status === 'Y') return <Chip size='small' variant="filled" color="success" label="Complete" sx={{ minWidth: '80px' }} />;
//     if (status === 'P') return <Chip size='small' variant="filled" color="warning" label="Partial" sx={{ minWidth: '80px', color: '#fff' }} />;
//     return <Chip size='small' variant="outlined" color="primary" label="Active" sx={{ minWidth: '80px' }} />;
// }

// const StatusClaim = ({ status }) => {
//     const status_formated = {
//         'pending': { status: 'secondary', label: 'กำลังตรวจสอบคำขอเคลม' },
//         'approved': { status: 'success', label: 'อนุมัติคำสั่งส่งเคลม' },
//         'rejected': { status: 'error', label: 'ไม่อนุมัติ' },
//         'กำลังจัดเตรียมสินค้า': { status: 'info', label: 'กำลังจัดเตรียมสินค้า' },
//         'อยู่ระหว่างจัดส่ง': { status: 'warning', label: 'อยู่ระหว่างจัดส่ง' },
//         'จัดส่งสำเร็จ': { status: 'success', label: 'จัดส่งสำเร็จ' },
//     }[status] || { status: 'info', label: 'ไม่สามารถระบุได้' };
//     return <Chip size='small' color={status_formated.status} label={status_formated.label} />
// }

// // 1. Row Component
// const Row = ({ group, isReadOnly, selectedItems, handleCheckboxChange, handleGroupCheckboxChange, itemQuantities, handleQtyChange, setPreviewImage, isAccPartial }) => {
//     const [open, setOpen] = useState(false);
//     const totalQty = group.items.reduce((sum, item) => sum + item.qty, 0);
//     const totalRc = group.items.reduce((sum, item) => sum + (item.rc_qty || 0), 0);
//     const totalAccRc = group.items.reduce((sum, item) => sum + (item.account_rc_qty || 0), 0);
//     const isFullyReceivedGroup = group.items.every(item => (item.rc_qty || 0) >= item.qty);
//     const eligibleItems = group.items.filter(item => (item.rc_qty || 0) < item.qty);
//     const numSelected = eligibleItems.filter(item => selectedItems[item.id]).length;
//     const isGroupSelected = eligibleItems.length > 0 && numSelected === eligibleItems.length;
//     const isGroupIndeterminate = numSelected > 0 && numSelected < eligibleItems.length;

//     const spImage = import.meta.env.VITE_IMAGE_SP_NEW + group.sp_code + '.jpg';
//     const imageNotFound = (e) => { e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT; }

//     return (
//         <React.Fragment>
//             <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: isFullyReceivedGroup ? '#e8f5e9' : '#f5f5f5' }}>
//                 <TableCell width="40px" align="center"><IconButton size="small" onClick={() => setOpen(!open)}>{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton></TableCell>
//                 {!isReadOnly && (
//                     <TableCell padding="checkbox" align="center"><Checkbox indeterminate={isGroupIndeterminate} checked={isGroupSelected} onChange={(e) => handleGroupCheckboxChange(eligibleItems, e.target.checked)} disabled={isFullyReceivedGroup || eligibleItems.length === 0} color="primary" /></TableCell>
//                 )}
//                 <TableCell width="80px"><Box width={50} height={50} onClick={() => setPreviewImage(spImage)} sx={{ border: '1px solid #eee', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', cursor: 'pointer' }}><img src={spImage} onError={imageNotFound} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></Box></TableCell>
//                 <TableCell><Typography variant="body2" fontWeight="bold">{group.sp_code}</Typography><Typography variant="caption" color="text.secondary">{group.sp_name}</Typography></TableCell>
//                 <TableCell align="center"><Typography variant="body2" fontWeight="bold">{totalQty} {group.sp_unit}</Typography></TableCell>
//                 <TableCell align="center">
//                     <Stack direction="row" spacing={1} justifyContent="center">
//                         <Typography variant="body2" fontWeight="bold" color="primary">{totalRc}</Typography>
//                         {isAccPartial && <Typography variant="body2" fontWeight="bold" color="error"> / {totalAccRc}</Typography>}
//                     </Stack>
//                 </TableCell>
//             </TableRow>
//             <TableRow>
//                 <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
//                     <Collapse in={open} timeout="auto" unmountOnExit>
//                         <Box sx={{ margin: 1, ml: 6, p: 1, bgcolor: 'white', borderRadius: 1, border: '1px dashed #ccc' }}>
//                             <Table size="small">
//                                 <TableHead><TableRow>{!isReadOnly && <TableCell padding="checkbox"></TableCell>}<TableCell>Job No</TableCell><TableCell>Serial</TableCell><TableCell align="center">จำนวนส่ง</TableCell>{isAccPartial && <TableCell align="center" sx={{ bgcolor: '#fff3e0' }}>บัญชีรับ</TableCell>}</TableRow></TableHead>
//                                 <TableBody>
//                                     {group.items.map((detail) => (
//                                         <TableRow key={detail.id} hover selected={selectedItems[detail.id]}>
//                                             {!isReadOnly && <TableCell padding="checkbox"><Checkbox checked={selectedItems[detail.id] || false} onChange={() => handleCheckboxChange(detail.id)} disabled={(detail.rc_qty || 0) >= detail.qty} size="small" /></TableCell>}
//                                             <TableCell>{detail.job_id}</TableCell><TableCell>{detail.serial_id || '-'}</TableCell><TableCell align="center">{detail.rc_qty}</TableCell>
//                                             {isAccPartial && <TableCell align="center" sx={{ bgcolor: '#fff3e0' }}><Typography variant="body2" fontWeight="bold" color={detail.account_rc_qty < detail.rc_qty ? 'error' : 'success'}>{detail.account_rc_qty}</Typography></TableCell>}
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </Box>
//                     </Collapse>
//                 </TableCell>
//             </TableRow>
//         </React.Fragment>
//     );
// };

// // 2. Modal Component
// const ReceiveModal = ({ open, onClose, selectedClaim, receiveForm, setReceiveForm, processing, onSubmit }) => {
//     const isAccPartial = selectedClaim?.acc_status === 'partial';
//     const isReadOnly = selectedClaim?.receive_status === 'Y' || isAccPartial || selectedClaim?.acc_status === 'complete';
//     const [previewImage, setPreviewImage] = useState(null);
//     const [selectedItems, setSelectedItems] = useState({});
//     const [itemQuantities, setItemQuantities] = useState({});

//     const groupedList = useMemo(() => {
//         if (!selectedClaim?.list) return [];
//         const groups = {};
//         selectedClaim.list.forEach(item => {
//             if (!groups[item.sp_code]) groups[item.sp_code] = { sp_code: item.sp_code, sp_name: item.sp_name, sp_unit: item.unit, items: [] };
//             groups[item.sp_code].items.push(item);
//         });
//         return Object.values(groups);
//     }, [selectedClaim]);

//     const allEligibleItems = useMemo(() => selectedClaim?.list?.filter(item => (item.rc_qty || 0) < item.qty) || [], [selectedClaim]);

//     useEffect(() => {
//         if (open && selectedClaim?.list) {
//             const initialSelected = {}; const initialQty = {};
//             selectedClaim.list.forEach(item => { initialSelected[item.id] = (item.rc_qty || 0) < item.qty; initialQty[item.id] = item.qty; });
//             setSelectedItems(initialSelected); setItemQuantities(initialQty);
//         }
//     }, [open, selectedClaim]);

//     const handleImageChange = (e) => {
//         const files = Array.from(e.target.files);
//         const validFiles = files.filter(file => file.type.startsWith('image/'));
//         if (validFiles.length > 0) {
//             const newPreviews = validFiles.map(file => URL.createObjectURL(file));
//             setReceiveForm(prev => ({ ...prev, images: [...prev.images, ...validFiles], previews: [...prev.previews, ...newPreviews] }));
//         }
//         e.target.value = '';
//     };

//     return (
//         <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//             <DialogTitle sx={{ bgcolor: isAccPartial ? '#ed6c02' : (isReadOnly ? '#2e7d32' : '#1976d2'), color: 'white' }}>
//                 <Box display="flex" alignItems="center" gap={1}>{isAccPartial ? <Info /> : <RemoveRedEye />} {isAccPartial ? 'ตรวจสอบยอด (บัญชีรับไม่ครบ)' : 'รับคืนอะไหล่'} ({selectedClaim?.claim_id})</Box>
//             </DialogTitle>
//             <DialogContent dividers>
//                 <Stack spacing={2}>
//                     {isAccPartial && <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1, borderLeft: '5px solid #ed6c02' }}><Typography variant="subtitle2" color="warning.dark" fontWeight="bold">หมายเหตุจากบัญชี:</Typography><Typography variant="body2">{selectedClaim?.acc_remark || '-'}</Typography></Box>}
//                     <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
//                         <Table stickyHeader size="small">
//                             <TableHead><TableRow><TableCell width="40px" />{!isReadOnly && <TableCell padding="checkbox" />}<TableCell width="80px">รูปภาพ</TableCell><TableCell>รายการ</TableCell><TableCell align="center">จำนวนเคลม</TableCell><TableCell align="center">สถานะส่ง</TableCell></TableRow></TableHead>
//                             <TableBody>{groupedList.map(g => <Row key={g.sp_code} group={g} isReadOnly={isReadOnly} selectedItems={selectedItems} handleCheckboxChange={(id) => setSelectedItems(p => ({ ...p, [id]: !p[id] }))} handleGroupCheckboxChange={(items, val) => { const n = { ...selectedItems }; items.forEach(i => n[i.id] = val); setSelectedItems(n); }} itemQuantities={itemQuantities} handleQtyChange={(id, v, max) => setItemQuantities(p => ({ ...p, [id]: Math.min(Math.max(parseInt(v) || 1, 1), max) }))} setPreviewImage={setPreviewImage} isAccPartial={isAccPartial} />)}</TableBody>
//                         </Table>
//                     </Paper>
//                     <Divider /><Typography variant="subtitle2" fontWeight="bold">📸 รูปภาพหลักฐาน:</Typography>
//                     <Box sx={{ border: '2px dashed #ccc', p: 2, bgcolor: '#fafafa' }}>
//                         <Grid2 container spacing={1}>
//                             {receiveForm.previews.map((url, i) => <Grid2 key={i} size={3}><Box sx={{ position: 'relative', pt: '100%' }}><img src={url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />{!isReadOnly && <IconButton size="small" onClick={() => setReceiveForm(p => { const ni = [...p.images]; const np = [...p.previews]; ni.splice(i, 1); np.splice(i, 1); return { ...p, images: ni, previews: np } })} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'white' }}><Close fontSize="small" /></IconButton>}</Box></Grid2>)}
//                             {!isReadOnly && <Grid2 size={3}><Button component="label" variant="outlined" fullWidth sx={{ height: '100px', borderStyle: 'dashed', flexDirection: 'column' }}><CameraAlt /><VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} /></Button></Grid2>}
//                         </Grid2>
//                     </Box>
//                     <TextField label="หมายเหตุ" multiline rows={2} fullWidth size="small" value={receiveForm.remark} onChange={(e) => setReceiveForm(p => ({ ...p, remark: e.target.value }))} InputProps={{ readOnly: isReadOnly }} />
//                 </Stack>
//             </DialogContent>
//             <DialogActions><Button onClick={onClose} color="inherit">ปิด</Button>{!isReadOnly && <Button onClick={() => onSubmit(selectedClaim.list.filter(i => selectedItems[i.id]).map(i => ({ id: i.id, qty: itemQuantities[i.id] })))} variant="contained" color="success">ยืนยัน</Button>}</DialogActions>
//             <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md"><Box position="relative"><IconButton onClick={() => setPreviewImage(null)} sx={{ position: 'absolute', right: 0, top: 0, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', m: 1 }}><Close /></IconButton><img src={previewImage} style={{ maxWidth: '100%', maxHeight: '80vh' }} /></Box></Dialog>
//         </Dialog>
//     );
// };

// // 4. Main Page Component
// export default function HistoryClaimNew({ history, shops, filters, isAdmin, areas, currentSale, userRole }) {
//     const isMobile = useMediaQuery('(max-width:600px)');
//     const [openModal, setOpenModal] = useState(false);
//     const [selectedClaim, setSelectedClaim] = useState(null);
//     const [receiveForm, setReceiveForm] = useState({ images: [], previews: [], remark: '' });
//     const [processing, setProcessing] = useState(false);

//     const statusOptions = [{ label: 'ทั้งหมด', value: '' }, { label: 'กำลังตรวจสอบ', value: 'pending' }, { label: 'อนุมัติแล้ว', value: 'approved' }, { label: 'ไม่อนุมัติ', value: 'ไม่อนุมัติ' }];
//     const receiveStatusOptions = [{ label: 'ทั้งหมด', value: 'all' }, { label: 'Complete', value: 'Y' }, { label: 'Partial', value: 'P' }, { label: 'Active', value: 'N' }];
//     const accStatusOptions = [{ label: 'ทั้งหมด', value: '' }, { label: 'Active (รอตรวจ)', value: 'active' }, { label: 'Partial (รับไม่ครบ)', value: 'partial' }, { label: 'Complete (รับครบ)', value: 'complete' }];

//     const handleFilterChange = (key, value) => {
//         let nf = { ...filters, [key]: value };
//         if (key === 'shop' && value) { const s = shops.find(sh => sh.is_code_cust_id === value); if (s) nf.area = s.sale_area_code; }
//         if (key === 'area') nf.shop = '';
//         router.get(route('spareClaim.history'), nf, { preserveState: true, replace: true });
//     };

//     function TableData() {
//         return (
//             <Table><TableHead sx={TABLE_HEADER_STYLE}><TableRow><TableCell>เลขที่เคลม</TableCell><TableCell>วันที่</TableCell><TableCell>สถานะเคลม</TableCell><TableCell align="center">เซลล์รับของ</TableCell><TableCell align="center">ใบ RT</TableCell><TableCell align="center">สถานะบัญชี</TableCell><TableCell align='center'>#</TableCell><TableCell align="center">จัดการ</TableCell></TableRow></TableHead>
//                 <TableBody>{history.data.map((item) => (
//                     <TableRow key={item.id}><TableCell>{item.claim_id}</TableCell><TableCell>{DateFormatTh({ date: item.created_at })}</TableCell><TableCell><StatusClaim status={item.status} /></TableCell><TableCell align="center"><ReceiveStatusChip status={item.receive_status} /></TableCell><TableCell align="center"><RTCHIP jobNo={item.acc_job_no} /></TableCell><TableCell align="center"><AccountStatusChip status={item.acc_status} /></TableCell><TableCell align='center'><Button onClick={() => router.get(route('spareClaim.historyDetail', { claim_id: item.claim_id }))} variant='contained' size='small'>รายละเอียด</Button></TableCell><TableCell align="center"><Button onClick={() => { setSelectedClaim(item); if (item.receive_evidence) setReceiveForm({ images: [], previews: item.receive_evidence.images, remark: item.receive_evidence.remark }); else setReceiveForm({ images: [], previews: [], remark: '' }); setOpenModal(true); }} variant="contained" size="small" color={item.acc_status === 'partial' ? 'warning' : 'primary'}>{item.acc_status === 'partial' ? 'ตรวจยอด' : (item.receive_status !== 'N' ? 'ดูข้อมูล' : 'รับอะไหล่')}</Button></TableCell></TableRow>
//                 ))}</TableBody></Table>
//         )
//     }

//     function MobileData() {
//         const BoxC = ({ children }) => <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{children}</Box>;
//         return (
//             <Stack spacing={2}>{history.data.map((item) => (
//                 <Card key={item.id} variant='outlined'><CardContent><Stack spacing={1}><BoxC><Typography variant="subtitle2" fontWeight="bold">เลขที่เคลม</Typography><Typography variant="body2" fontWeight="bold">{item.claim_id}</Typography></BoxC><Divider /><BoxC><Typography variant="subtitle2">วันที่</Typography><Typography variant="body2">{DateFormatTh({ date: item.created_at })}</Typography></BoxC><BoxC><Typography variant="subtitle2">สถานะ</Typography><StatusClaim status={item.status} /></BoxC><BoxC><Typography variant="subtitle2">ใบ RT</Typography><RTCHIP jobNo={item.acc_job_no} /></BoxC><BoxC><Typography variant="subtitle2">เซลล์รับของ</Typography><ReceiveStatusChip status={item.receive_status} /></BoxC><BoxC><Typography variant="subtitle2">สถานะบัญชี</Typography><AccountStatusChip status={item.acc_status} /></BoxC><Button onClick={() => router.get(route('spareClaim.historyDetail', { claim_id: item.claim_id }))} variant='contained' size='small' fullWidth>รายละเอียด</Button><Button onClick={() => { setSelectedClaim(item); setOpenModal(true); }} variant="contained" size="small" color={item.acc_status === 'partial' ? 'warning' : 'primary'} fullWidth>{item.acc_status === 'partial' ? 'ตรวจยอด' : 'รับอะไหล่'}</Button></Stack></CardContent></Card>
//             ))}</Stack>
//         )
//     }

//     return (
//         <LayoutClaim headTitle={'ประวัติเคลม'}>
//             <Grid2 container spacing={2}>
//                 <Grid2 size={12}>
//                     <Paper elevation={0} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
//                         <Typography variant="body2" fontWeight="bold">🔍 กรอง:</Typography>
//                         <Autocomplete size="small" sx={{ width: 180 }} options={areas} getOptionLabel={(o) => `${o.name} (${o.code})`} value={areas.find(a => a.code === filters?.area) || null} onChange={(e, v) => handleFilterChange('area', v ? v.code : '')} renderInput={(p) => <TextField {...p} label="เขตการขาย" />} />
//                         <Autocomplete size="small" sx={{ width: 220 }} options={filters?.area ? shops.filter(s => s.sale_area_code === filters.area) : shops} getOptionLabel={(o) => `[${o.is_code_cust_id}] ${o.shop_name}`} value={shops.find(s => s.is_code_cust_id === filters?.shop) || null} onChange={(e, v) => handleFilterChange('shop', v ? v.is_code_cust_id : '')} renderInput={(p) => <TextField {...p} label="ร้านค้า" />} />
//                         <Autocomplete size="small" sx={{ width: 150 }} options={receiveStatusOptions} getOptionLabel={(o) => o.label} value={receiveStatusOptions.find(o => o.value === filters.receive_status) || receiveStatusOptions[0]} onChange={(e, v) => handleFilterChange('receive_status', v.value)} renderInput={(p) => <TextField {...p} label="สถานะเซลล์" />} />
//                         <Autocomplete size="small" sx={{ width: 180 }} options={accStatusOptions} getOptionLabel={(o) => o.label} value={accStatusOptions.find(o => o.value === (filters.acc_status || '')) || accStatusOptions[0]} onChange={(e, v) => handleFilterChange('acc_status', v.value)} renderInput={(p) => <TextField {...p} label="สถานะบัญชี" />} />
//                         <Button variant="outlined" color="error" onClick={() => router.get(route('spareClaim.history'), { receive_status: 'all' })}>ล้างค่า</Button>
//                     </Paper>
//                 </Grid2>
//                 <Grid2 size={12} overflow='auto'>{isMobile ? <MobileData /> : <TableData />}{history.links.length > 3 && <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>{history.links.map((link, i) => <Button key={i} size="small" variant={link.active ? "contained" : "outlined"} disabled={!link.url} onClick={() => link.url && router.get(link.url)}><span dangerouslySetInnerHTML={{ __html: link.label }} /></Button>)}</Box>}</Grid2>
//             </Grid2>
//             <ReceiveModal open={openModal} onClose={() => { setOpenModal(false); setSelectedClaim(null); }} selectedClaim={selectedClaim} receiveForm={receiveForm} setReceiveForm={setReceiveForm} processing={processing} onSubmit={(it) => { setProcessing(true); const fd = new FormData(); fd.append('claim_id', selectedClaim.claim_id); fd.append('remark', receiveForm.remark || ''); receiveForm.images.forEach(f => fd.append('images[]', f)); it.forEach((x, i) => { fd.append(`items[${i}][id]`, x.id); fd.append(`items[${i}][qty]`, x.qty); }); router.post(route('spareClaim.updateReceiveStatus'), fd, { onSuccess: () => { setProcessing(false); setOpenModal(false); }, onError: () => setProcessing(false) }); }} />
//         </LayoutClaim>
//     )
// }