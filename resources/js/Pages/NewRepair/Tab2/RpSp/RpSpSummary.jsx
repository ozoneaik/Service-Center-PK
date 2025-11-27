import {
    Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2,
    IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography, useMediaQuery, Collapse, Box, Divider, Checkbox, FormControlLabel, Switch
} from "@mui/material";
import React, { useState } from "react";
import axios from "axios";
import { showDefaultImage } from "@/utils/showImage.js";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Cancel, ExpandLess, ExpandMore } from "@mui/icons-material";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import ReplayIcon from '@mui/icons-material/Replay';

export default function RpSpSummary({ spSelected, setShowSummary, onUpdateSpSelected, JOB, onSaved, setShowAddMore }) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [editingSpares, setEditingSpares] = useState({});
    const [claimDialog, setClaimDialog] = useState(false);
    const [selectedSpareForClaim, setSelectedSpareForClaim] = useState(null);
    const [originalPricesBeforeFastAll, setOriginalPricesBeforeFastAll] = useState({});
    const [loading, setLoading] = useState(false);
    // const hasFastClaim = spSelected.some(sp => sp.fast_claim === true);

    const [claimData, setClaimData] = useState({
        claim: '', claim_remark: '', remark: ''
    });

    const [openIndex, setOpenIndex] = useState(null);
    const isMobile = useMediaQuery('(max-width:900px)');

    // อยู่ในประกันไหม (งานอยู่ในประกัน + อะไหล่ Y)
    // const isCoveredByWarranty = (sp) => (JOB?.warranty && sp?.warranty === 'Yes');
    const isCoveredByWarranty = (sp) => {
        const w = sp.sp_warranty ?? sp.warranty;

        return JOB?.warranty === true && (
            w === true ||
            w === "Y" ||
            w === "yes"
        );
    };

    const hasFastClaimInWarranty = spSelected.some(
        sp => isCoveredByWarranty(sp) && sp.fast_claim === true
    );

    // รวมยอด
    const calculateTotal = () => {
        return spSelected.reduce((total, sp) => {
            const price = parseFloat(sp.price_multiple_gp || 0);
            const qty = parseInt(sp.qty || 1);
            return total + (price * qty);
        }, 0);
    };

    // เข้าโหมดแก้ไขแถว
    const handleEditSpare = (spcode) => {
        const spare = spSelected.find(sp => sp.spcode === spcode);
        setEditingSpares(prev => ({
            ...prev,
            [spcode]: {
                ...spare,
                price_multiple_gp: spare.price_multiple_gp ?? 0,
                qty: spare.qty ?? 1,
                fast_claim: !!spare.fast_claim,
            }
        }));
    };

    // toggle เคลมด่วน (นอกประกันเท่านั้น)
    const handleFastClaimToggle = (spcode, checked) => {
        const spare = spSelected.find(sp => sp.spcode === spcode);
        if (!spare) return;
        if (isCoveredByWarranty(spare) || spare.spcode === 'SV001') return;

        if (checked) {
            setEditingSpares(prev => ({
                ...prev,
                [spcode]: { ...prev[spcode], fast_claim: true, price_multiple_gp: 0 }
            }));
            setSelectedSpareForClaim(spare);
            setClaimData({
                claim_remark: 'เคลมด่วน',
                remark: spare.remark || '',
            });
            setClaimDialog(true);
        } else {
            // ยกเลิก -> คืนเป็นราคา base (price_per_unit)
            const basePrice = parseFloat(spare.price_per_unit || 0);
            setEditingSpares(prev => ({
                ...prev,
                [spcode]: { ...prev[spcode], fast_claim: false, price_multiple_gp: basePrice }
            }));
        }
    };

    // const handleFastClaimAll = () => {
    //     // เลือกเฉพาะรายการที่อยู่ในประกันจริงๆ
    //     const target = spSelected.filter(sp =>
    //         isCoveredByWarranty(sp) && sp.spcode !== "SV001"
    //     );

    //     if (target.length === 0) {
    //         AlertDialog({
    //             text: "ไม่มีอะไหล่ที่อยู่ในประกันให้เคลมด่วนได้",
    //             icon: "info"
    //         });
    //         return;
    //     }

    //     // เก็บราคาเดิมเฉพาะตัวที่เราจะปรับ
    //     const keepOriginal = {};
    //     target.forEach(sp => {
    //         keepOriginal[sp.spcode] = sp.price_multiple_gp;
    //     });
    //     setOriginalPricesBeforeFastAll(keepOriginal);

    //     // อัปเดตเฉพาะตัวที่อยู่ในประกันเท่านั้น
    //     const updated = spSelected.map(sp => {
    //         if (isCoveredByWarranty(sp) && sp.spcode !== "SV001") {
    //             return {
    //                 ...sp,
    //                 price_multiple_gp: 0,
    //                 fast_claim: true,
    //                 claim: true,
    //                 claim_remark: "เคลมด่วน",
    //             };
    //         }
    //         return sp;
    //     });

    //     onUpdateSpSelected(updated);
    // };

    const handleFastClaimAll = () => {
        // เลือกทุกรายการที่ไม่ใช่ SV001
        const target = spSelected.filter(sp => sp.spcode !== "SV001");

        if (target.length === 0) {
            AlertDialog({
                text: "ไม่มีอะไหล่ให้เคลมด่วน",
                icon: "info"
            });
            return;
        }

        // เก็บราคาเดิมทุกตัว (ก่อนเคลมด่วน)
        const keepOriginal = {};
        target.forEach(sp => {
            keepOriginal[sp.spcode] = sp.price_multiple_gp;
        });
        setOriginalPricesBeforeFastAll(keepOriginal);

        // เคลมด่วนทั้งหมด (ไม่สนว่าประกันหรือไม่)
        const updated = spSelected.map(sp => {
            if (sp.spcode !== "SV001") {
                return {
                    ...sp,
                    price_multiple_gp: 0,
                    fast_claim: true,
                    claim: true,
                    claim_remark: "เคลมด่วน",
                    remark: "",
                };
            }
            return sp;
        });

        onUpdateSpSelected(updated);
    };

    // const handleCancelFastClaimAll = () => {
    //     const updated = spSelected.map(sp => {
    //         if (sp.spcode === "SV001") return sp;
    //         if (isCoveredByWarranty(sp)) {
    //             return {
    //                 ...sp,
    //                 fast_claim: false,
    //                 claim: false,
    //                 claim_remark: "",
    //                 price_multiple_gp: originalPricesBeforeFastAll[sp.spcode] ?? sp.price_multiple_gp,
    //                 remark: sp.remark,
    //             };
    //         }

    //         return sp;
    //     });

    //     onUpdateSpSelected(updated);

    //     // เคลียร์ state เดิม
    //     setEditingSpares({});
    //     setClaimDialog(false);
    //     setSelectedSpareForClaim(null);
    //     setClaimData({ claim: '', claim_remark: '', remark: '' });

    //     setOriginalPricesBeforeFastAll({});
    // };

    // บันทึกแถว

    const handleCancelFastClaimAll = () => {
        const updated = spSelected.map(sp => {
            if (sp.spcode !== "SV001") {
                return {
                    ...sp,
                    fast_claim: false,
                    claim: false,
                    claim_remark: "",
                    remark: "",
                    price_multiple_gp: originalPricesBeforeFastAll[sp.spcode] ?? sp.price_multiple_gp,
                    // remark: sp.remark,
                    // remark: "",
                };
            }
            return sp;
        });

        onUpdateSpSelected(updated);

        // เคลียร์ state เดิม
        setEditingSpares({});
        setClaimDialog(false);
        setSelectedSpareForClaim(null);
        setClaimData({ claim: '', claim_remark: '', remark: '' });
        setOriginalPricesBeforeFastAll({});
    };

    const handleSaveEdit = (spcode) => {
        const editData = editingSpares[spcode];
        if (!editData) return;

        const spare = spSelected.find(sp => sp.spcode === spcode);
        const newPrice = parseFloat(editData.price_multiple_gp);

        // นอกประกัน + ราคา 0 -> ต้องระบุข้อมูลเคลม
        if (newPrice === 0 && spcode !== 'SV001' && !isCoveredByWarranty(spare)) {
            setSelectedSpareForClaim(spare);
            setClaimData({
                claim_remark: editData.fast_claim ? 'เคลมด่วน' : (spare.claim_remark || ''),
                remark: spare.remark || '',
            });
            setClaimDialog(true);
            return;
        }

        // อัพเดทได้เลย
        const updatedSpares = spSelected.map(sp => {
            if (sp.spcode === spcode) {
                return {
                    ...sp,
                    spname: editData.spname,
                    price_multiple_gp: newPrice,
                    qty: parseInt(editData.qty) || 1,
                    remark_noclaim: editData.remark_noclaim,
                    claim: editData.claim,
                    fast_claim: editData.fast_claim || false,
                };
            }
            return sp;
        });

        onUpdateSpSelected(updatedSpares);

        setEditingSpares(prev => {
            const newState = { ...prev };
            delete newState[spcode];
            return newState;
        });
    };

    const handleCancelEdit = (spcode) => {
        setEditingSpares(prev => {
            const newState = { ...prev };
            delete newState[spcode];
            return newState;
        });
    };

    const handleEditChange = (spcode, field, value) => {
        const sp_sel = spSelected.find(sp => sp.spcode === spcode);
        // remark_noclaim เฉพาะอะไหล่ที่ "อยู่ในประกัน"
        if (field === 'remark_noclaim') {
            if (value === 'เคลมด่วน') {
                setEditingSpares(prev => ({
                    ...prev,
                    [spcode]: {
                        ...prev[spcode],
                        price_multiple_gp: 0,
                        claim: true,
                        fast_claim: true,
                        [field]: value
                    }
                }));
            } else if (value === 'เคลมปกติ') {
                setEditingSpares(prev => ({
                    ...prev,
                    [spcode]: {
                        ...prev[spcode],
                        price_multiple_gp: 0,
                        claim: true,
                        fast_claim: false,
                        [field]: value
                    }
                }));
            } else {
                // ค่าอื่นๆ (ไม่เคลม) -> ราคา base + fast_claim = false
                setEditingSpares(prev => ({
                    ...prev,
                    [spcode]: {
                        ...prev[spcode],
                        price_multiple_gp: sp_sel.price_per_unit,
                        claim: false,
                        fast_claim: false,
                        [field]: value
                    }
                }));
            }
            return;
        }

        // ถ้าตั้งราคาเป็น 0 ขณะ edit + งานอยู่ในประกัน -> เคลมปกติ
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

    const handleResetPrice = (spcode) => {
        const spare = spSelected.find(s => s.spcode === spcode);
        if (!spare) return;

        const original = parseFloat(spare.price_per_unit || 0);

        setEditingSpares(prev => ({
            ...prev,
            [spcode]: {
                ...prev[spcode],
                price_multiple_gp: original,
                fast_claim: false,
                claim: false,
                claim_remark: "",
                remark: "",
                remark_noclaim: "",
            }
        }));
    };

    // บันทึกข้อมูลจาก Dialog เคลม
    const handleSaveClaimData = () => {
        if (!selectedSpareForClaim) return;
        const editData = editingSpares[selectedSpareForClaim.spcode];

        const updatedSpares = spSelected.map(sp => {
            if (sp.spcode === selectedSpareForClaim.spcode) {
                return {
                    ...sp,
                    price_multiple_gp: 0,
                    qty: parseInt(editData?.qty) || 1,
                    claim: claimData.claim_remark !== 'ไม่เคลม',
                    claim_remark: claimData.claim_remark,
                    remark: claimData.remark,
                    fast_claim: claimData.claim_remark === 'เคลมด่วน',
                };
            }
            return sp;
        });

        if (selectedSpareForClaim?.spcode === "__ALL__") {

            const updated = spSelected.map(sp => {
                if (!isCoveredByWarranty(sp) && sp.spcode !== 'SV001') {
                    return {
                        ...sp,
                        price_multiple_gp: 0,
                        claim: true,
                        claim_remark: "เคลมด่วน",
                        remark: claimData.remark,
                        fast_claim: true,
                    };
                }
                return sp;
            });

            onUpdateSpSelected(updated);

            setEditingSpares({});
            setClaimDialog(false);
            setSelectedSpareForClaim(null);
            setClaimData({ claim: '', claim_remark: '', remark: '' });
            return;
        }

        onUpdateSpSelected(updatedSpares);

        // clear editing state ของแถวนี้
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
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    };

    const handleCloseClaimDialog = () => {
        setClaimDialog(false);
        setSelectedSpareForClaim(null);
        setClaimData({ claim: '', claim_remark: '', remark: '' });
    };

    const handleSubmit = () => {
        AlertDialogQuestion({
            title: 'ยืนยันการบันทึก',
            text: 'กด ตกลง เพื่อบันทึกรายการอะไหล่',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        setLoading(true);
                        // const { data } = await axios.post(
                        //     route('repair.after.spare-part.store', {
                        //     job_id: JOB.job_id,
                        //     serial_id: JOB.serial_id,
                        //     spare_parts: spSelected
                        // }));
                        const { data } = await axios.post(
                            route('repair.after.spare-part.store'),
                            {
                                job_id: JOB.job_id,
                                serial_id: JOB.serial_id,
                                spare_parts: spSelected
                            }
                        );
                        AlertDialog({
                            icon: 'success',
                            text: data.message,
                            onPassed: () => onSaved(data.full_file_path_qu)
                        });
                    } catch (error) {
                        AlertDialog({
                            text: error.response?.data?.message || error.message,
                        });
                    } finally {
                        setLoading(false);
                    }
                }
            }
        });
    };

    const handleRowClick = (index) => {
        if (isMobile) setOpenIndex(openIndex === index ? null : index);
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    สรุปรายการอะไหล่และบริการ
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={handleFastClaimAll}
                                >
                                    เคลมด่วนทั้งหมด
                                </Button>
                                {hasFastClaimInWarranty && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleCancelFastClaimAll}
                                        sx={{ ml: 1 }}
                                    >
                                        ยกเลิกเคลมด่วนทั้งหมด
                                    </Button>
                                )}
                            </Box>
                        </Box>

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
                                    const GreenHighlight = isCoveredByWarranty(sp) ? '#e8f5e8' : 'inherit';

                                    const canFastClaim = isEditing && !isCoveredByWarranty(sp) && sp.spcode !== 'SV001';

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
                                                            <Typography variant="body2" color="primary" fontWeight="bold">
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
                                                                    fullWidth multiline minRows={2} size="small"
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
                                                                <Typography variant="body2" color="text.secondary">หน่วย:</Typography>
                                                                <Typography variant="body2">{sp.spunit}</Typography>
                                                            </Grid2>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">จำนวน:</Typography>
                                                                {isEditing && sp.spcode !== 'SV001' ? (
                                                                    <TextField
                                                                        type="number" size="small" value={isEditing.qty}
                                                                        onChange={(e) => handleEditChange(sp.spcode, 'qty', e.target.value)}
                                                                        inputProps={{ min: 1 }} sx={{ width: '80px' }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="body2">{qty}</Typography>
                                                                )}
                                                            </Grid2>
                                                        </Grid2>

                                                        <Grid2 container spacing={2}>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">ราคาต่อหน่วย:</Typography>
                                                                <Typography variant="body2">{price_per_unit.toFixed(2)} บาท</Typography>
                                                            </Grid2>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">ราคา + GP:</Typography>
                                                                {isEditing ? (
                                                                    <TextField
                                                                        type="number" size="small" value={isEditing.price_multiple_gp}
                                                                        onChange={(e) => handleEditChange(sp.spcode, 'price_multiple_gp', e.target.value)}
                                                                        inputProps={{ min: 0, step: 1 }} sx={{ width: '100px' }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="body2">{price_multiple_gp.toFixed(2)} บาท</Typography>
                                                                )}
                                                            </Grid2>
                                                        </Grid2>

                                                        {/* หัวข้อเคลมด่วน + สวิตช์ (Mobile / เฉพาะนอกประกัน) */}
                                                        {/* {canFastClaim && (
                                                            <>
                                                                <Divider textAlign="left" sx={{ mt: 1, mb: 1 }}>
                                                                    เคลมด่วน
                                                                </Divider>
                                                                <FormControlLabel
                                                                    label="ตั้งราคา +GP = 0 และระบุเหตุผล"
                                                                    labelPlacement="start"
                                                                    control={
                                                                        <Switch
                                                                            checked={!!editingSpares[sp.spcode]?.fast_claim}
                                                                            onChange={(e) =>
                                                                                handleFastClaimToggle(sp.spcode, e.target.checked)
                                                                            }
                                                                        />
                                                                    }
                                                                    sx={{
                                                                        m: 0, pl: 1,
                                                                        '& .MuiFormControlLabel-label': { fontSize: 14 }
                                                                    }}
                                                                />
                                                                <Typography variant="caption" sx={{ px: 2, color: 'text.secondary' }}>
                                                                    * ใช้เฉพาะอะไหล่นอกประกันเท่านั้น
                                                                </Typography>
                                                            </>
                                                        )} */}

                                                        {/* หมายเหตุและการเคลม */}
                                                        {isCoveredByWarranty(sp) && !sp.claim && sp.remark_noclaim && (
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
                                                                <Typography variant="body2" color="text.secondary">เคลม:</Typography>
                                                                <Typography variant="body2" color="green">{sp.claim_remark}</Typography>
                                                                {sp.remark && (
                                                                    <>
                                                                        <Typography variant="body2" color="text.secondary">หมายเหตุ:</Typography>
                                                                        <Typography variant="body2">{sp.remark}</Typography>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        )}

                                                        {(isEditing && isCoveredByWarranty(sp)) && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                    หมายเหตุของการไม่เคลม (ไม่บังคับ):
                                                                </Typography>
                                                                <Select
                                                                    fullWidth size='small'
                                                                    value={editingSpares[sp.spcode]?.remark_noclaim || 'เคลมปกติ'}
                                                                    onChange={(e) => handleEditChange(sp.spcode, 'remark_noclaim', e.target.value)}
                                                                >
                                                                    <MenuItem value={'เคลมปกติ'}>เคลมปกติ</MenuItem>
                                                                    {/* <MenuItem value={'เคลมด่วน'}>เคลมด่วน</MenuItem> */}
                                                                    <MenuItem value={'ลูกค้ามีการดัดแปลงสภาพเครื่องมา'}>ลูกค้ามีการดัดแปลงสภาพเครื่องมา</MenuItem>
                                                                    <MenuItem value={'ลูกค้าใช้งานผิดวัตถุประสงค์'}>ลูกค้าใช้งานผิดวัตถุประสงค์</MenuItem>
                                                                </Select>
                                                            </Box>
                                                        )}

                                                        {/* ปุ่มจัดการ */}
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
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
                                                                    <img width={20} src={imageSp} onError={showDefaultImage} alt="" />
                                                                </IconButton>
                                                                {isEditing ? (
                                                                    <>
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

                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCancelEdit(sp.spcode);
                                                                            }}
                                                                            size="small"
                                                                        >
                                                                            <CloseIcon />
                                                                        </IconButton>

                                                                        {!isCoveredByWarranty(sp) && (
                                                                            <IconButton
                                                                                color="warning"
                                                                                size="small"
                                                                                title="รีเซ็ทราคาเป็นค่าเดิม"
                                                                                onClick={() => handleResetPrice(sp.spcode)}
                                                                            >
                                                                                <Cancel />
                                                                            </IconButton>
                                                                        )}
                                                                    </>
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
                                            <Typography variant="h6">ยอดรวมทั้งหมด:</Typography>
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
                                        <TableCell>เคลมด่วน</TableCell>
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
                                        const GreenHighlight = isCoveredByWarranty(sp) ? '#e8f5e8' : 'inherit';

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
                                                handleCancelEdit={handleCancelEdit}
                                                handleResetPrice={handleResetPrice}
                                                handleFastClaimToggle={handleFastClaimToggle}
                                                isCoveredByWarranty={isCoveredByWarranty}
                                                setPreviewImage={setPreviewImage}
                                                setPreviewSelected={setPreviewSelected}
                                            />
                                        );
                                    })}

                                    {/* แถวยอดรวม */}
                                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                        <TableCell colSpan={7} align="right">
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

            {/* ปุ่มบันทึก ล่างจอ */}
            <Box position="fixed" bottom={0} left={0} width="100%" zIndex={1000} bgcolor="white" boxShadow={3} p={1}>
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
                                    // onChange={(e) => setClaimData(prev => ({ ...prev, claim_remark: e.target.value }))}
                                    // disabled={editingSpares[selectedSpareForClaim?.spcode]?.fast_claim}
                                    onChange={(e) => setClaimData(prev => ({ ...prev, claim_remark: e.target.value }))}
                                    // disabled={selectedSpareForClaim?.spcode === "__ALL__" || editingSpares[selectedSpareForClaim?.spcode]?.fast_claim}
                                    disabled={selectedSpareForClaim?.spcode === "__ALL__"}
                                >
                                    <MenuItem value="ไม่เคลม">ไม่เคลม</MenuItem>
                                    <MenuItem value="เคลมด่วน" disabled>เคลมด่วน</MenuItem>
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
                                required={claimData.claim_remark !== 'ไม่เคลม'}
                                helperText={claimData.claim_remark === 'ไม่เคลม' ? 'ไม่บังคับกรอก' : 'บังคับกรอก'}
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
    const {
        editingSpares, spSelected, JOB, handleEditChange, handleEditSpare, handleSaveEdit, handleCancelEdit, handleResetPrice, handleFastClaimToggle,
        sp, setPreviewImage, setPreviewSelected, isEditing, imageSp, GreenHighlight, price_per_unit, price_multiple_gp, qty, totalPrice,
        isCoveredByWarranty
    } = props;

    const canFastClaim = isEditing && !isCoveredByWarranty(sp) && sp.spcode !== 'SV001';

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
                    <TextField
                        type="text" multiline minRows={2} size="small"
                        value={editingSpares[sp.spcode]?.spname} sx={{ width: '250px' }}
                        onChange={(e) => handleEditChange(sp.spcode, 'spname', e.target.value)}
                    />
                ) : (
                    <>({sp.spcode})&nbsp;{sp.spname}</>
                )}

                {isCoveredByWarranty(sp) && !sp.claim && sp.remark_noclaim && (
                    <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                        หมายเหตุของการไม่เคลม: {sp.remark_noclaim}
                    </div>
                )}

                {(sp.claim_remark && parseFloat(sp.price_multiple_gp) === 0) && (
                    <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                        เคลม: {sp.claim_remark}
                        {sp.remark && (<div>หมายเหตุ: {sp.remark}</div>)}
                    </div>
                )}

                {(isEditing && isCoveredByWarranty(sp)) && (
                    <>
                        <br />
                        <>หมายเหตุของการไม่เคลม (ไม่บังคับ)</>
                        <br />
                        <Select
                            onChange={(e) => handleEditChange(sp.spcode, 'remark_noclaim', e.target.value)}
                            size='small' name="remark_noclaim"
                            defaultValue={sp.remark_noclaim || 'เคลมปกติ'}
                            id="no-claim" variant='outlined'
                        >
                            <MenuItem value={'เคลมปกติ'}>เคลมปกติ</MenuItem>
                            {/* <MenuItem value={'เคลมด่วน'}>เคลมด่วน</MenuItem> */}
                            <MenuItem value={'ลูกค้ามีการดัดแปลงสภาพเครื่องมา'}>ลูกค้ามีการดัดแปลงสภาพเครื่องมา</MenuItem>
                            <MenuItem value={'ลูกค้าใช้งานผิดวัตถุประสงค์'}>ลูกค้าใช้งานผิดวัตถุประสงค์</MenuItem>
                        </Select>
                    </>
                )}
            </TableCell>

            <TableCell>{sp.spunit}</TableCell>

            <TableCell>
                {isEditing && sp.spcode !== 'SV001' ? (
                    <TextField
                        type="number" size="small" value={editingSpares[sp.spcode]?.qty}
                        onChange={(e) => handleEditChange(sp.spcode, 'qty', e.target.value)}
                        inputProps={{ min: 1 }} sx={{ width: '80px' }}
                    />
                ) : (
                    qty
                )}
            </TableCell>

            <TableCell>{`${price_per_unit.toFixed(2)} บาท`}</TableCell>

            <TableCell>
                {isEditing ? (
                    <TextField
                        type="number" size="small" value={editingSpares[sp.spcode]?.price_multiple_gp}
                        onChange={(e) => handleEditChange(sp.spcode, 'price_multiple_gp', e.target.value)}
                        inputProps={{ min: 0, step: 1 }} sx={{ width: '100px' }}
                    />
                ) : (
                    <>{parseFloat(sp.price_multiple_gp || 0)}</>
                )}
            </TableCell>

            {/* คอลัมน์ใหม่: เคลมด่วน (Desktop) */}
            {/* <TableCell> */}
            {/* {canFastClaim ? (
                    <Checkbox
                        checked={!!editingSpares[sp.spcode]?.fast_claim}
                        onChange={(e) => handleFastClaimToggle(sp.spcode, e.target.checked)}
                    />
                ) : (
                    <span style={{ color: '#999' }}>—</span>
                )} */}
            {/* {isEditing ? (
                    canFastClaim ? (
                        <Checkbox
                            checked={!!editingSpares[sp.spcode]?.fast_claim}
                            onChange={(e) => handleFastClaimToggle(sp.spcode, e.target.checked)}
                        />
                    ) : (
                        <span style={{ color: '#999' }}>—</span>
                    )
                ) : (
                    sp.fast_claim ? (
                        <Typography variant="body2" color="green">✔ เคลมด่วน</Typography>
                    ) : (
                        <span style={{ color: '#999' }}>—</span>
                    )
                )} */}
            {/* </TableCell> */}
            <TableCell>
                {sp.fast_claim ? (
                    <Typography variant="body2" color="green">✔ เคลมด่วน</Typography>
                ) : (
                    <span style={{ color: '#999' }}>—</span>
                )}
            </TableCell>

            <TableCell>{totalPrice.toFixed(2)} บาท</TableCell>

            <TableCell>
                {isEditing ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton color="success" size="small" onClick={() => handleSaveEdit(sp.spcode)}>
                            <SaveIcon />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => handleCancelEdit(sp.spcode)}>
                            <CloseIcon />
                        </IconButton>
                        {!isCoveredByWarranty(sp) && (
                            <IconButton
                                color="warning"
                                size="small"
                                title="รีเซ็ทราคาเป็นค่าเดิม"
                                onClick={() => handleResetPrice(sp.spcode)}
                            >
                                <ReplayIcon />
                            </IconButton>
                        )}
                    </Box>
                ) : (
                    <IconButton color="primary" size="small" onClick={() => handleEditSpare(sp.spcode)}>
                        <EditIcon />
                    </IconButton>
                )}
            </TableCell>
        </TableRow>
    );
};
