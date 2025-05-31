import {
    Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, MenuItem,
    Paper,
    Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import {useState, useEffect} from "react";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import Select from "@mui/material/Select";
import axios from "axios";
import {AlertDialog} from "@/Components/AlertDialog.js";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";

const ShowDetail = ({gp}) => (
    <Stack direction={{md: 'column', lg: 'row'}} spacing={2} alignItems='center'>
        <Alert sx={{width: {lg: '100%', xs: '100%'}}} severity="success" icon={<BookmarkIcon/>}>
            สีเขียว {'=>'} อะไหล่อยู่ในประกัน
        </Alert>
        {/* <Alert sx={{width: {lg: '20%', xs: '100%'}}} severity="info" icon={<BookmarkAddIcon/>}>
            GP {gp} % ตั้งต้น
        </Alert> */}
    </Stack>
)

export default function SpSummary({open, setOpen, detail, selected, setSelected, setDetail, setShowAdd}) {
    const globalGP = detail.selected.globalGP;
    const [loading, setLoading] = useState(false);
    const [targetZero, setTargetZero] = useState();
    const [showAlertZero, setShowAlertZero] = useState(false);
    const [selectWorking, setSelectWorking] = useState(selected);
    const [totalPrice, setTotalPrice] = useState(0);
    const [showAlertRemark, setShowAlertRemark] = useState(false);
    const [selectedRemark, setSelectedRemark] = useState();

    const [currentImage, setCurrentImage] = useState('');
    const [openPreview, setOpenPreview] = useState(false);

    useEffect(() => {
        calculateTotal();
    }, [selectWorking]);

    const handleClose = (e, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
        }
        setOpen(false);
    };

    const calculateTotal = () => {
        let total = 0;
        selectWorking.forEach(item => {
            // ถ้าเป็นอะไหล่ที่อยู่ในประกัน ราคารวมเป็น 0
            console.log(item.price_multiple_gp, item.qty, item.spcode, item.warranty, detail.job.warranty);

            if (!detail.job.warranty) {
                const itemTotal = parseFloat(item.price_multiple_gp) * parseInt(item.qty || 1);
                total += itemTotal;
            } else {
                if (!item.warranty) {
                    const itemTotal = parseFloat(item.price_multiple_gp) * parseInt(item.qty || 1);
                    total += itemTotal;
                }
            }
        });
        setTotalPrice(total);
    };

    const handleChangePrice = (e, item) => {
        const value = e.target.value;
        const index = selectWorking.findIndex(i => i.spcode === item.spcode);

        if (index !== -1) {
            const updatedItems = [...selectWorking];
            updatedItems[index] = {
                ...updatedItems[index],
                price_multiple_gp: value
            };

            // ถ้าหาก item นี้ value เป็น 0 ให้ set approve = 'yes' และ approve_status = 'no' ด้วย
            if (parseFloat(value) === 0 && item.spcode !== 'SV001') {
                updatedItems[index].remark = true;
                updatedItems[index].approve = 'yes';
                updatedItems[index].approve_status = 'no';
                setShowAlertZero(true);
                setTargetZero(item);
            } else {
                // ถ้าหาก item นี้ value ไม่เป็น 0 ให้ set approve = 'no' และ approve_status = 'yes'
                updatedItems[index].remark = null;
                updatedItems[index].claim = false;
                updatedItems[index].approve = 'no';
                updatedItems[index].approve_status = 'yes';
            }

            setSelectWorking(updatedItems);
            // setSelected(updatedItems);
        }
    };

    const handleChangeQty = (e, item) => {
        const value = e.target.value;
        const index = selectWorking.findIndex(i => i.spcode === item.spcode);

        if (index !== -1) {
            const updatedItems = [...selectWorking];
            updatedItems[index] = {
                ...updatedItems[index],
                qty: value
            };

            setSelectWorking(updatedItems);
            // setSelected(updatedItems);
        }
    };

    const handelChangeNameSv = (e, item) => {
        const value = e.target.value;
        const index = selectWorking.findIndex(i => i.spcode === item.spcode);

        if (index !== -1) {
            const updatedItems = [...selectWorking];
            updatedItems[index] = {
                ...updatedItems[index],
                spname: value
            };
            setSelectWorking(updatedItems);
            // setSelected(updatedItems);
        }
    }

    const calculateItemTotal = (item) => {
        // ถ้าเป็นอะไหล่ที่อยู่ในประกัน ราคารวมเป็น 0
        if (item.warranty && detail.job.warranty) return 0;
        const pricePerUnit = parseFloat(item.price_multiple_gp) || 0;
        const quantity = parseInt(item.qty || 1);
        return (pricePerUnit * quantity).toFixed(2);
    };

    const DialogSpZero = () => {
        const [claim, setClaim] = useState(null);
        const [claimRemark, setClaimRemark] = useState('');
        const [remark, setRemark] = useState('');

        const handleSaveZero = () => {
            const index = selectWorking.findIndex(i => i.spcode === targetZero.spcode);

            if (index !== -1) {
                const updatedItems = [...selectWorking];
                updatedItems[index] = {
                    ...updatedItems[index],
                    claim: claim,
                    claim_remark: claimRemark,
                    remark: remark
                };

                setSelectWorking(updatedItems);
                // setSelected(updatedItems);
                setShowAlertZero(false);
            }
        };

        const handleOnClose = (e, reason) => {
            console.log(e, reason)
            console.log(selected,selectWorking)


            if (reason === "backdropClick" || reason === "escapeKeyDown") {
                return;
            }
            const index = selectWorking.findIndex(i => i.spcode === targetZero.spcode);
            if (index !== -1) {
                const updatedItems = [...selectWorking];
                updatedItems[index] = {
                    ...updatedItems[index],
                    price_multiple_gp : selected[0].price_multiple_gp
                };
                setSelectWorking(updatedItems);
                console.log(updatedItems)
            }

            setShowAlertZero(false)
        }

        const handelOnChangeSelect = (value) => {
            if (value === 'เคลมสินค้านี้ซีเรียลนี้หมดประกันตามเงื่อนไขไปแล้ว' || value === 'เคลมอะไหล่นอกประกันที่เกิดจากความเสียหายต่อเนื่อง') {
                setClaim(true);
            } else {
                setClaim(false);
            }
            setClaimRemark(value);
        }

        return (
            <Dialog
                fullWidth
                open={showAlertZero}
                onClose={(e, reason) => handleOnClose(e, reason)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    เนื่องจากคุณได้กรอกราคาอะไหล่เป็น 0 กรุณากรอกรายละเอียด
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 2}}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography sx={{minWidth : 40}}>ระบุ :</Typography>
                            <Select
                                fullWidth
                                value={claimRemark}
                                onChange={(e) => handelOnChangeSelect(e.target.value)}
                                variant='standard'
                            >
                                <MenuItem value="ไม่เคลม">ไม่เคลม</MenuItem>
                                <MenuItem
                                    value="เคลมสินค้านี้ซีเรียลนี้หมดประกันตามเงื่อนไขไปแล้ว">เคลมสินค้านี้ซีเรียลนี้หมดประกันตามเงื่อนไขไปแล้ว</MenuItem>
                                <MenuItem
                                    value="เคลมอะไหล่นอกประกันที่เกิดจากความเสียหายต่อเนื่อง">เคลมอะไหล่นอกประกันที่เกิดจากความเสียหายต่อเนื่อง</MenuItem>
                            </Select>
                        </Stack>

                        <TextField
                            id='claim-remark'
                            multiline
                            rows={4}
                            placeholder='กรุณากรอกหมายเหตุการเคลม'
                            fullWidth
                            required={claim}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            error={claim && !remark}
                            helperText={claim && !remark ? "กรุณากรอกหมายเหตุเมื่อเลือกเคลม" : ""}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                     <Button variant='contained' onClick={()=>handleOnClose()} color="error">ยกเลิก</Button>
                    <Button
                        onClick={handleSaveZero}
                        variant="contained"
                        disabled={claim === null || (claim === true && !remark)}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };


    const handleSubmit = async () => {
        try {
            setLoading(true);
            const {data} = await axios.post('/spare-part/store', {
                pid: detail.pid,
                pname: detail.pname,
                serial_id: detail.serial,
                list: {
                    sp: selectWorking,
                },
                job_id: detail.job.job_id
            });
            AlertDialog({
                icon: 'success',
                title: 'สำเร็จ',
                text: data.message,
                onPassed: () => {
                    setDetail(prev => ({
                        ...prev,
                        selected: {
                            ...prev.selected,
                            sp: selectWorking
                        }
                    }));
                }
            });
            setShowAdd(false)
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.message || error.message,
                onPassed: () => {
                }
            });
        } finally {
            setOpen(false);
            setLoading(false);
        }
    }

    const DialogOnChangeRemark = () => {
        const [r, setR] = useState(selectedRemark.remark)
        const handelOnSave = () => {
            const index = selectWorking.findIndex(i => i.spcode === selectedRemark.spcode);
            if (index !== -1) {
                const updatedItems = [...selectWorking];
                updatedItems[index] = {
                    ...updatedItems[index],
                    remark: r
                };

                setSelectWorking(updatedItems);

            }

            setShowAlertRemark(false);
        }
        console.log(selectedRemark)
        return (
            <Dialog
                fullWidth='false'
                maxWidth='lg'
                open={showAlertRemark}
                onClose={() => setShowAlertRemark(false)}
            >
                <DialogTitle id="alert-dialog-title">
                    แก้ไขหมายเหตุ อะไหล่ {selectedRemark.spname} {selectedRemark.spcode}
                </DialogTitle>
                <DialogContent>
                    <Stack direction='column' spacing={2}>
                        <textarea defaultValue={r} onChange={(e) => setR(e.target.value)}/>
                        <Stack direction='row-reverse'>
                            <Button onClick={handelOnSave}>บันทึก</Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <>
            {openPreview && <SpPreviewImage open={openPreview} setOpen={setOpenPreview} imagePath={currentImage}/>}
            {showAlertZero && <DialogSpZero/>}
            {showAlertRemark && <DialogOnChangeRemark/>}
            <Dialog
                fullWidth
                maxWidth='xl'
                open={open}
                onClose={(e, reason) => handleClose(e, reason)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    สรุปรายการอะไหล่
                </DialogTitle>
                <DialogContent>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <ShowDetail gp={globalGP}/>
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{overflow: 'auto'}}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={TABLE_HEADER_STYLE} width={10}>รูปภาพ</TableCell>
                                            <TableCell sx={TABLE_HEADER_STYLE}>รหัสอะไหล่</TableCell>
                                            <TableCell sx={TABLE_HEADER_STYLE}>ชื่ออะไหล่</TableCell>
                                            <TableCell sx={TABLE_HEADER_STYLE}>ราคาต่อหน่วย</TableCell>
                                            <TableCell sx={TABLE_HEADER_STYLE}>ราคาที่ {'+'} GP แล้ว</TableCell>
                                            <TableCell sx={TABLE_HEADER_STYLE} width={200}>จำนวน</TableCell>
                                            <TableCell sx={TABLE_HEADER_STYLE}>หน่วย</TableCell>
                                            <TableCell sx={TABLE_HEADER_STYLE}>ราคารวม</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectWorking.map((item, index) => {
                                            const spPath2 = import.meta.env.VITE_IMAGE_SP+item.spcode+'.jpg';
                                            const isWarranty = item.warranty && detail.job.warranty === true;
                                            const rowStyle = item.warranty ? {backgroundColor: '#e8f5e9'} : {};
                                            return (
                                                <TableRow key={index} sx={{...rowStyle}}>
                                                    <TableCell width={10} onClick={() => {
                                                        setCurrentImage(spPath2);
                                                        setOpenPreview(true);
                                                    }}>
                                                        <img src={spPath2} width={50} alt={(e) => {
                                                            e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg'
                                                        }}/>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.spcode}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.spcode === 'SV001' ? (
                                                            <TextField onChange={(e) => handelChangeNameSv(e, item)}
                                                                       variant="standard" defaultValue={item.spname}/>
                                                        ) : <>{item.spname}</>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {(parseFloat(item.price_per_unit) + (globalGP / 100) * item.price_per_unit).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction='column' spacing={2}>
                                                            <TextField
                                                                required
                                                                disabled={isWarranty}
                                                                size='small'
                                                                type='number'
                                                                onChange={(e) => handleChangePrice(e, item)}
                                                                defaultValue={parseFloat(item.price_multiple_gp).toFixed(2)}
                                                            />
                                                            {item.remark && (
                                                                <>
                                                                    <Divider/>
                                                                    <Stack direction='column'>
                                                                        {item.remark && (
                                                                            <Typography variant="body2">
                                                                                <BorderColorIcon
                                                                                    onClick={() => {
                                                                                        setSelectedRemark(item);
                                                                                        setShowAlertRemark(true)
                                                                                    }}
                                                                                    fontSize="10px"
                                                                                    sx={{cursor: 'pointer'}}
                                                                                />
                                                                                &nbsp;
                                                                                {<span>หมายเหตุ : {item.remark}</span>}
                                                                            </Typography>
                                                                        )}

                                                                    </Stack>
                                                                </>
                                                            )}
                                                            {item.claim_remark && (
                                                                <Typography variant="body2">
                                                                    <span>เลือก : {item.claim_remark}</span>
                                                                </Typography>
                                                            )}


                                                        </Stack>

                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            required
                                                            inputProps={{min: 1}}
                                                            disabled={item.spcode === 'SV001'}
                                                            size="small"
                                                            sx={{minWidth: 100}}
                                                            type="number"
                                                            defaultValue={item.qty}
                                                            onInput={(e) => e.target.value === "0" && (e.target.value = "")}
                                                            onBlur={(e) => {
                                                                if (!e.target.value) e.target.value = 1;
                                                            }}
                                                            onChange={(e) => handleChangeQty(e, item)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.spunit ? item.spunit : item.sp_unit}</TableCell>
                                                    <TableCell>{calculateItemTotal(item)}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid2>
                        <Grid2 size={12}>
                            <Stack direction='row-reverse' spacing={2}>
                                <Typography fontWeight='bold' fontSize={20}>
                                    รวมทั้งหมด : {totalPrice.toFixed(2)}
                                </Typography>
                            </Stack>
                        </Grid2>
                    </Grid2>
                </DialogContent>
                <DialogActions>
                    {/*<Button variant='contained' color='warning' onClick={() => console.log(selectWorking)}>log show</Button>*/}
                    <Button variant='contained' color='error' onClick={handleClose}>ยกเลิก</Button>
                    <Button variant='contained' disabled={detail.job.status === 'success' || loading}
                            onClick={handleSubmit} autoFocus>
                        {loading && (
                            <>
                                <CircularProgress/>
                                &nbsp;
                            </>
                        )}
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


const SPARE_PART_IMAGE_PATH = import.meta.env.VITE_IMAGE_PATH;
const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
