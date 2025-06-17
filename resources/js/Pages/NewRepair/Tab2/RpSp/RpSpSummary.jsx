import {
    Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Grid2,
    IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography
} from "@mui/material";
import React, {useState} from "react";
import {showDefaultImage} from "@/utils/showImage.js";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Check, CheckBox} from "@mui/icons-material";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

export default function RpSpSummary({spSelected, setShowSummary, onUpdateSpSelected, JOB, onSaved}) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [editingSpares, setEditingSpares] = useState({});
    const [claimDialog, setClaimDialog] = useState(false);
    const [selectedSpareForClaim, setSelectedSpareForClaim] = useState(null);
    const [claimData, setClaimData] = useState({
        claim: '', claim_remark: '', remark: ''
    });

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
        console.log('newPrice', editData);

        // ถ้าราคาเป็น 0 ให้เปิด dialog สำหรับเคลม
        if (newPrice === 0 && spcode !== 'SV001') {
            const spare = spSelected.find(sp => sp.spcode === spcode);
            console.log(spare)
            if (!(spare.warranty === 'Y' && JOB.warranty)) {
                setSelectedSpareForClaim(spare);
                setClaimDialog(true);
                return; // ออกจากฟังก์ชัน รอให้กรอกข้อมูลเคลม
            }
        }
        if (JOB.warranty && editData.warranty === 'Y' && newPrice === 0) {
            alert('สินค้า อยู่ในประกัน และ สถานะ อะไห่ เป็น true และ ราคา เป็น 0');
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
                };
            }
            return sp;
        });


        onUpdateSpSelected(updatedSpares);

        // ลบข้อมูลการแก้ไขออกจาก state
        setEditingSpares(prev => {
            const newState = {...prev};
            delete newState[spcode];
            return newState;
        });
    };

    // จัดการการเปลี่ยนแปลงข้อมูลในการแก้ไข
    const handleEditChange = (spcode, field, value) => {
        console.log(spcode, field, value);

        // ถ้ามีการเปลี่ยนแปลง หมายเหตุของการไม่เคลม
        if (field === 'remark_noclaim') {
            if (value !== 'เคลมปกติ') {
                const sp_sel = spSelected.find(sp => sp.spcode === spcode)
                console.log(sp_sel)
                setEditingSpares(prev => ({
                    ...prev,
                    [spcode]: {
                        ...prev[spcode],
                        price_multiple_gp: sp_sel.price_per_unit,
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
                        [field]: value
                    }
                }));
                return;
            }
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
            const newState = {...prev};
            delete newState[selectedSpareForClaim.spcode];
            return newState;
        });
        setClaimDialog(false);
        setSelectedSpareForClaim(null);
        setClaimData({claim: '', claim_remark: '', remark: ''});
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
        setClaimData({claim: '', claim_remark: '', remark: ''});
    };

    const handleSubmit = () => {
        console.log(spSelected)
        AlertDialogQuestion({
            title: 'ยืนยันการบันทึก',
            text: 'กด ตกลง เพื่อบันทึกรายการอะไหล่',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        const {data, status} = await axios.post(route('repair.after.spare-part.store', {
                            job_id: JOB.job_id,
                            serial_id: JOB.serial_id,
                            spare_parts: spSelected
                        }))
                        console.log(data, status)
                        AlertDialog({
                            icon: 'success',
                            text: data.message,
                            onPassed: () => onSaved()
                        })
                    } catch (error) {
                        AlertDialog({
                            text: error.response?.data?.message || error.message,
                        })
                    }
                } else console.log('ไม่ได้กด confirm')
            }
        })
    }

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
                    startIcon={<ArrowBackIcon/>}
                    onClick={() => setShowSummary(false)}
                    sx={{mb: 2}}
                >
                    กลับไปแก้ไขรายการ
                </Button>
            </Grid2>

            {/* ตารางสรุปรายการ */}
            <Grid2 size={12}>
                <Card sx={{overflow: 'auto'}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2}}>
                            สรุปรายการอะไหล่และบริการ
                        </Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>รหัสและชื่ออะไหล่</TableCell>
                                    {/*<TableCell>ชื่ออะไหล่</TableCell>*/}
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
                                    const imageSp = sp.spcode === 'SV001' ? '' :
                                        import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                                    const isEditing = editingSpares[sp.spcode];
                                    const price_per_unit = parseFloat(sp.price_per_unit || 0);
                                    const price_multiple_gp = parseFloat(sp.price_multiple_gp || 0);
                                    const qty = parseInt(sp.qty || 1);
                                    const totalPrice = price_multiple_gp * qty;

                                    return (
                                        <React.Fragment key={index}>

                                            <TableRow
                                                sx={{backgroundColor: JOB.warranty && sp.warranty === 'Y' ? '#e8f5e8' : 'inherit'}}
                                            >
                                                <TableCell
                                                    onClick={() => {
                                                        setPreviewImage(true);
                                                        setPreviewSelected(imageSp);
                                                    }}
                                                    sx={{cursor: 'pointer'}}
                                                >
                                                    <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                                                </TableCell>
                                                <TableCell>
                                                    {(isEditing && sp.spcode === 'SV001') ? (
                                                        <>
                                                            <TextField
                                                                type="text"
                                                                multiline
                                                                minRows={2}
                                                                size="small"
                                                                value={isEditing.spname}
                                                                onChange={(e) => handleEditChange(sp.spcode, 'spname', e.target.value)}
                                                                sx={{width: '250px'}}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>({sp.spcode})&nbsp;{sp.spname} {sp.warranty}</>
                                                    )}
                                                    {/*({sp.spcode})&nbsp;{sp.spname}*/}
                                                    {JOB.warranty && sp.remark_noclaim && (
                                                        <div style={{
                                                            fontSize: '0.8em',
                                                            color: '#666',
                                                            marginTop: '4px'
                                                        }}>
                                                            หมายเหตุของการไม่เคลม: {sp.remark_noclaim}
                                                        </div>
                                                    )}


                                                    {(sp.claim_remark && parseFloat(sp.price_multiple_gp) === 0) && (
                                                        <div style={{
                                                            fontSize: '0.8em',
                                                            color: '#666',
                                                            marginTop: '4px'
                                                        }}>
                                                            เคลม: {sp.claim_remark}
                                                            {sp.remark && (
                                                                <div>หมายเหตุ: {sp.remark}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(isEditing && JOB.warranty && sp.warranty === 'Y') && (
                                                        <>
                                                            <br/>
                                                            <>หมายเหตุของการไม่เคลม (ไม่บังคับ)</>
                                                            <br/>
                                                            <Select
                                                                onChange={(e) => handleEditChange(sp.spcode, 'remark_noclaim', e.target.value)}
                                                                size='small' name="remark_noclaim"
                                                                defaultValue={sp.remark_noclaim || 'เคลมปกติ'}
                                                                id="no-claim">
                                                                <MenuItem value={'เคลมปกติ'}>
                                                                    เคลมปกติ
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
                                                            type="number"
                                                            size="small"
                                                            value={isEditing.qty}
                                                            onChange={(e) => handleEditChange(sp.spcode, 'qty', e.target.value)}
                                                            inputProps={{min: 1}}
                                                            sx={{width: '80px'}}
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
                                                            type="number"
                                                            size="small"
                                                            value={isEditing.price_multiple_gp}
                                                            onChange={(e) => handleEditChange(sp.spcode, 'price_multiple_gp', e.target.value)}
                                                            inputProps={{min: 0, step: 1}}
                                                            sx={{width: '100px'}}
                                                        />
                                                    ) : (
                                                        <>
                                                            {parseFloat(sp.price_multiple_gp || 0)}
                                                        </>
                                                        // `${price_multiple_gp.toFixed(2)} บาท`
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
                                                            <SaveIcon/>
                                                        </IconButton>
                                                    ) : (
                                                        <IconButton
                                                            // disabled={sp.spcode === 'SV001'}
                                                            color="primary"
                                                            onClick={() => handleEditSpare(sp.spcode)}
                                                            size="small"
                                                        >
                                                            <EditIcon/>
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>

                                    );
                                })}
                                {/* แถวยอดรวม */}
                                <TableRow sx={{backgroundColor: '#f5f5f5', fontWeight: 'bold'}}>
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
                    </CardContent>
                </Card>
            </Grid2>

            <Grid2 size={12}>
                <Stack direction='row' justifyContent='end'>
                    <Button
                        disabled={Object.keys(editingSpares).length !== 0}
                        variant='contained' startIcon={<SaveIcon/>}
                        onClick={handleSubmit}
                    >
                        บันทึก
                    </Button>
                </Stack>
            </Grid2>

            {/* Dialog สำหรับกรอกข้อมูลเคลม */}
            <Dialog open={claimDialog} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    ระบุข้อมูลการเคลม
                    <Typography variant="body2" color="text.secondary">
                        เนื่องจากคุณได้กรอกราคาอะไหล่เป็น 0 กรุณากรอกรายละเอียด
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid2 container spacing={2} sx={{mt: 1}}>
                        <Grid2 size={12}>
                            <FormControl fullWidth required>
                                <InputLabel>ประเภทการเคลม</InputLabel>
                                <Select
                                    value={claimData.claim_remark}
                                    label="ประเภทการเคลม"
                                    onChange={(e) => setClaimData(prev => ({...prev, claim_remark: e.target.value}))}
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
                                value={claimData.remark}
                                onChange={(e) => setClaimData(prev => ({...prev, remark: e.target.value}))}
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
                        disabled={(claimData.claim_remark !== 'ไม่เคลม' && !claimData.remark.trim())}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid2>
    );
}
