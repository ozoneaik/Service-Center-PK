import {
    Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Grid2,
    IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography
} from "@mui/material";
import React,{ useState } from "react";
import { showDefaultImage } from "@/utils/showImage.js";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Check, CheckBox} from "@mui/icons-material";

export default function RpSpSummary({ spSelected, setShowSummary, onUpdateSpSelected }) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [editingSpares, setEditingSpares] = useState({});
    const [claimDialog, setClaimDialog] = useState(false);
    const [selectedSpareForClaim, setSelectedSpareForClaim] = useState(null);
    const [claimData, setClaimData] = useState({
        claimType: '',
        claimNote: ''
    });

    // คำนวณยอดรวม
    const calculateTotal = () => {
        return spSelected.reduce((total, sp) => {
            const price = parseFloat(sp.price_per_unit || 0);
            const qty = parseInt(sp.qty || 1);
            return total + (price * qty);
        }, 0);
    };

    // จัดการการแก้ไขข้อมูลอะไหล่
    const handleEditSpare = (spcode) => {
        const spare = spSelected.find(sp => sp.spcode === spcode);
        setEditingSpares(prev => ({
            ...prev,
            [spcode]: {
                price_per_unit: spare.price_per_unit || '',
                qty: spare.qty || 1
            }
        }));
    };

    // บันทึกการแก้ไข
    const handleSaveEdit = (spcode) => {
        const editData = editingSpares[spcode];
        if (!editData) return;

        const updatedSpares = spSelected.map(sp => {
            if (sp.spcode === spcode) {
                const newPrice = editData.price_per_unit;

                // ถ้าราคาเป็น 0 ให้เปิด dialog สำหรับเคลม
                if (parseFloat(newPrice) === 0) {
                    setSelectedSpareForClaim(sp);
                    setClaimDialog(true);
                    return sp; // ยังไม่อัพเดทก่อน รอให้กรอกข้อมูลเคลม
                }

                return {
                    ...sp,
                    price_per_unit: newPrice,
                    qty: parseInt(editData.qty) || 1
                };
            }
            return sp;
        });

        // ถ้าราคาไม่เป็น 0 ให้อัพเดทได้เลย
        if (parseFloat(editData.price_per_unit) !== 0) {
            onUpdateSpSelected(updatedSpares);
            setEditingSpares(prev => {
                const newState = { ...prev };
                delete newState[spcode];
                return newState;
            });
        }
    };

    // จัดการการเปลี่ยนแปลงข้อมูลในการแก้ไข
    const handleEditChange = (spcode, field, value) => {
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

        const editData = editingSpares[selectedSpareForClaim.spcode];

        const updatedSpares = spSelected.map(sp => {
            if (sp.spcode === selectedSpareForClaim.spcode) {
                return {
                    ...sp,
                    price_per_unit: editData.price_per_unit,
                    qty: parseInt(editData.qty) || 1,
                    claim_type: claimData.claimType,
                    claim_note: claimData.claimNote
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
        setClaimData({ claimType: '', claimNote: '' });
    };

    // ปิด dialog เคลม
    const handleCloseClaimDialog = () => {
        setClaimDialog(false);
        setSelectedSpareForClaim(null);
        setClaimData({ claimType: '', claimNote: '' });
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
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setShowSummary(false)}
                    sx={{ mb: 2 }}
                >
                    กลับไปแก้ไขรายการ
                </Button>
            </Grid2>

            {/* ตารางสรุปรายการ */}
            <Grid2 size={12}>
                <Card sx={{overflow : 'auto'}}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            สรุปรายการอะไหล่และบริการ
                        </Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่ออะไหล่</TableCell>
                                    <TableCell>หน่วย</TableCell>
                                    <TableCell>จำนวน</TableCell>
                                    <TableCell>ราคาต่อหน่วย</TableCell>
                                    <TableCell>ราคารวม</TableCell>
                                    <TableCell>จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {spSelected.map((sp, index) => {
                                    const imageSp = sp.spcode === 'SV001' ? '' :
                                        import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                                    const isEditing = editingSpares[sp.spcode];
                                    const price = parseFloat(sp.price_per_unit || 0);
                                    const qty = parseInt(sp.qty || 1);
                                    const totalPrice = price * qty;

                                    return (
                                        <React.Fragment key={index}>

                                            <TableRow
                                                sx={{backgroundColor: sp.warranty === 'Y' ? '#e8f5e8' : 'inherit'}}
                                            >
                                                <TableCell
                                                    onClick={() => {
                                                        setPreviewImage(true);
                                                        setPreviewSelected(imageSp);
                                                    }}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                                                </TableCell>
                                                <TableCell>
                                                    {sp.spcode}
                                                    {isEditing && (
                                                        <>
                                                            <br/>
                                                            <Select size='small' name="no-claim" defaultValue={1}
                                                                    id="no-claim">
                                                                <MenuItem value={1}>
                                                                    ลูกค้ามีการดัดแปลงสภาพเครื่องมา
                                                                </MenuItem>
                                                                <MenuItem value={2}>
                                                                    ลูกค้าใช้งานผิดวัตถุประสงค์
                                                                </MenuItem>
                                                            </Select>
                                                        </>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {sp.spname}
                                                    {(sp.claim_type && sp.price_per_unit == 0) && (
                                                        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                                                            เคลม: {sp.claim_type}
                                                            {sp.claim_note && (
                                                                <div>หมายเหตุ: {sp.claim_note}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{sp.spunit}</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={isEditing.qty}
                                                            onChange={(e) => handleEditChange(sp.spcode, 'qty', e.target.value)}
                                                            inputProps={{ min: 1 }}
                                                            sx={{ width: '80px' }}
                                                        />
                                                    ) : (
                                                        qty
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={isEditing.price_per_unit}
                                                            onChange={(e) => handleEditChange(sp.spcode, 'price_per_unit', e.target.value)}
                                                            inputProps={{ min: 0, step: 0.01 }}
                                                            sx={{ width: '100px' }}
                                                        />
                                                    ) : (
                                                        `${price.toFixed(2)} บาท`
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {totalPrice.toFixed(2)} บาท
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <IconButton
                                                            color="success"
                                                            onClick={() => handleSaveEdit(sp.spcode)}
                                                            size="small"
                                                        >
                                                            <SaveIcon />
                                                        </IconButton>
                                                    ) : (
                                                        <IconButton
                                                            disabled={sp.spcode === 'SV001'}
                                                            color="primary"
                                                            onClick={() => handleEditSpare(sp.spcode)}
                                                            size="small"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>

                                    );
                                })}
                                {/* แถวยอดรวม */}
                                <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                    <TableCell colSpan={6} align="right">
                                        <Typography>ยอดรวมทั้งหมด: </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography color="primary" >
                                            {calculateTotal().toFixed(2)} บาท
                                        </Typography>
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Grid2>

            <Grid2 size={12}>
                <Stack direction='row' justifyContent='end'>
                    <Button variant='contained' onClick={()=>console.log(spSelected)} startIcon={<SaveIcon/>}>
                        บันทึก
                    </Button>
                </Stack>
            </Grid2>

            {/* Dialog สำหรับกรอกข้อมูลเคลม */}
            <Dialog open={claimDialog} onClose={handleCloseClaimDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    ระบุข้อมูลการเคลม
                    <Typography variant="body2" color="text.secondary">
                        เนื่องจากคุณได้กรอกราคาอะไหล่เป็น 0 กรุณากรอกรายละเอียด
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid2 container spacing={2} sx={{ mt: 1 }}>
                        <Grid2 size={12}>
                            <FormControl fullWidth required>
                                <InputLabel>ประเภทการเคลม</InputLabel>
                                <Select
                                    value={claimData.claimType}
                                    label="ประเภทการเคลม"
                                    onChange={(e) => setClaimData(prev => ({ ...prev, claimType: e.target.value }))}
                                >
                                    <MenuItem value="ไม่เคลม">ไม่เคลม</MenuItem>
                                    <MenuItem value="เคลมสินค้านี้ซีเรียงหมดประกันตามเงื่อนไขแล้ว">
                                        เคลมสินค้านี้ซีเรียงหมดประกันตามเงื่อนไขแล้ว
                                    </MenuItem>
                                    <MenuItem value="เคลมอะไหล่นอกประกันที่เกิดความเสียหายต่อเนื่อง">
                                        เคลมอะไหล่นอกประกันที่เกิดความเสียหายต่อเนื่อง
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="หมายเหตุการเคลม"
                                value={claimData.claimNote}
                                onChange={(e) => setClaimData(prev => ({ ...prev, claimNote: e.target.value }))}
                                required={claimData.claimType !== 'ไม่เคลม'}
                                helperText={claimData.claimType === 'ไม่เคลม' ? 'ไม่บังคับกรอก' : 'บังคับกรอก'}
                            />
                        </Grid2>
                    </Grid2>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseClaimDialog}>ยกเลิก</Button>
                    <Button
                        onClick={handleSaveClaimData}
                        variant="contained"
                        disabled={!claimData.claimType || (claimData.claimType !== 'ไม่เคลม' && !claimData.claimNote.trim())}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid2>
    );
}
