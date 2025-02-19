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
import {useEffect, useMemo, useState} from "react";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import {AlertDialog} from "@/Components/AlertDialog.js";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';

const spPath = 'https://images.dcpumpkin.com/images/product/500/default.jpg';

const theadStyle = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
}

export default function TotalPrice(props) {
    const [gpDefault, setGpDefault] = useState(10);
    const {open, setOpen, selected, setSelected, serial_id, setDetail, detail} = props
    const {setBtnSelected, btnSelected} = props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    // State เก็บค่าจำนวนของแต่ละอะไหล่
    const [quantities, setQuantities] = useState({});
    // State เก็บค่า GP ของแต่ละอะไหล่
    const [gpValues, setGpValues] = useState({});


    useEffect(() => {
        const initialQuantities = {};
        const initialGpValues = {};
        [...(selected.sp_warranty || []), ...(selected.sp || [])].forEach(item => {
            initialQuantities[item.spcode] = item.qty || 1;
            initialGpValues[item.spcode] = item.gp || gpDefault;
        });
        setQuantities(initialQuantities);
        setGpValues(initialGpValues);
    }, [selected, gpDefault]);

    const handleQuantityChange = (event, item, type) => {
        const qty = parseInt(event.target.value) || 0;
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

    const handleGpChange = (event, item, type) => {
        const gpValue = parseInt(event.target.value) || 0;
        setGpValues(prev => ({
            ...prev,
            [item.spcode]: gpValue
        }));

        setSelected((prevSelected) => {
            return {
                ...prevSelected,
                [type]: prevSelected[type].map((spItem) =>
                    spItem.spcode === item.spcode ? {...spItem, gp: gpValue} : spItem
                ),
            };
        });
    };

    const calculatePriceWithGp = (item) => {
        const gp = gpValues[item.spcode] || gpDefault;
        return (gp/100 * parseFloat(item.price_per_unit)) + parseFloat(item.price_per_unit);
    };

    const getItemTotal = (item) => {
        const priceWithGp = calculatePriceWithGp(item);
        return (quantities[item.spcode] || 1) * priceWithGp;
    };

    const totalPrice = useMemo(() => {
        const allItems = [...(selected.sp_warranty || []), ...(selected.sp || [])];
        return allItems.reduce((sum, item) => {
            const quantity = quantities[item.spcode] || 1;
            const priceWithGp = calculatePriceWithGp(item);
            return sum + (quantity * priceWithGp);
        }, 0);
    }, [quantities, gpValues, selected.sp_warranty, selected.sp]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setOpen(false);
        try {
            // Include GP values in the submitted data
            const updatedSelected = {
                ...selected,
                sp_warranty: selected.sp_warranty.map(item => ({
                    ...item,
                    gp: gpValues[item.spcode] || gpDefault
                })),
                sp: selected.sp.map(item => ({
                    ...item,
                    gp: gpValues[item.spcode] || gpDefault
                }))
            };

            const {data, status} = await axios.post('/spare-part/store', {
                serial_id,
                list: updatedSelected,
                job_id: detail.job.job_id
            })
            AlertDialog({
                icon: 'success',
                title: 'สำเร็จ',
                text: data.message,
                onPassed: () => {
                    setDetail(prevDetail => ({
                        ...prevDetail,
                        selected: {
                            ...prevDetail.selected,
                            sp_warranty: updatedSelected.sp_warranty,
                            sp: updatedSelected.sp
                        }
                    }));
                    setBtnSelected(1);
                }
            })
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message + ` (code : ${error.status})`,
                onPassed: () => {
                }
            })
        }
    }

    return (
        <Dialog fullWidth fullScreen={fullScreen} maxWidth='lg' open={open} onClose={() => setOpen(false)}>
            <DialogTitle fontWeight='bold'>สรุปรายการอะไหล่</DialogTitle>

            <DialogContent>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <Alert sx={{width : '80%'}} severity="success" icon={<BookmarkIcon/>}>
                                สีเขียว {'=>'} อะไหล่อยู่ในประกัน
                            </Alert>
                            <Alert sx={{width : '20%'}} severity="info" icon={<BookmarkAddIcon/>}>
                                GP {gpDefault} % ตั้งต้น
                            </Alert>
                        </Stack>
                    </Grid2>

                    <Grid2 size={12} maxHeight={500} sx={{overflowY: 'scroll'}}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{fontWeight: 'bold'}}>
                                    <TableCell sx={theadStyle} width={10}>รูปภาพ</TableCell>
                                    <TableCell sx={theadStyle}>รหัสอะไหล่</TableCell>
                                    <TableCell sx={theadStyle}>ชื่ออะไหล่</TableCell>
                                    <TableCell sx={theadStyle}>ราคาต่อหน่วย</TableCell>
                                    <TableCell sx={theadStyle}>
                                        GP %
                                    </TableCell>
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
                                            <Typography>
                                                {calculatePriceWithGp(item).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                sx={{minWidth : 100}}
                                                disabled={selected.sp_warranty.includes(item)}
                                                type="number"
                                                value={gpValues[item.spcode] || gpDefault}
                                                onChange={(e) => {
                                                    handleGpChange(e, item, selected.sp_warranty.includes(item) ? 'sp_warranty' : 'sp')
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                sx={{minWidth : 100}}
                                                type="number"
                                                value={quantities[item.spcode] || item.qty || 1}
                                                onChange={(e) => {
                                                    handleQuantityChange(e, item, selected.sp_warranty.includes(item) ? 'sp_warranty' : 'sp')
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{item.spunit ?? 'อัน'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{getItemTotal(item).toFixed(2)} บาท</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid2>

                    <Grid2 size={12}>
                        <Stack direction='row-reverse'>
                            <Typography fontWeight='bold' fontSize={20}>
                                รวมทั้งหมด: {totalPrice.toFixed(2)} บาท
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
