import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, router} from "@inertiajs/react";
import {
    Alert, Button, CircularProgress, Container, FormLabel,
    Grid2, Stack, TextField, Typography
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import {useEffect, useRef, useState} from "react";
import {AlertDialog, AlertForWarranty} from "@/Components/AlertDialog.js";
import ProductDetail from "@/Components/ProductDetail.jsx";
import axios from "axios";

export default function FormWarranty() {

    const search = useRef(null);
    const [inputDate, setInputDate] = useState('');
    const [warrantyAt, setWarrantyAt] = useState();
    const [expireDate, setExpireDate] = useState();
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState();
    const [message, setMessage] = useState('');

    const [maxDate, setMaxDate] = useState('');
    const [minDate, setMinDate] = useState('');
    useEffect(() => {
        // สร้างวันที่ปัจจุบัน (max date)
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        // สร้างวันที่ย้อนหลัง 14 วัน (min date)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(today.getDate() - 14);
        const formattedFourteenDaysAgo = fourteenDaysAgo.toISOString().split('T')[0];

        setMaxDate(formattedToday);
        setMinDate(formattedFourteenDaysAgo);
    }, []);


    const fetchData = async (sn) => {
        try {
            setLoading(true);
            const {data, status} = await axios.post('/warranty/search', {serial_id: sn, views: 'single'});
            if (data.searchResults.message === 'SUCCESS') {
                console.log(data)
                setDetail(data.searchResults.assets[0])
                setWarrantyAt(data.warrantyAt)
                setExpireDate(data.expire_date);
            } else {
                throw 'error'
            }
        } catch (err) {
            setDetail({});
            console.log(err)
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: err.response.data.message,
            })
        } finally {
            setLoading(false)
        }
    }

    const handelSearch = async (e) => {
        e.preventDefault()
        const sn = search.current.value;
        await fetchData(sn)
    }

    const handelSave = (e) => {
        e.preventDefault();
        AlertForWarranty({
            text: 'กด บันทึก หรือ บันทึก/แจ้งซ่อม เพื่อบันทึกข้อมูลรับประกัน',
            onPassed: async (confirm, confirmAndRedirect) => {
                if (confirm || confirmAndRedirect) {
                    await handelSubmit(e, confirmAndRedirect);
                }
            }
        })
    }


    const handelSubmit = async (e, confirmAndRedirect) => {
        e.preventDefault();
        try {
            const {data, status} = await axios.post('/warranty/store', {
                serial_id: detail.serial,
                pid: detail.pid,
                p_name: detail.pname,
                date_warranty: inputDate,
                warrantyperiod: parseInt(detail.warrantyperiod)
            })
            console.log(data, status);
            AlertDialog({
                icon: 'success',
                text: data.message
            })
            setWarrantyAt(inputDate)
            setMessage(data.message)
            if (confirmAndRedirect) {
                router.get(route('dashboard', {SN: detail.serial}))
            }
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message,
                onPassed: async () => {
                }
            })
        }
    }


    return (
        <AuthenticatedLayout>
            <Head title="ลงทะเบียนรับประกัน"/>
            <Container sx={{mt: '5rem'}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <form onSubmit={handelSearch}>
                            <Stack direction='row' spacing={2}>
                                <TextField placeholder='ค้นหาเลขซีเรียล' inputRef={search} fullWidth size='small'
                                           sx={{backgroundColor: 'white'}}/>
                                <Button type='submit' variant='contained' startIcon={<SearchIcon/>}>
                                    ค้นหา
                                </Button>
                            </Stack>
                        </form>
                    </Grid2>
                    <Grid2 size={12}>
                        {!loading ? (detail && <ProductDetail {...detail} warranty={false}/>) : <CircularProgress/>}
                    </Grid2>


                    {detail && !warrantyAt ? (
                        <>
                            <Grid2 size={12}>
                                <Typography>
                                    คุณได้กรอกเป็น {'=>'} {new Date(inputDate).toLocaleDateString('th')}
                                </Typography>
                            </Grid2>
                            <Grid2 size={12}>
                                <Stack direction='row' spacing={2}>
                                    <div>
                                        <FormLabel>วันที่ซื้อ</FormLabel>
                                        <form onSubmit={handelSave}>
                                            <Stack direction='row' spacing={2}>
                                                <TextField
                                                    // inputProps={{
                                                    //     min: minDate,
                                                    //     max: maxDate
                                                    // }}
                                                    // InputLabelProps={{
                                                    //     shrink: true
                                                    // }}
                                                    type='date'
                                                    onChange={(e) => setInputDate(e.target.value)}
                                                    onKeyDown={(e) => e.preventDefault()} // ป้องกันการป้อนข้อมูลด้วยคีย์บอร์ด
                                                />
                                                <Button
                                                    disabled={!inputDate}
                                                    type='submit' variant='contained'>บันทึก</Button>
                                            </Stack>
                                        </form>
                                    </div>
                                    <div>
                                        <Typography>ใบรับประกันหรือหลักฐานการซื้อขาย</Typography>
                                        <TextField type='file'/>
                                    </div>
                                </Stack>

                            </Grid2>
                        </>
                    ) : (warrantyAt ? (
                            <Alert security='success' sx={{width: '100%'}}>
                                <Stack direction='row' spacing={1}>
                                    <Typography>{message}</Typography>
                                    {/*<Typography>หมายเลขซีเรียลนี้เคยลงทะเบียนรับประกันไปแล้ว คือ</Typography>*/}
                                    {/*<Typography fontWeight='bold'>*/}
                                    {/*    {new Date(warrantyAt).toLocaleDateString('th')}*/}
                                    {/*    &nbsp;สิ้นสุดประกันถึง&nbsp;*/}
                                    {/*    {new Date(expireDate).toLocaleDateString('th')}*/}
                                    {/*</Typography>*/}
                                </Stack>
                            </Alert>
                        ) : <></>
                    )}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
