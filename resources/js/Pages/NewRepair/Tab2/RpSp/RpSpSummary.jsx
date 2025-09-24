import {
    Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2,
    IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography, useMediaQuery, Collapse, Box, Divider
} from "@mui/material";
import React, { useState } from "react";
import { showDefaultImage } from "@/utils/showImage.js";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {ExpandLess, ExpandMore } from "@mui/icons-material";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";

export default function RpSpSummary({ spSelected, setShowSummary, onUpdateSpSelected, JOB, onSaved, setShowAddMore }) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [editingSpares, setEditingSpares] = useState({});
    const [claimDialog, setClaimDialog] = useState(false);
    const [selectedSpareForClaim, setSelectedSpareForClaim] = useState(null);
    const [loading, setLoading] = useState(false);
    const [claimData, setClaimData] = useState({
        claim: '', claim_remark: '', remark: ''
    });

    console.log(JOB)
    const [openIndex, setOpenIndex] = useState(null);
    const isMobile = useMediaQuery('(max-width:900px)');

    // คำนวณยอดรวม
    const calculateTotal = () => {
        return spSelected.reduce((total, sp) => {
            const price = parseFloat(sp.price_multiple_gp || 0);
            const qty = parseInt(sp.qty || 1);
            return total + (price * qty);
        }, 0);
    };

    // จัดการการแก้ไขข้อมูลอะไหล่
    const handleEditSpare = (spcode) => {
        const spare = spSelected.find(sp => sp.spcode === spcode);
        console.log(spare)
        setEditingSpares(prev => ({
            ...prev,
            [spcode]: {
                ...spare,
                price_multiple_gp: spare.price_multiple_gp || 0,
                qty: spare.qty || 1
            }
        }));
    };

    // บันทึกการแก้ไข
    const handleSaveEdit = (spcode) => {
        const editData = editingSpares[spcode];
        if (!editData) return;

        const newPrice = parseFloat(editData.price_multiple_gp);

        // ถ้าราคาเป็น 0 ให้เปิด dialog สำหรับเคลม
        if (newPrice === 0 && spcode !== 'SV001') {
            const spare = spSelected.find(sp => sp.spcode === spcode);
            if (!(spare.warranty === 'Y' && JOB.warranty)) {
                setSelectedSpareForClaim(spare);
                setClaimData({
                    claim_remark: spare.claim_remark,
                    remark: spare.remark,
                })
                setClaimDialog(true);
                return; // ออกจากฟังก์ชัน รอให้กรอกข้อมูลเคลม
            }
        }
        // ถ้าราคาไม่เป็น 0 ให้อัพเดทได้เลย
        const updatedSpares = spSelected.map(sp => {
            if (sp.spcode === spcode) {
                return {
                    ...sp,
                    spname: editData.spname,
                    price_multiple_gp: newPrice,
                    qty: parseInt(editData.qty) || 1,
                    remark_noclaim: editData.remark_noclaim,
                    claim: editData.claim,
                };
            }
            return sp;
        });

        onUpdateSpSelected(updatedSpares);

        // ลบข้อมูลการแก้ไขออกจาก state
        setEditingSpares(prev => {
            const newState = { ...prev };
            delete newState[spcode];
            return newState;
        });
    };

    // จัดการการเปลี่ยนแปลงข้อมูลในการแก้ไข
    const handleEditChange = (spcode, field, value) => {

        // ถ้ามีการเปลี่ยนแปลง หมายเหตุของการไม่เคลม
        if (field === 'remark_noclaim') {
            if ((value !== 'เคลมปกติ' && (value !== 'เคลมด่วน'))) {
                const sp_sel = spSelected.find(sp => sp.spcode === spcode)
                setEditingSpares(prev => ({
                    ...prev,
                    [spcode]: {
                        ...prev[spcode],
                        price_multiple_gp: sp_sel.price_per_unit,
                        claim: false,
                        [field]: value
                    }
                }));
                return;
            } else {
                setEditingSpares(prev => ({
                    ...prev,
                    [spcode]: {
                        ...prev[spcode],
                        price_multiple_gp: 0,
                        claim: true,
                        [field]: value
                    }
                }));
                return;
            }
        }

        if (field === 'price_multiple_gp' && parseFloat(value) === 0 && JOB.warranty) {
            setEditingSpares(prev => ({
                ...prev,
                [spcode]: {
                    ...prev[spcode],
                    claim: true,
                    remark_noclaim: 'เคลมปกติ',
                    [field]: value
                }
            }));
            return;
        }
        setEditingSpares(prev => ({
            ...prev,
            [spcode]: {
                ...prev[spcode],
                [field]: value
            }
        }));
    };

    // จัดการการบันทึกข้อมูลเคลม
    const handleSaveClaimData = () => {
        if (!selectedSpareForClaim) return;

        console.log(selectedSpareForClaim, spSelected);

        const editData = editingSpares[selectedSpareForClaim.spcode];

        const updatedSpares = spSelected.map(sp => {
            if (sp.spcode === selectedSpareForClaim.spcode) {
                return {
                    ...sp,
                    price_multiple_gp: 0, // บังคับให้เป็น 0 สำหรับการเคลม
                    qty: parseInt(editData?.qty) || 1,
                    claim: claimData.claim_remark !== 'ไม่เคลม',
                    claim_remark: claimData.claim_remark,
                    remark: claimData.remark,
                };
            }
            return sp;
        });

        onUpdateSpSelected(updatedSpares);

        // รีเซ็ตข้อมูล
        setEditingSpares(prev => {
            const newState = { ...prev };
            delete newState[selectedSpareForClaim.spcode];
            return newState;
        });
        setClaimDialog(false);
        setSelectedSpareForClaim(null);
        setClaimData({ claim: '', claim_remark: '', remark: '' });
    };

    const handleCloseModal = (e, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
        }
    }

    // ปิด dialog เคลม
    const handleCloseClaimDialog = () => {
        setClaimDialog(false);
        setSelectedSpareForClaim(null);
        setClaimData({ claim: '', claim_remark: '', remark: '' });
    };

    const handleSubmit = () => {
        console.log('spSelected >>> ', spSelected);
        AlertDialogQuestion({
            title: 'ยืนยันการบันทึก',
            text: 'กด ตกลง เพื่อบันทึกรายการอะไหล่',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        setLoading(true);
                        const { data, status } = await axios.post(route('repair.after.spare-part.store', {
                            job_id: JOB.job_id,
                            serial_id: JOB.serial_id,
                            spare_parts: spSelected
                        }))
                        console.log(data, status)
                        AlertDialog({
                            icon: 'success',
                            text: data.message,
                            onPassed: () => onSaved(data.full_file_path_qu)
                        })
                    } catch (error) {
                        AlertDialog({
                            text: error.response?.data?.message || error.message,
                        })
                    } finally {
                        setLoading(false);
                    }
                } else console.log('ไม่ได้กด confirm')
            }
        })
    }

    const handleRowClick = (index) => {
        if (isMobile) {
            setOpenIndex(openIndex === index ? null : index);
        }
    };

    return (
        <Grid2 container spacing={2}>
            {previewImage && (
                <SpPreviewImage
                    open={previewImage}
                    setOpen={setPreviewImage}
                    imagePath={previewSelected}
                />
            )}

            {/* ปุ่มกลับ */}
            <Grid2 size={12}>
                <Button
                    fullWidth={isMobile} color='inherit'
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setShowSummary(false)}
                    sx={{ mb: 2 }}
                >
                    กลับไปหน้าเพิ่ม/ลดอะไหล่
                </Button>
            </Grid2>

            {/* ตารางสรุปรายการ */}
            <Grid2 size={12}>
                <Card sx={{ overflow: 'auto' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            สรุปรายการอะไหล่และบริการ
                        </Typography>

                        {isMobile ? (
                            // Mobile View - Card Layout
                            <Stack spacing={2}>
                                {spSelected.map((sp, index) => {
                                    const imageSp = import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                                    const isEditing = editingSpares[sp.spcode];
                                    const price_per_unit = parseFloat(sp.price_per_unit || 0);
                                    const price_multiple_gp = parseFloat(sp.price_multiple_gp || 0);
                                    const qty = parseInt(sp.qty || 1);
                                    const totalPrice = price_multiple_gp * qty;
                                    const isOpen = openIndex === index;
                                    const GreenHighlight = JOB.warranty && sp.warranty === 'Y' ? '#e8f5e8' : 'inherit';

                                    return (
                                        <Card
                                            key={sp.spcode}
                                            sx={{
                                                backgroundColor: GreenHighlight,
                                                cursor: 'pointer',
                                                '&:hover': { backgroundColor: '#f5f5f5' }
                                            }}
                                        >
                                            <CardContent
                                                onClick={() => handleRowClick(index)}
                                                sx={{ pb: '8px !important' }}
                                            >
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <img
                                                            width={50} height={50} src={imageSp}
                                                            onError={showDefaultImage}
                                                            style={{ borderRadius: 4 }}
                                                        />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {sp.spcode}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                จำนวน: {qty}
                                                            </Typography>
                                                            <Typography variant="body2" color="primary"
                                                                fontWeight="bold">
                                                                {totalPrice.toFixed(2)} บาท
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <IconButton size="small">
                                                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </Box>
                                            </CardContent>

                                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                <CardContent sx={{ pt: 0 }}>
                                                    <Divider sx={{ mb: 2 }} />

                                                    {/* รายละเอียดสินค้า */}
                                                    <Stack spacing={2}>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                ชื่ออะไหล่:
                                                            </Typography>
                                                            {(isEditing && sp.spcode === 'SV001') ? (
                                                                <TextField
                                                                    fullWidth
                                                                    multiline
                                                                    minRows={2}
                                                                    size="small"
                                                                    value={isEditing.spname}
                                                                    onChange={(e) => handleEditChange(sp.spcode, 'spname', e.target.value)}
                                                                    sx={{ mt: 1 }}
                                                                />
                                                            ) : (
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {sp.spname}
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        <Grid2 container spacing={2}>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    หน่วย:
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {sp.spunit}
                                                                </Typography>
                                                            </Grid2>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    จำนวน:
                                                                </Typography>
                                                                {isEditing && sp.spcode !== 'SV001' ? (
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        value={isEditing.qty}
                                                                        onChange={(e) => handleEditChange(sp.spcode, 'qty', e.target.value)}
                                                                        inputProps={{ min: 1 }}
                                                                        sx={{ width: '80px' }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="body2">
                                                                        {qty}
                                                                    </Typography>
                                                                )}
                                                            </Grid2>
                                                        </Grid2>

                                                        <Grid2 container spacing={2}>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    ราคาต่อหน่วย:
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {price_per_unit.toFixed(2)} บาท
                                                                </Typography>
                                                            </Grid2>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    ราคา + GP:
                                                                </Typography>
                                                                {isEditing ? (
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        value={isEditing.price_multiple_gp}
                                                                        onChange={(e) => handleEditChange(sp.spcode, 'price_multiple_gp', e.target.value)}
                                                                        inputProps={{ min: 0, step: 1 }}
                                                                        sx={{ width: '100px' }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="body2">
                                                                        {price_multiple_gp.toFixed(2)} บาท
                                                                    </Typography>
                                                                )}
                                                            </Grid2>
                                                        </Grid2>

                                                        {/* หมายเหตุและการเคลม */}
                                                        {JOB.warranty && sp.warranty === 'Y' && !sp.claim && sp.remark_noclaim && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    หมายเหตุของการไม่เคลม:
                                                                </Typography>
                                                                <Typography variant="body2" color="orange">
                                                                    {sp.remark_noclaim}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {(sp.claim_remark && parseFloat(sp.price_multiple_gp) === 0) && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    เคลม:
                                                                </Typography>
                                                                <Typography variant="body2" color="green">
                                                                    {sp.claim_remark}
                                                                </Typography>
                                                                {sp.remark && (
                                                                    <>
                                                                        <Typography variant="body2"
                                                                            color="text.secondary">
                                                                            หมายเหตุ:
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            {sp.remark}
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        )}

                                                        {(isEditing && JOB.warranty && sp.warranty === 'Y') && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary"
                                                                    sx={{ mb: 1 }}>
                                                                    หมายเหตุของการไม่เคลม (ไม่บังคับ):
                                                                </Typography>
                                                                <Select
                                                                    fullWidth
                                                                    size='small'
                                                                    value={editingSpares[sp.spcode]?.remark_noclaim || 'เคลมปกติ'}
                                                                    onChange={(e) => handleEditChange(sp.spcode, 'remark_noclaim', e.target.value)}
                                                                >
                                                                    <MenuItem value={'เคลมปกติ'}>
                                                                        เคลมปกติ
                                                                    </MenuItem>
                                                                    <MenuItem value={'เคลมด่วน'}>
                                                                        เคลมด่วน
                                                                    </MenuItem>
                                                                    <MenuItem value={'ลูกค้ามีการดัดแปลงสภาพเครื่องมา'}>
                                                                        ลูกค้ามีการดัดแปลงสภาพเครื่องมา
                                                                    </MenuItem>
                                                                    <MenuItem value={'ลูกค้าใช้งานผิดวัตถุประสงค์'}>
                                                                        ลูกค้าใช้งานผิดวัตถุประสงค์
                                                                    </MenuItem>
                                                                </Select>
                                                            </Box>
                                                        )}

                                                        {/* ปุ่มจัดการ */}
                                                        <Box display="flex" justifyContent="space-between"
                                                            alignItems="center">
                                                            <Typography variant="h6" color="primary">
                                                                รวม: {totalPrice.toFixed(2)} บาท
                                                            </Typography>
                                                            <Box display="flex" gap={1}>
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPreviewImage(true);
                                                                        setPreviewSelected(imageSp);
                                                                    }}
                                                                    size="small"
                                                                >
                                                                    <img width={20} src={imageSp}
                                                                        onError={showDefaultImage} alt="" />
                                                                </IconButton>
                                                                {isEditing ? (
                                                                    <IconButton
                                                                        color="success"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSaveEdit(sp.spcode);
                                                                        }}
                                                                        size="small"
                                                                    >
                                                                        <SaveIcon />
                                                                    </IconButton>
                                                                ) : (
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditSpare(sp.spcode);
                                                                        }}
                                                                        size="small"
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Collapse>
                                        </Card>
                                    );
                                })}

                                {/* ยอดรวมใน Mobile */}
                                <Card sx={{ backgroundColor: '#f5f5f5' }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6">
                                                ยอดรวมทั้งหมด:
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                                {calculateTotal().toFixed(2)} บาท
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Stack>
                        ) : (
                            // Desktop View - Table Layout
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>รูปภาพ</TableCell>
                                        <TableCell>รหัสและชื่ออะไหล่</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>ราคาต่อหน่วย</TableCell>
                                        <TableCell>ราคาที่ + GP แล้ว</TableCell>
                                        <TableCell>ราคารวม</TableCell>
                                        <TableCell>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {spSelected.map((sp, index) => {
                                        const imageSp = import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                                        const isEditing = editingSpares[sp.spcode];
                                        const price_per_unit = parseFloat(sp.price_per_unit || 0);
                                        const price_multiple_gp = parseFloat(sp.price_multiple_gp || 0);
                                        const qty = parseInt(sp.qty || 1);
                                        const totalPrice = price_multiple_gp * qty;
                                        const GreenHighlight = JOB.warranty && sp.warranty === 'Y' ? '#e8f5e8' : 'inherit';

                                        return (
                                            <RowTable
                                                key={sp.spcode}
                                                imageSp={imageSp}
                                                isEditing={isEditing}
                                                price_per_unit={price_per_unit}
                                                price_multiple_gp={price_multiple_gp}
                                                qty={qty}
                                                totalPrice={totalPrice}
                                                GreenHighlight={GreenHighlight}
                                                sp={sp}
                                                index={index}
                                                isOpen={openIndex === index}
                                                openIndex={openIndex}
                                                setOpenIndex={setOpenIndex}
                                                isMobile={isMobile}
                                                editingSpares={editingSpares}
                                                JOB={JOB}
                                                spSelected={spSelected}
                                                handleEditChange={handleEditChange}
                                                handleEditSpare={handleEditSpare}
                                                handleSaveEdit={handleSaveEdit}
                                                setPreviewImage={setPreviewImage}
                                                setPreviewSelected={setPreviewSelected}
                                            />
                                        );
                                    })}

                                    {/* แถวยอดรวม */}
                                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                        <TableCell colSpan={6} align="right">
                                            <Typography>ยอดรวมทั้งหมด: </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="primary">
                                                {calculateTotal().toFixed(2)} บาท
                                            </Typography>
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </Grid2>
            <Box
                position="fixed" bottom={0} left={0}
                width="100%" zIndex={1000} bgcolor="white"
                boxShadow={3} p={1}
            >

                <Grid2 size={12}>
                    <Stack direction='row' justifyContent='end'>
                        <Button
                            loading={loading} fullWidth={isMobile}
                            disabled={Object.keys(editingSpares).length !== 0}
                            variant='contained' size='large'
                            startIcon={<SaveIcon />} onClick={handleSubmit}
                        >
                            บันทึก
                        </Button>
                    </Stack>
                </Grid2>
            </Box>

            {/* Dialog สำหรับกรอกข้อมูลเคลม */}
            <Dialog open={claimDialog} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    ระบุข้อมูลการเคลม
                    <Typography variant="body2" color="text.secondary">
                        เนื่องจากท่านไม่ได้คิดค่าราคาอะไหล่นอกประกัน กรุณากรอกรายละเอียด
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid2 container spacing={2} sx={{ mt: 1 }}>
                        <Grid2 size={12}>
                            <FormControl fullWidth required>
                                <InputLabel>ประเภทการเคลม</InputLabel>
                                <Select
                                    value={claimData.claim_remark} label="ประเภทการเคลม"
                                    onChange={(e) => setClaimData(prev => ({
                                        ...prev,
                                        claim_remark: e.target.value
                                    }))}
                                >
                                    <MenuItem value="ไม่เคลม">ไม่เคลม</MenuItem>
                                    <MenuItem value="เคลมด่วน">
                                        เคลมด่วน
                                    </MenuItem>
                                    <MenuItem value="เคลมสินค้านี้ซีเรียลหมดประกันตามเงื่อนไขแล้ว">
                                        เคลมสินค้านี้ซีเรียลหมดประกันตามเงื่อนไขแล้ว
                                    </MenuItem>
                                    <MenuItem value="เคลมอะไหล่นอกประกันที่เกิดความเสียหายต่อเนื่อง">
                                        เคลมอะไหล่นอกประกันที่เกิดความเสียหายต่อเนื่อง
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                            <TextField
                                fullWidth multiline rows={3} label="หมายเหตุการเคลม"
                                value={claimData.remark}
                                onChange={(e) => setClaimData(prev => ({ ...prev, remark: e.target.value }))}
                                required={claimData.claimType !== 'ไม่เคลม'}
                                helperText={claimData.claimType === 'ไม่เคลม' ? 'ไม่บังคับกรอก' : 'บังคับกรอก'}
                            />
                        </Grid2>
                    </Grid2>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseClaimDialog}>ยกเลิก</Button>
                    <Button
                        onClick={handleSaveClaimData} variant="contained"
                        disabled={(claimData.claim_remark !== 'ไม่เคลม' && !claimData.remark?.trim())}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid2>
    );
}

const RowTable = (props) => {
    const { editingSpares, spSelected, JOB, handleEditChange, handleEditSpare, handleSaveEdit, sp } = props;
    const { setPreviewImage, setPreviewSelected } = props;
    const { isMobile } = props;
    const { isEditing, imageSp, GreenHighlight, price_per_unit, price_multiple_gp, qty, totalPrice } = props;
    const { isOpen, setOpenIndex, openIndex, index } = props;

    return (
        <TableRow sx={{ backgroundColor: GreenHighlight }}>
            <TableCell
                onClick={() => {
                    setPreviewImage(true);
                    setPreviewSelected(imageSp);
                }}
                sx={{ cursor: 'pointer' }}
            >
                <img width={50} src={imageSp} onError={showDefaultImage} alt="" />
            </TableCell>
            <TableCell>
                {(isEditing && sp.spcode === 'SV001') ? (
                    <>
                        <TextField
                            type="text" multiline minRows={2} size="small"
                            value={isEditing.spname} sx={{ width: '250px' }}
                            onChange={(e) => handleEditChange(sp.spcode, 'spname', e.target.value)}
                        />
                    </>
                ) : (
                    <>
                        ({sp.spcode})&nbsp;{sp.spname}
                    </>
                )}
                {JOB.warranty && sp.warranty === 'Y' && !sp.claim && sp.remark_noclaim && (
                    <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                        หมายเหตุของการไม่เคลม: {sp.remark_noclaim}
                    </div>
                )}

                {(sp.claim_remark && parseFloat(sp.price_multiple_gp) === 0) && (
                    <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                        เคลม: {sp.claim_remark}
                        {sp.remark && (
                            <div>หมายเหตุ: {sp.remark}</div>
                        )}
                    </div>
                )}
                {(isEditing && JOB.warranty && sp.warranty === 'Y') && (
                    <>
                        <br />
                        <>หมายเหตุของการไม่เคลม (ไม่บังคับ)</>
                        <br />
                        <Select
                            onChange={(e) => handleEditChange(sp.spcode, 'remark_noclaim', e.target.value)}
                            size='small' name="remark_noclaim"
                            defaultValue={sp.remark_noclaim || 'เคลมปกติ'}
                            id="no-claim" variant='outlined'>
                            <MenuItem value={'เคลมปกติ'}>
                                เคลมปกติ
                            </MenuItem>
                            <MenuItem value={'เคลมด่วน'}>
                                เคลมด่วน
                            </MenuItem>
                            <MenuItem value={'ลูกค้ามีการดัดแปลงสภาพเครื่องมา'}>
                                ลูกค้ามีการดัดแปลงสภาพเครื่องมา
                            </MenuItem>
                            <MenuItem value={'ลูกค้าใช้งานผิดวัตถุประสงค์'}>
                                ลูกค้าใช้งานผิดวัตถุประสงค์
                            </MenuItem>
                        </Select>
                    </>
                )}
            </TableCell>
            <TableCell>{sp.spunit}</TableCell>
            <TableCell>
                {isEditing && sp.spcode !== 'SV001' ? (
                    <TextField
                        type="number" size="small" value={isEditing.qty}
                        onChange={(e) => handleEditChange(sp.spcode, 'qty', e.target.value)}
                        inputProps={{ min: 1 }} sx={{ width: '80px' }}
                    />
                ) : (
                    qty
                )}
            </TableCell>
            <TableCell>
                {`${price_per_unit.toFixed(2)} บาท`}
            </TableCell>
            <TableCell onClick={() => console.log(spSelected)}>
                {isEditing ? (
                    <TextField
                        type="number" size="small" value={isEditing.price_multiple_gp}
                        onChange={(e) => handleEditChange(sp.spcode, 'price_multiple_gp', e.target.value)}
                        inputProps={{ min: 0, step: 1 }} sx={{ width: '100px' }}
                    />
                ) : (
                    <>
                        {parseFloat(sp.price_multiple_gp || 0)}
                    </>
                )}
            </TableCell>
            <TableCell>
                {totalPrice.toFixed(2)} บาท
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <IconButton
                        color="success" size="small"
                        onClick={() => handleSaveEdit(sp.spcode)}
                    >
                        <SaveIcon />
                    </IconButton>
                ) : (
                    <IconButton
                        color="primary" size="small"
                        onClick={() => handleEditSpare(sp.spcode)}
                    >
                        <EditIcon />
                    </IconButton>
                )}
            </TableCell>
        </TableRow>
    )
}