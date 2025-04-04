import {
    Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid2, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import {useState, useMemo, useEffect} from "react";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import axios from 'axios';
import {AlertDialog} from "@/Components/AlertDialog.js";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';

export default function TotalPrice(props) {
    const {open, setOpen} = props;
    const [alertZero, setAlertZero] = useState(false);
    const [targetSpZero, setTargetSpZero] = useState();
    const {selected, setSelected} = props;
    const {serial_id, detail, setDetail, setBtnSelected} = props;
    const [gpDefault] = useState(detail.selected.globalGP || 0);
    const [localItems, setLocalItems] = useState([]);

    // Initialize local items with calculated price_multiple_gp and qty
    useEffect(() => {
        if (selected.sp && selected.sp.length > 0) {
            const items = selected.sp.map(item => {
                const price_multiple_gp = item.price_multiple_gp ||
                    (parseFloat(item.price_per_unit) + (parseFloat(item.price_per_unit) * gpDefault / 100)).toFixed(2);
                return {
                    ...item,
                    price_multiple_gp,
                    qty: item.qty ?? 1
                };
            });
            setLocalItems(items);
        }
    }, [selected.sp, gpDefault]);

    // Calculate total price using useMemo
    const totalPrice = useMemo(() => {
        return localItems.reduce((sum, item) => {
            if (item.warranty) {
                return sum; // Price is 0 for warranty items
            }
            return sum + (parseFloat(item.price_multiple_gp) * parseFloat(item.qty));
        }, 0).toFixed(2);
    }, [localItems]);

    // Handle quantity change
    const handleQtyChange = (index, value) => {
        const newItems = [...localItems];
        newItems[index].qty = value < 1 ? 1 : value;
        setLocalItems(newItems);
    };

    // Handle price with ManageBranchPage change
    const handlePriceChange = (index, value) => {
        const newItems = [...localItems];
        newItems[index].price_multiple_gp = value;
        if (detail.job.warranty) {
            newItems[index].approve = parseFloat(value) === 0 ? 'yes' : 'no';
            newItems[index].approve_status = parseFloat(value) === 0 ? 'no' : 'yes';
        }
        if (parseFloat(value) === 0) {
            newItems[index].remark = 'ไม่มีความเห็น';
            newItems[index].claim = true;
            setAlertZero(true)
            setTargetSpZero(newItems[index])
        } else {
            newItems[index].remark = null;
            newItems[index].claim = false;
        }
        setLocalItems(newItems);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        // console.log(localItems);
        setOpen(false);
        // Prepare items with required fields for submission
        const itemsForSubmission = localItems.map(item => ({
            spcode: item.spcode,
            spname: item.spname,
            price_per_unit: item.price_per_unit,
            spunit: item.spunit,
            warranty: item.warranty ?? false,
            qty: item.qty,
            remark: item.remark ? item.remark : null,
            claim: item.claim ?? false,
            price_multiple_gp: item.price_multiple_gp,
            approve: item.approve,
            approve_status: item.approve_status,
            gp: gpDefault
        }));
        try {
            const {data} = await axios.post('/spare-part/store', {
                serial_id,
                list: {
                    sp: itemsForSubmission,
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
                            sp: itemsForSubmission
                        }
                    }));
                    setBtnSelected(1);
                }
            });
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.message || error.message,
                onPassed: () => {
                }
            });
        }
    };

    const handelUpdateSp = (target) => {
        setSelected((prevSelected) => ({
            ...prevSelected,
            sp: prevSelected.sp.map((item) =>
                item.spcode === target.spcode ? {...target} : item
            ),
        }));
    }

    const handelChangeName = (e,itemSel) => {
        setSelected((prevSelected) => ({
            ...prevSelected,
            sp: prevSelected.sp.map((item) =>
                item.spcode === itemSel.spcode ? {...item,spname : e.target.value} : item
            ),
        }));
    }


    return (
        <>
            {
                alertZero &&
                <AlertNo
                    alertZero={alertZero} setAlertZero={setAlertZero}
                    targetSpZero={targetSpZero} setTargetSpZero={setTargetSpZero}
                    onPassed={(target) => handelUpdateSp(target)}
                />
            }
            <Dialog fullWidth maxWidth='lg' open={open} onClose={() => setOpen(false)}>
                <DialogTitle fontWeight='bold'>สรุปรายการอะไหล่</DialogTitle>
                <DialogContent>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction={{md: 'column', lg: 'row'}} spacing={2} alignItems='center'>
                                <Alert sx={{width: {lg: '80%', xs: '100%'}}} severity="success" icon={<BookmarkIcon/>}>
                                    สีเขียว {'=>'} อะไหล่อยู่ในประกัน
                                </Alert>
                                <Alert sx={{width: {lg: '20%', xs: '100%'}}} severity="info" icon={<BookmarkAddIcon/>}>
                                    GP {gpDefault} % ตั้งต้น
                                </Alert>
                            </Stack>
                        </Grid2>

                        <Grid2 size={12} maxHeight={500} sx={{overflowY: 'scroll'}}>
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
                                    {localItems.map((item, index) => {
                                        const image_sp_path = SPARE_PART_IMAGE_PATH + detail.pid + '/' + item.spcode + '.jpg';
                                        const isWarranty = item.warranty === true;
                                        const rowStyle = isWarranty ? {backgroundColor: '#e8f5e9'} : {};
                                        const itemTotal = isWarranty ? 0 : (parseFloat(item.price_multiple_gp) * parseFloat(item.qty)).toFixed(2);

                                        return (
                                            <TableRow key={index} style={rowStyle}>
                                                <TableCell>
                                                    <ImagePreview src={image_sp_path}/>
                                                </TableCell>
                                                <TableCell>{item.spcode}</TableCell>
                                                <TableCell>
                                                    {item.spcode === 'SV001' ? (
                                                        <TextField
                                                            variant="standard"
                                                            size='small'
                                                            label='เปลี่ยนชื่ออะไหล่ได้ที่นี่'
                                                            value={item.spname}
                                                            onChange={(e) => handelChangeName(e,item)}
                                                        />
                                                    ) : item.spname}
                                                </TableCell>
                                                <TableCell>
                                                    {parseFloat(item.price_per_unit + (item.price_per_unit * (gpDefault / 100))).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={parseFloat(item.price_multiple_gp).toFixed(2)}
                                                        size="small"
                                                        type='number'
                                                        onChange={(e) => handlePriceChange(index, e.target.value)}
                                                        disabled={isWarranty}
                                                        inputProps={{min: 0}}
                                                    />
                                                    <br/>
                                                    {item.remark &&
                                                        <>
                                                            <Typography variant='caption'>{item.remark}</Typography>
                                                            แก้ไข
                                                        </>
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type='number' value={item.qty}
                                                        disabled={isWarranty}
                                                        onChange={(e) => handleQtyChange(index, parseInt(e.target.value))}
                                                        inputProps={{min: 1}} size="small"
                                                    />
                                                </TableCell>
                                                <TableCell onClick={()=>console.log(item)}>{item.sp_unit}</TableCell>
                                                <TableCell>{itemTotal}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Grid2>

                        <Grid2 size={12}>
                            <Stack direction='row-reverse'>
                                <Typography fontWeight='bold' fontSize={20}>
                                    รวมทั้งหมด: {totalPrice} บาท
                                </Typography>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12}>
                            <form onSubmit={onSubmit}>
                                <Stack direction='row' justifyContent='end' spacing={2}>
                                    <Button variant='outlined' onClick={() => setOpen(false)}>ยกเลิก</Button>
                                    <Button type='submit' variant='contained' color='primary'>บันทึก</Button>
                                </Stack>
                            </form>
                        </Grid2>
                    </Grid2>
                </DialogContent>
            </Dialog>
        </>

    );
}


const AlertNo = (props) => {

    const {targetSpZero, alertZero, setAlertZero, onPassed} = props;
    const [claim, setClaim] = useState('claim');
    const [target, setTarget] = useState(targetSpZero);

    const handleClose = (event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
        }
        setAlertZero(false);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setAlertZero(false)
        onPassed(target)
    }
    return (
        <Dialog
            maxWidth='lg'
            disableBackdropClick={true}
            open={alertZero}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"คุณได้กรอกราคาอะไหล่ เป็น 0 กรุณากรอกรายละเอียดดังนี้"}
            </DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <Alert onClick={() => console.log(targetSpZero)} severity='warning'>กำลังอยู่ในช่วงพัฒนา</Alert>
                    <Stack direction='column' spacing={2}>
                        <select
                            required
                            onChange={(e) => {
                                setClaim(e.target.value);
                                setTarget(prevState => {
                                    return {...prevState, claim: e.target.value === 'claim'}
                                })
                            }}
                            defaultValue={targetSpZero.claim ? 'claim' : 'dis_claim'}
                        >
                            <option value={'claim'}>เคลม</option>
                            <option value={'dis_claim'}>ไม่เคลม</option>
                        </select>

                        <textarea
                            onChange={(e) => setTarget(prevState => {
                                return {...prevState, remark: e.target.value}
                            })}
                            required={claim === 'claim'} placeholder='โปรดระบุเหตุผล'
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        type='submit'
                        onClick={() => onPassed(target)}
                        variant='contained' color='warning'
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </form>


        </Dialog>
    )
}


const SPARE_PART_IMAGE_PATH = import.meta.env.VITE_IMAGE_PATH;
const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
