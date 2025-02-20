import {
    Alert, Button, Dialog, DialogContent, DialogTitle, Grid2, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import {useState, useMemo, useEffect} from "react";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import {AlertDialog} from "@/Components/AlertDialog.js";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import axios from 'axios';

const SPARE_PART_IMAGE_PATH = import.meta.env.VITE_IMAGE_PATH;
const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};

export default function TotalPrice(props) {
    const {open, setOpen} = props;
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
                    qty: 1
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

    // Handle price with GP change
    const handlePriceChange = (index, value) => {
        const newItems = [...localItems];
        newItems[index].price_multiple_gp = value;
        setLocalItems(newItems);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setOpen(false);

        // Prepare items with required fields for submission
        const itemsForSubmission = localItems.map(item => ({
            spcode: item.spcode,
            spname: item.spname,
            price_per_unit: item.price_per_unit,
            spunit: item.spunit,
            warranty: item.warranty,
            qty: item.qty,
            price_multiple_gp: item.price_multiple_gp,
            gp: gpDefault
        }));

        try {
            const {data} = await axios.post('/spare-part/store', {
                serial_id,
                list : {
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
                onPassed: () => {}
            });
        }
    };

    return (
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
                                    const rowStyle = isWarranty ? { backgroundColor: '#e8f5e9' } : {};
                                    const itemTotal = isWarranty ? 0 : (parseFloat(item.price_multiple_gp) * parseFloat(item.qty)).toFixed(2);

                                    return (
                                        <TableRow key={index} style={rowStyle}>
                                            <TableCell>
                                                <ImagePreview src={image_sp_path}/>
                                            </TableCell>
                                            <TableCell>{item.spcode}</TableCell>
                                            <TableCell>{item.spname}</TableCell>
                                            <TableCell>{parseFloat(item.price_per_unit).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={item.price_multiple_gp}
                                                    onChange={(e) => handlePriceChange(index, e.target.value)}
                                                    disabled={isWarranty}
                                                    type="number"
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type='number'
                                                    value={item.qty}
                                                    onChange={(e) => handleQtyChange(index, parseInt(e.target.value))}
                                                    disabled={isWarranty}
                                                    inputProps={{ min: 1 }}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{item.spunit}</TableCell>
                                            <TableCell>
                                                {itemTotal}
                                            </TableCell>
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
    );
}
