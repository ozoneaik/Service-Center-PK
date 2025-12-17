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
} from "@mui/material";
import { Close, CloudUpload, Info, PhotoCamera, RemoveRedEye, Save } from "@mui/icons-material";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import React, { useMemo, useState } from "react";
import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";
import { styled } from '@mui/material/styles'
import { List } from "flowbite-react";

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
    const handleError = (e) => { e.target.src = '/images/no-image.png'; }; // Default image logic

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setReceiveForm(prev => ({
                ...prev,
                images: [...prev.images, ...files],
                previews: [...prev.previews, ...newPreviews]
            }));
        }
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

    const imageNotFound = (e) => {
        e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: isReadOnly ? '#2e7d32' : '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={1}>
                    {isReadOnly ? <RemoveRedEye /> : <Info />}
                    {isReadOnly ? 'รายละเอียดการรับอะไหล่ ' : 'ยืนยันรับอะไหล่ '}
                    ({selectedClaim?.claim_id})
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        📦 รายการที่ได้รับ:
                    </Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f9f9f9' }}>
                        <List dense>
                            {selectedClaim?.list?.map((detail, index) => {
                                const spImage = import.meta.env.VITE_IMAGE_SP + detail.sp_code + '.jpg';

                                return (
                                    <Box key={index} p={1} sx={{ borderBottom: '1px solid #eee' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography variant="body2" fontWeight="bold">{index + 1}.</Typography>
                                            <ListItemAvatar>
                                                <Box width={60} height={60} sx={{ bgcolor: 'white', border: '1px solid #eee', borderRadius: 1, p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img width='100%' height='100%' src={spImage} onError={imageNotFound} alt={detail.sp_name} style={{ objectFit: 'contain' }} />
                                                </Box>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight="bold">{detail.sp_code} : {detail.sp_name}</Typography>}
                                                secondary={`จำนวน: ${detail.qty} ${detail.unit || 'ชิ้น'}`}
                                            />
                                        </Box>
                                    </Box>
                                )
                            })}
                        </List>
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
                                        <Button component="label" variant="outlined" sx={{ width: '100%', height: '100%', minHeight: '100px', display: 'flex', flexDirection: 'column', gap: 1, borderStyle: 'dashed' }}>
                                            <PhotoCamera />
                                            <Typography variant="caption">เพิ่มรูป</Typography>
                                            <VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} />
                                        </Button>
                                    </Grid2>
                                )}
                            </Grid2>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                                <CloudUpload sx={{ fontSize: 48, color: '#bdbdbd' }} />
                                <Typography variant="caption" color="text.secondary" mb={2}>ยังไม่มีรูปภาพ</Typography>
                                {!isReadOnly && (
                                    <Button component="label" variant="contained" startIcon={<PhotoCamera />} size="small">
                                        เลือกรูปภาพ
                                        <VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleImageChange} />
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Box>

                    <TextField
                        label="หมายเหตุเพิ่มเติม (ถ้ามี)"
                        // placeholder="เช่น กล่องบุบ, ของไม่ครบ"
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        value={receiveForm.remark}
                        onChange={(e) => setReceiveForm(prev => ({ ...prev, remark: e.target.value }))}
                        disabled={isReadOnly}
                        slotProps={{ input: { readOnly: isReadOnly } }}
                    />
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
                            onClick={onSubmit}
                            variant="contained"
                            color="success"
                            startIcon={<Save />}
                            // แก้ไขตรงนี้: ตรวจสอบว่า images มีค่าหรือไม่
                            disabled={processing || receiveForm.images.length === 0}
                        >
                            {processing ? 'กำลังบันทึก...' : 'ยืนยันการรับของ'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};
// --------------------------------------------------------

export default function HistoryClaimNew({ history, shops, filters, isAdmin, areas }) {
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

    const handleOpenReceiveModal = (item) => {
        setSelectedClaim(item);
        if (item.receive_status === 'Y' && item.receive_evidence) {
            setReceiveForm({
                images: [], // กรณีดูย้อนหลัง ไม่ต้องใช้ images file object
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

    const handleSubmitReceive = () => {
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
                const errorMsg = err.images ? err.images : 'เกิดข้อผิดพลาด กรุณาลองใหม่';
                alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
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
            receive_status: filters?.receive_status || '',
            status: filters?.status || '',
            [key]: value
        };
        if (key === 'area') newFilters.shop = '';
        router.get(route('spareClaim.history'), newFilters, {
            preserveState: true, preserveScroll: true, replace: true
        });
    };

    const receiveStatusOptions = [
        { label: 'ทั้งหมด', value: '' },
        { label: 'รับแล้ว', value: 'Y' },
        { label: 'ยังไม่รับ', value: 'N' },
    ];

    // ... (TableData, MobileData functions เหมือนเดิม) ...
    function TableData() {
        return (
            <Table>
                <TableHead sx={TABLE_HEADER_STYLE}>
                    <TableRow>
                        <TableCell>เลขที่เอกสารเคลม</TableCell>
                        <TableCell>วันที่แจ้งเคลม</TableCell>
                        <TableCell>วันที่รับ</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell align="center">สถานะรับอะไหล่</TableCell>
                        <TableCell align='center'>#</TableCell>
                        <TableCell align='center'>รับอะไหล่</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((item) => {
                        const isReceived = item.receive_status === 'Y';
                        return (
                            <TableRow key={item.id}>
                                <TableCell>{item.claim_id}</TableCell>
                                <TableCell>{DateFormatTh({ date: item.created_at })}</TableCell>
                                <TableCell>{DateFormatTh({ date: item.updated_at })}</TableCell>
                                <TableCell><StatusClaim status={item.status} /></TableCell>
                                <TableCell align="center"><ReceiveStatus status={item.receive_status || 'N'} /></TableCell>
                                <TableCell align='center'>
                                    <Button onClick={() => redirectToDetail(item.claim_id)} variant='contained' size='small' startIcon={<RemoveRedEye />}>รายละเอียด</Button>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        onClick={() => handleOpenReceiveModal(item)}
                                        variant="contained" size="small"
                                        startIcon={isReceived ? <RemoveRedEye /> : <Info />}
                                        color={isReceived ? "success" : "warning"}
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
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>วันที่รับ</Typography>
                                        <Typography variant="body2">{DateFormatTh({ date: item.updated_at })}</Typography>
                                    </BoxComponent>
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>สถานะ</Typography>
                                        <StatusClaim status={item.status} />
                                    </BoxComponent>
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>สถานะรับอะไหล่</Typography>
                                        <ReceiveStatus status={item.receive_status || 'N'} />
                                    </BoxComponent>
                                    <Button onClick={() => redirectToDetail(item.claim_id)} variant='contained' size='small' startIcon={<RemoveRedEye />} fullWidth>รายละเอียด</Button>
                                    <Button
                                        onClick={() => handleOpenReceiveModal(item)}
                                        variant="contained" size="small"
                                        startIcon={isReceived ? <RemoveRedEye /> : <Info />}
                                        color={isReceived ? "success" : "warning"}
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
                            {selectedShopData && (
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
                                    value={receiveStatusOptions.find(opt => opt.value === (filters?.receive_status || '')) || receiveStatusOptions[0]}
                                    onChange={(e, newValue) => handleFilterChange('receive_status', newValue ? newValue.value : '')}
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

            {/* เรียกใช้ Component ที่ย้ายออกไป */}
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

const ReceiveStatus = ({ status }) => {
    const isReceived = status === 'Y';
    return <Chip size='small' variant="outlined" color={isReceived ? 'success' : 'warning'} label={isReceived ? 'รับแล้ว' : 'No'} sx={{ minWidth: '80px' }} />
}

const TABLE_HEADER_STYLE = { backgroundColor: '#c7c7c7', fontWeight: 'bold', fontSize: 16 };

const StatusClaim = ({ status }) => {
    const status_formated = {
        'pending': { status: 'secondary', label: 'กำลังตรวจสอบคำขอเคลม' },
        'approved': { status: 'success', label: 'อนุมัติคำสั่งส่งเคลม' },
        'rejected': { status: 'error', label: 'ไม่อนุมัติ' },
    }[status] || { status: 'info', label: 'ไม่สามารถระบุได้' };
    return <Chip size='small' color={status_formated.status} label={status_formated.label} />
}