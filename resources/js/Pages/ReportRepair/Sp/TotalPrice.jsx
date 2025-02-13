import {
    Alert,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid2, Stack,
    Table, TableBody,
    TableCell,
    TableHead,
    TableRow, TextField, Typography,
    useTheme
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import {useMemo, useState} from "react";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import {AlertDialog} from "@/Components/AlertDialog.js";

const spPath = 'https://images.dcpumpkin.com/images/product/500/default.jpg';

const theadStyle = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
}

export default function TotalPrice(props) {
    const {open, setOpen, selected, setSelected, serial_id,setDetail,detail} = props
    const {setBtnSelected,btnSelected} = props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    // State เก็บค่าจำนวนของแต่ละอะไหล่
    const [quantities, setQuantities] = useState({});

    // ฟังก์ชันคำนวณราคาของแต่ละอะไหล่
    const handleQuantityChange = (event, item, type) => {
        const qty = parseInt(event.target.value) || 0; // แปลงเป็นตัวเลข
        setQuantities(prev => ({
            ...prev,
            [item.spcode]: qty
        }));
        setSelected((prevSelected) => {
            return {
                ...prevSelected,
                [type]: prevSelected[type].map((spItem) =>
                    spItem.spcode === item.spcode ? {...spItem, qty: qty} : spItem
                ),
            };
        });
    };

    // คำนวณผลรวมของแต่ละอะไหล่ (ราคาต่อหน่วย * จำนวน)
    const getItemTotal = (item) => {
        return (quantities[item.spcode] || 0) * item.price_per_unit;
    };

    // คำนวณผลรวมทั้งหมดของทุกอะไหล่
    const totalPrice = useMemo(() => {
        return [...(selected.sp_warranty || []), ...(selected.sp || [])].reduce((sum, item) => {
            return sum + getItemTotal(item);
        }, 0);
    }, [quantities, selected]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setOpen(false);
        try {
            const {data,status} = await axios.post('/spare-part/store', {
                serial_id,
                list: selected,
                job_id : detail.job.job_id
            })
            AlertDialog({
                icon : 'success',
                title : 'สำเร็จ',
                text : data.message,
                onPassed : () => {
                    setDetail(prevDetail => ({
                        ...prevDetail,
                        selected: {
                            ...prevDetail.selected,
                            sp_warranty: selected.sp_warranty,
                            sp : selected.sp
                        }
                    }));
                    setBtnSelected(1);
                }
            })
        } catch (error) {
            AlertDialog({
                title : 'เกิดข้อผิดพลาด',
                text: error.response.data.message + ` (code : ${error.status})`,
                onPassed : () => {}
            })
        }
    }

    return (
        <Dialog fullWidth fullScreen={fullScreen} maxWidth='lg' open={open} onClose={() => setOpen(false)}>
            <DialogTitle fontWeight='bold'>สรุปรายการอะไหล่</DialogTitle>

            <DialogContent>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Alert severity="success" icon={<BookmarkIcon/>}>
                            สีเขียว => อะไหล่อยู่ในประกัน
                        </Alert>
                    </Grid2>

                    <Grid2 size={12} maxHeight={500} sx={{overflowY: 'scroll'}}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{fontWeight: 'bold'}}>
                                    <TableCell sx={theadStyle} width={10}>รูปภาพ</TableCell>
                                    <TableCell sx={theadStyle}>รหัสอะไหล่</TableCell>
                                    <TableCell sx={theadStyle}>ชื่ออะไหล่</TableCell>
                                    <TableCell sx={theadStyle}>ราคาต่อหน่วย</TableCell>
                                    <TableCell sx={theadStyle} width={200}>จำนวน</TableCell>
                                    <TableCell sx={theadStyle}>หน่วย</TableCell>
                                    <TableCell sx={theadStyle}>ราคารวม</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...(selected.sp_warranty || []), ...(selected.sp || [])].map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <ImagePreview src={spPath}/>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                color={selected.sp_warranty.includes(item) ? 'success' : 'inherit'}>
                                                {item.spcode}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                color={selected.sp_warranty.includes(item) ? 'success' : 'inherit'}>
                                                {item.spname}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{item.price_per_unit ?? 0}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                value={quantities[item.spcode] || item.qty || 0}
                                                onChange={(e) => {
                                                    handleQuantityChange(e, item, selected.sp_warranty.includes(item) ? 'sp_warranty' : 'sp')
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{item.spunit ?? 'อัน'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{getItemTotal(item)} บาท</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                                <Button variant='contained' onClick={() => setOpen(false)}
                                        color='primary'>ยกเลิก</Button>
                                <Button type='submit' variant='contained' color='error'>บันทึก</Button>
                            </Stack>
                        </form>
                    </Grid2>
                </Grid2>
            </DialogContent>
        </Dialog>
    );
}
