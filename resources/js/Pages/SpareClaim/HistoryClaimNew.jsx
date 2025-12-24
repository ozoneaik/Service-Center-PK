import { router } from "@inertiajs/react";
import {
    Breadcrumbs, Button, Card, CardContent, Chip, Grid2, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, useMediaQuery, Box, Divider, Stack,
    Paper,
    Autocomplete,
    TextField,
    Dialog,
    DialogTitle,
    IconButton,
    DialogContent,
    DialogActions,
    ListItemAvatar,
    ListItemText,
    Checkbox,
    Tooltip
} from "@mui/material";
import { Close, CloudUpload, Info, PhotoCamera, RemoveRedEye, Save, CameraAlt, Image as ImageIcon } from "@mui/icons-material";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import React, { useMemo, useState, useEffect } from "react";
import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";
import { styled } from '@mui/material/styles'

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

const ReceiveModal = ({
    open,
    onClose,
    selectedClaim,
    receiveForm,
    setReceiveForm,
    processing,
    onSubmit
}) => {
    const isReadOnly = selectedClaim?.receive_status === 'Y';
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [itemQuantities, setItemQuantities] = useState({});

    const eligibleList = useMemo(() => {
        return selectedClaim?.list?.filter(item => {
            const received = item.rc_qty || 0;
            return received < item.qty;
        }) || [];
    }, [selectedClaim]);

    const numSelected = eligibleList.filter(item => selectedItems[item.id]).length;
    const numEligible = eligibleList.length;
    const isAllSelected = numEligible > 0 && numSelected === numEligible;
    const isIndeterminate = numSelected > 0 && numSelected < numEligible;

    useEffect(() => {
        if (open && selectedClaim?.list) {
            const initialSelected = {};
            const initialQty = {};

            selectedClaim.list.forEach(item => {
                const received = item.rc_qty || 0;
                const totalQty = item.qty;
                const isFull = received >= totalQty;

                if (isFull) {
                    initialSelected[item.id] = false;
                    initialQty[item.id] = totalQty;
                } else {
                    initialSelected[item.id] = true;
                    initialQty[item.id] = totalQty;
                }
            });

            setSelectedItems(initialSelected);
            setItemQuantities(initialQty);
        }
    }, [open, selectedClaim]);

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        const newSelected = { ...selectedItems };

        eligibleList.forEach(item => {
            newSelected[item.id] = isChecked;
        });

        setSelectedItems(newSelected);
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

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

    const imageNotFound = (e) => { e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT; }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
            // ถ้าต้องการให้ "ยกเลิกทั้งหมด" เมื่อเจอไฟล์ผิดแม้แต่ไฟล์เดียว ให้เปิดบรรทัด return ด้านล่างนี้ครับ
            // e.target.value = '';
            // return; 
        }

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
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        📦 รายการสินค้า: {selectedClaim?.list?.length}
                    </Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', bgcolor: '#fff' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {!isReadOnly && (
                                        <TableCell padding="checkbox" align="center">
                                            {/* Checkbox Select All */}
                                            <Checkbox
                                                indeterminate={isIndeterminate}
                                                checked={isAllSelected}
                                                onChange={handleSelectAll}
                                                color="primary"
                                                disabled={numEligible === 0}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>รหัส : รายการ</TableCell>
                                    <TableCell align="center">จำนวน</TableCell>
                                    <TableCell align="center">รับแล้ว/จำนวน</TableCell>
                                    <TableCell align="center" width="120px">รับคืน/จำนวน</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedClaim?.list?.map((detail, index) => {
                                    const spImage = import.meta.env.VITE_IMAGE_SP_NEW_NEW + detail.sp_code + '.jpg';
                                    const receivedPreviously = detail.rc_qty || 0;
                                    const isFullyReceived = receivedPreviously >= detail.qty;
                                    const isChecked = selectedItems[detail.id] || false;

                                    return (
                                        <TableRow
                                            key={detail.id || index}
                                            hover
                                            selected={isChecked}
                                            sx={{
                                                bgcolor: isFullyReceived ? '#dcedc8' : 'inherit',
                                                '&.Mui-selected': {
                                                    bgcolor: isFullyReceived ? '#dcedc8' : undefined
                                                }
                                            }}
                                        >
                                            {!isReadOnly && (
                                                <TableCell padding="checkbox" align="center">
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={() => handleCheckboxChange(detail.id)}
                                                        disabled={isFullyReceived}
                                                        color="primary"
                                                    />
                                                </TableCell>
                                            )}

                                            <TableCell>
                                                <Box width={50} height={50} onClick={() => setPreviewImage(spImage)} sx={{
                                                    border: '1px solid #eee',
                                                    borderRadius: 1,
                                                    p: 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'white',
                                                    // +++ เพิ่ม Style ให้รู้ว่ากดได้ +++
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: '#1976d2', // เปลี่ยนสีขอบเป็นสีฟ้า
                                                        transform: 'scale(1.1)', // ขยายเล็กน้อย
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                    }
                                                }}
                                                >
                                                    <img src={spImage} onError={imageNotFound} alt={detail.sp_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <Typography variant="body2" fontWeight="bold">{detail.sp_code}</Typography>
                                                    <Tooltip
                                                        title={
                                                            <Stack spacing={0.5} p={0.5}>
                                                                <Typography variant="caption" sx={{ color: 'white' }}>
                                                                    Job No: {detail.job_id || '-'}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'white' }}>
                                                                    Serial: {detail.serial_id || '-'}
                                                                </Typography>
                                                            </Stack>
                                                        }
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <Info sx={{ fontSize: 14, color: 'action.active', cursor: 'help' }} />
                                                    </Tooltip>
                                                </Box>

                                                <Typography variant="caption" color="text.secondary" noWrap>{detail.sp_name}</Typography>

                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight="bold">
                                                    {detail.qty} {detail.unit}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="body2" color={isFullyReceived ? 'success.main' : 'warning.main'} fontWeight={isFullyReceived ? 'bold' : 'normal'}>
                                                    {receivedPreviously}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                {isReadOnly ? (
                                                    <Typography variant="body2" fontWeight="bold" color={isFullyReceived ? 'success.main' : 'text.primary'}>{receivedPreviously}</Typography>
                                                ) : (
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={itemQuantities[detail.id] || ''}
                                                        onChange={(e) => handleQtyChange(detail.id, e.target.value, detail.qty)}
                                                        disabled={!isChecked || isFullyReceived}
                                                        placeholder="1"
                                                        slotProps={{
                                                            htmlInput: {
                                                                min: 1,
                                                                max: detail.qty,
                                                                style: { textAlign: 'center', backgroundColor: isFullyReceived ? '#f1f8e9' : 'white' }
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>
                    <Divider />
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        📸 หลักฐานรูปภาพ (จำเป็น*):
                    </Typography>
                    <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 2, bgcolor: '#fafafa', minHeight: 150 }}>
                        {receiveForm.previews.length > 0 ? (
                            <Grid2 container spacing={1}>
                                {receiveForm.previews.map((url, index) => (
                                    <Grid2 key={index} size={4}>
                                        <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                                            <img src={url} alt={`preview-${index}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }} />
                                            {!isReadOnly && (
                                                <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', padding: '2px', '&:hover': { bgcolor: 'white', color: 'red' } }}>
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Grid2>
                                ))}
                                {!isReadOnly && (
                                    <Grid2 size={4}>
                                        <Stack spacing={1} sx={{ height: '100%', justifyContent: 'center' }}>
                                            {/* ปุ่มเพิ่มจากอัลบั้ม */}
                                            <Button component="label" variant="outlined" size="small" sx={{ flex: 1, borderStyle: 'dashed', display: 'flex', flexDirection: 'column' }}>
                                                <ImageIcon />
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>อัลบั้ม</Typography>
                                                <VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} />
                                            </Button>
                                            {/* ปุ่มถ่ายรูป */}
                                            <Button component="label" variant="outlined" size="small" sx={{ flex: 1, borderStyle: 'dashed', display: 'flex', flexDirection: 'column', color: 'error.main', borderColor: 'error.light' }}>
                                                <CameraAlt />
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>ถ่ายรูป</Typography>
                                                {/* capture="environment" คือคำสั่งเปิดกล้องหลังทันที */}
                                                <VisuallyHiddenInput type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
                                            </Button>
                                        </Stack>
                                    </Grid2>
                                )}
                            </Grid2>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                                <CloudUpload sx={{ fontSize: 48, color: '#bdbdbd' }} />
                                <Typography variant="caption" color="text.secondary" mb={2}>อัปโหลดรูปภาพหลักฐาน</Typography>
                                {!isReadOnly && (
                                    <Stack direction="row" spacing={2}>
                                        {/* ปุ่มเลือกรูปปกติ (Multiple) */}
                                        <Button component="label" variant="contained" startIcon={<ImageIcon />} size="small">
                                            เลือกรูปภาพ
                                            <VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} />
                                        </Button>
                                        {/* ปุ่มเปิดกล้อง (Capture) */}
                                        <Button component="label" variant="contained" color="secondary" startIcon={<CameraAlt />} size="small">
                                            ถ่ายรูป
                                            {/* capture="environment" บังคับใช้กล้องหลัง */}
                                            <VisuallyHiddenInput type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
                                        </Button>
                                    </Stack>
                                )}
                            </Box>
                        )}
                    </Box>

                    {(() => {
                        let displayValue = receiveForm.remark;
                        if (isReadOnly) {
                            const list = selectedClaim?.receive_evidence?.remark_list || [];
                            if (list.length > 0) {
                                displayValue = list.map(item => `[${item.date}] : ${item.text}`).join('\n');
                            } else {
                                displayValue = selectedClaim?.receive_evidence?.remark || "- ไม่มีหมายเหตุ -";
                            }
                        }

                        return (
                            <TextField
                                label="หมายเหตุเพิ่มเติม (ถ้ามี)"
                                multiline
                                rows={isReadOnly ? 4 : 2}
                                fullWidth
                                size="small"
                                value={displayValue}
                                onChange={(e) => !isReadOnly && setReceiveForm(prev => ({ ...prev, remark: e.target.value }))}
                                slotProps={{
                                    input: {
                                        readOnly: isReadOnly,
                                        sx: {
                                            bgcolor: isReadOnly ? '#fafafa' : '#fff',
                                            color: isReadOnly ? 'text.secondary' : 'text.primary'
                                        }
                                    }
                                }}
                                sx={{ mt: 2 }}
                            />
                        );
                    })()}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                {isReadOnly ? (
                    <Button onClick={onClose} variant="contained" color="inherit">
                        ปิดหน้าต่าง
                    </Button>
                ) : (
                    <>
                        <Button onClick={onClose} color="inherit" disabled={processing}>
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            color="success"
                            startIcon={<Save />}
                            disabled={processing || receiveForm.images.length === 0}
                        >
                            {processing ? 'กำลังบันทึก...' : 'ยืนยันการรับของ'}
                        </Button>
                    </>
                )}
            </DialogActions>
            <Dialog
                open={Boolean(previewImage)}
                onClose={() => setPreviewImage(null)}
                maxWidth="md"
                sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' } }}
            >
                <Box sx={{ position: 'relative', bgcolor: 'transparent' }}>
                    {/* ปุ่มปิดมุมขวาบน */}
                    <IconButton
                        onClick={() => setPreviewImage(null)}
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            m: 1,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                        }}
                    >
                        <Close />
                    </IconButton>

                    {/* รูปภาพขนาดใหญ่ */}
                    <img
                        src={previewImage}
                        onError={imageNotFound} // ใช้ function เดิมกันรูปเสีย
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80vh', // สูงไม่เกิน 80% ของหน้าจอ
                            display: 'block',
                            borderRadius: '4px'
                        }}
                    />
                </Box>
            </Dialog>
        </Dialog>
    );
};
// --------------------------------------------------------

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
                        icon: 'success',
                        title: 'บันทึกสำเร็จ',
                        text: 'บันทึกการรับอะไหล่เรียบร้อยแล้ว',
                        timer: 2000,
                        showConfirmButton: false
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

    const handleFilterChange = (key, value) => {
        const newFilters = {
            shop: filters?.shop || '',
            area: filters?.area || '',
            receive_status: filters?.receive_status || 'all', // Default 'all'
            status: filters?.status || '',
            [key]: value
        };
        if (key === 'area') newFilters.shop = '';
        router.get(route('spareClaim.history'), newFilters, {
            preserveState: true, preserveScroll: true, replace: true
        });
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
                        <TableCell align="center">สถานะรับคืนอะไหล่</TableCell>
                        <TableCell align='center'>#</TableCell>
                        <TableCell align='center'>รับอะไหล่</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((item) => {
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
                                <TableCell align='center'>
                                    <Button onClick={() => redirectToDetail(item.claim_id)} variant='contained' size='small' startIcon={<RemoveRedEye />}>รายละเอียด</Button>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        onClick={() => handleOpenReceiveModal(item)}
                                        variant="contained" size="small"
                                        startIcon={isReceived ? <RemoveRedEye /> : <Info />}
                                        color={btnColor}
                                    >
                                        {isReceived ? 'ดูข้อมูล' : 'รับอะไหล่'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        )
    }

    function MobileData() {
        function BoxComponent({ children }) {
            return <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{children}</Box>
        }
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {history.map((item) => {
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
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>วันที่อัพเดท</Typography>
                                        <Typography variant="body2">{DateFormatTh({ date: item.updated_at })}</Typography>
                                    </BoxComponent>
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>สถานะ</Typography>
                                        <StatusClaim status={item.status} />
                                    </BoxComponent>
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>สถานะรับคืนอะไหล่</Typography>
                                        <ReceiveStatusChip status={item.receive_status || 'N'} />
                                    </BoxComponent>
                                    <Button onClick={() => redirectToDetail(item.claim_id)} variant='contained' size='small' startIcon={<RemoveRedEye />} fullWidth>รายละเอียด</Button>
                                    <Button
                                        onClick={() => handleOpenReceiveModal(item)}
                                        variant="contained" size="small"
                                        startIcon={isReceived ? <RemoveRedEye /> : <Info />}
                                        color={btnColor}
                                        fullWidth
                                    >
                                        {isReceived ? 'ดูข้อมูล' : 'รับอะไหล่'}
                                    </Button>
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
                {isAdmin && (
                    <Grid2 size={12}>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {/* {currentSale && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f1f8e9', color: '#33691e', py: 1, px: 2, borderRadius: 1, border: '1px solid #c5e1a5', width: '100%', mb: 1 }}>
                                    <Info fontSize="small" />
                                    <Typography variant="body2">
                                        เซลล์: <strong>{currentSale.name}</strong> | รหัสเซลล์: <strong>{currentSale.code}</strong>
                                    </Typography>
                                </Box>
                            )} */}
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
                        </Paper>
                    </Grid2>
                )}
                <Grid2 size={12}>
                    <Breadcrumbs>
                        <Typography sx={{ color: 'text.primary' }}>แจ้งเคลมอะไหล่</Typography>
                        <Typography sx={{ color: 'text.primary' }}>ประวัติเคลม</Typography>
                    </Breadcrumbs>
                </Grid2>
                <Grid2 size={12} overflow='auto'>
                    {isMobile ? <MobileData /> : <TableData />}
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

const TABLE_HEADER_STYLE = { backgroundColor: '#c7c7c7', fontWeight: 'bold', fontSize: 16 };

const ReceiveStatusChip = ({ status }) => {
    // Logic การแสดงผล Chip ตามสถานะ
    if (status === 'Y') {
        return <Chip size='small' variant="filled" color="success" label="Complete" sx={{ minWidth: '80px' }} />;
    } else if (status === 'P') {
        return <Chip size='small' variant="filled" color="warning" label="Partial" sx={{ minWidth: '80px', color: '#fff' }} />;
    } else {
        return <Chip size='small' variant="outlined" color="primary" label="Active" sx={{ minWidth: '80px' }} />;
    }
}

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