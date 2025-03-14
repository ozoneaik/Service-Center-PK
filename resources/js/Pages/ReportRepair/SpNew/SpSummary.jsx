import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Grid2, MenuItem,
    Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import {useState, useEffect} from "react";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import Select from "@mui/material/Select";
import axios from "axios";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {usePage} from "@inertiajs/react";

const ShowDetail = ({gp}) => (
    <Stack direction={{md: 'column', lg: 'row'}} spacing={2} alignItems='center'>
        <Alert sx={{width: {lg: '80%', xs: '100%'}}} severity="success" icon={<BookmarkIcon/>}>
            สีเขียว {'=>'} อะไหล่อยู่ในประกัน
        </Alert>
        <Alert sx={{width: {lg: '20%', xs: '100%'}}} severity="info" icon={<BookmarkAddIcon/>}>
            GP {gp} % ตั้งต้น
        </Alert>
    </Stack>
)

export default function SpSummary({open, setOpen, detail, selected, setSelected,setDetail,setShowAdd}) {
    const globalGP = detail.selected.globalGP;
    const [targetZero, setTargetZero] = useState();
    const [showAlertZero, setShowAlertZero] = useState(false);
    const [selectWorking, setSelectWorking] = useState(selected);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        calculateTotal();
    }, [selectWorking]);

    const handleClose = (e,reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return ;
        }
        setOpen(false);
    };

    const calculateTotal = () => {
        let total = 0;
        selectWorking.forEach(item => {
            // ถ้าเป็นอะไหล่ที่อยู่ในประกัน ราคารวมเป็น 0
            if (!item.warranty) {
                const itemTotal = parseFloat(item.price_multiple_gp) * parseInt(item.qty || 1);
                total += itemTotal;
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

    const handelChangeNameSv = (e,item) => {
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
        if (item.warranty) {
            return 0;
        }

        const pricePerUnit = parseFloat(item.price_multiple_gp) || 0;
        const quantity = parseInt(item.qty || 1);
        return (pricePerUnit * quantity).toFixed(2);
    };

    const DialogSpZero = () => {
        const [claim, setClaim] = useState(false);
        const [remark, setRemark] = useState('');
        const user = usePage().props.auth.user;
        console.log(user)

        const handleSaveZero = () => {
            const index = selectWorking.findIndex(i => i.spcode === targetZero.spcode);

            if (index !== -1) {
                const updatedItems = [...selectWorking];
                updatedItems[index] = {
                    ...updatedItems[index],
                    claim: claim,
                    remark: remark
                };

                setSelectWorking(updatedItems);
                // setSelected(updatedItems);
                setShowAlertZero(false);
            }
        };

        const handleOnClose = (e,reason) => {
            console.log(e,reason)
            if (reason === "backdropClick" || reason === "escapeKeyDown") {
                return ;
            }
            setShowAlertZero(false)
        }

        return (
            <Dialog
                fullWidth
                open={showAlertZero}
                onClose={(e,reason)=>handleOnClose(e,reason)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    ด้วยคุณได้กรอกราคาอะไหล่ เป็น 0 กรุณากรอกรายละเอียดดังนี้
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography>เคลม:</Typography>
                            <Select
                                fullWidth
                                // native
                                value={claim ? "true" : "false"}
                                onChange={(e) => setClaim(e.target.value === "true")}
                             variant='standard'
                            >
                                <MenuItem value="false">ไม่เคลม</MenuItem>
                                <MenuItem value="true">เคลม</MenuItem>
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
                    <Button onClick={() => setShowAlertZero(false)} color="error">ยกเลิก</Button>
                    <Button
                        onClick={handleSaveZero}
                        variant="contained"
                        disabled={claim && !remark}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };


    const handleSubmit = async () => {
        console.log(selectWorking)
        try {
            const {data} = await axios.post('/spare-part/store', {
                serial_id : detail.serial,
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
        }finally {
            setOpen(false)
        }
    }

    return (
        <>
            {showAlertZero && <DialogSpZero/>}
            <Dialog
                fullWidth
                maxWidth='xl'
                open={open}
                onClose={(e,reason) => handleClose(e,reason)}
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
                                        const image_sp_path = SPARE_PART_IMAGE_PATH + detail.pid + '/' + item.spcode + '.jpg';
                                        const isWarranty = item.warranty === true;
                                        const rowStyle = isWarranty ? {backgroundColor: '#e8f5e9'} : {};
                                        return (
                                            <TableRow key={index} sx={rowStyle}>
                                                <TableCell width={10}>
                                                    <ImagePreview src={image_sp_path}/>
                                                </TableCell>
                                                <TableCell>
                                                    {item.spcode}
                                                </TableCell>
                                                <TableCell>
                                                    {item.spcode === 'SV001' ? (
                                                        <TextField onChange={(e) =>handelChangeNameSv(e,item)} variant="standard" defaultValue={item.spname}/>
                                                    ) : <>{item.spname}</>}
                                                </TableCell>
                                                <TableCell>
                                                    {(parseFloat(item.price_per_unit) + (globalGP / 100) * item.price_per_unit).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        required
                                                        disabled={isWarranty}
                                                        size='small'
                                                        type='number'
                                                        onChange={(e) => handleChangePrice(e, item)}
                                                        defaultValue={parseFloat(item.price_multiple_gp).toFixed(2)}
                                                    />
                                                    <br/>
                                                    {item.remark && <span>หมายเหตุ : {item.remark}</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        required
                                                        inputProps={{min: 1}}
                                                        disabled={item.spcode === 'SV001'}
                                                        size="small"
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
                    <Button variant='contained' disabled={detail.job.status === 'success'} onClick={handleSubmit} autoFocus>
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
