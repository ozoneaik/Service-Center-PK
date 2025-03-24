import {
    Dialog,
    DialogContent,
    Grid2,
    InputAdornment,
    TextField,
    Typography,
    Button,
    Stack,
    Table,
    TableCell,
    TableHead,
    TableRow,
    TableBody,
    Alert,
    CircularProgress
} from "@mui/material";
import QrCodeIcon from '@mui/icons-material/QrCode';
import {useEffect, useRef, useState} from "react";
import {useForm, usePage} from "@inertiajs/react";

export default function AddSpWithBill({openAddSpBill, setOpenAddSpBill}) {
    const barCodeRef = useRef(null);
    const [errorSearch, setErrorSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [spList, setSpList] = useState([]);
    const [barcodeResponse, setBarcodeResponse] = useState('');
    const user = usePage().props.auth.user;
    const {data, setData, post, processing, error} = useForm({
        spList: spList,
        is_code_cust_id: user.is_code_cust_id,
        barcode: ''
    });
    const [statusSaved, setStatusSaved] = useState(false);
    const {flash} = usePage().props


    useEffect(() => {
        setData("spList", spList);
    }, [spList]);

    const handleOnClose = (e, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
        }
        setOpenAddSpBill(false);
    }

    const handleOnSearch = async (e) => {
        e.preventDefault();
        try {
            setErrorSearch(null)
            setLoading(true);
            setStatusSaved(false);
            const response = await axios.get(route('getSp', {barcode: barCodeRef.current.value}));
            console.log(response.data, response.status);
            setSpList(response.data.listSp);
            setBarcodeResponse(response.data.barcode);
            setData("barcode", response.data.barcode);
        } catch (error) {
            console.log(error);
            setSpList([]);
            setErrorSearch(error.response.data.message)
        } finally {
            setLoading(false);
            barCodeRef.current.value = '';
        }
    }

    const handleChangeQty = (e, index) => {
        const value = parseInt(e.target.value);
        setSpList(spList.map((item, idx) => {
            if (idx === index) item.qty_sp = value;
            return item;
        }))
    }

    const handleOnSave = async (e) => {
        e.preventDefault();
        try {
            await post(route('stockSp.storeManySp'), {
                preserveScroll: true,
                onSuccess: (response) => {
                    console.log("✅ บันทึกสำเร็จ:", response);
                    setStatusSaved(true);
                },
                onError: (errors) => {
                    console.error("❌ เกิดข้อผิดพลาดจาก Backend:", errors);
                    setStatusSaved(true);
                }
            });

            console.log("✅ บันทึกข้อมูลเสร็จสิ้นแล้ว!"); // ตรวจสอบว่าผ่าน await หรือไม่
        } catch (error) {
            console.error("⚠️ เกิดข้อผิดพลาดใน post() :", error);
        }
    }


    return (
        <Dialog
            open={openAddSpBill}
            onClose={(e, reason) => handleOnClose(e, reason)}
            fullWidth maxWidth="md">
            <DialogContent>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant="h6" fontWeight='bold'>เพิ่มอะไหล่จากการสแกนบิล</Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        <form onSubmit={handleOnSearch}>
                            <Stack direction='column' spacing={2}>
                                <Alert severity="warning" sx={{width: '100%'}}>
                                    หากใช้เครื่องยิงบาร์โค้ด อย่าลืมเปลี่ยนภาษาให้เป็นภาษาอังกฤษ
                                    และโปรดมั่นใจว่าช่องค้นหา อยู่ในสถานะกำลังพิมพ์อยู่
                                </Alert>
                                <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                    <TextField autoFocus inputRef={barCodeRef} fullWidth label='หมายเลขบิล'
                                               placeholder="สแกนบิลหรือกรอกหมายเลขบิล" slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <QrCodeIcon/>
                                                </InputAdornment>
                                            )
                                        }
                                    }}/>
                                    <Button variant="contained" disabled={loading} type="submit">
                                        {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </form>
                    </Grid2>
                </Grid2>
                <form onSubmit={handleOnSave}>
                    <Grid2 container spacing={2} mt={2}>
                        <Grid2 size={12}>
                            <Typography variant="h6" fontWeight='bold'>
                                รายการอะไหล่ {barcodeResponse}
                            </Typography>
                        </Grid2>
                        {flash.success && statusSaved && <Grid2 size={12}>
                            <Alert severity="success" onClose={() => setStatusSaved(false)}>
                                {flash.success}
                            </Alert>
                        </Grid2>}
                        {flash.error && statusSaved && <Grid2 size={12}>
                            <Alert severity="error" onClose={() => setStatusSaved(false)}>
                                {flash.error}
                            </Alert>
                        </Grid2>}
                        {errorSearch && (
                            <Grid2 size={12}>
                                <Alert severity="error" onClose={() => setErrorSearch(null)}>
                                    {errorSearch}
                                </Alert>
                            </Grid2>
                        )}
                        <Grid2 size={12} sx={{maxHeight: 450, overflowY: 'auto'}}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {['รหัสอะไหล่', 'ชื่ออะไหล่', 'จำนวน'].map((item, index) => (
                                            <TableCell sx={TABLE_HEADER_STYLE} key={index}>{item}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!loading ? (
                                            <>
                                                {spList.length === 0 ?
                                                    <TableRow>
                                                        <TableCell colSpan={3}>ไม่พบรายการอะไหล่</TableCell>
                                                    </TableRow>
                                                    :
                                                    <>{spList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.sp_code}</TableCell>
                                                            <TableCell>{item.sp_name}</TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    onChange={(e) => handleChangeQty(e, index)}
                                                                    value={parseInt(item.qty_sp)}
                                                                    fullWidth
                                                                    size="small"
                                                                    type="number"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}</>}
                                            </>
                                        ) :
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <CircularProgress/>
                                            </TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </Grid2>
                        {!loading && <Grid2 size={12}>
                            <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                <Button variant="outlined" fullWidth onClick={() => setOpenAddSpBill(false)}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={spList.length === 0 || processing} variant="contained"
                                        fullWidth>
                                    {processing ? 'กำลังบันทึก...' : 'บันทึก'}
                                </Button>
                            </Stack>
                        </Grid2>}
                    </Grid2>
                </form>

            </DialogContent>
        </Dialog>
    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
