import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Alert,
    Button,
    CircularProgress,
    Container,
    FormLabel,
    Grid2, Input,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import {useRef, useState} from "react";
import {AlertDialog, AlertForWarranty} from "@/Components/AlertDialog.js";
import ProductDetail from "@/Components/ProductDetail.jsx";
import axios from "axios";
import {Datepicker} from "flowbite-react";

export default function FormWarranty() {

    const search = useRef(null);
    const [inputDate, setInputDate] = useState('');
    const [warrantyAt, setWarrantyAt] = useState();
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState();


    const fetchData = async (sn) => {
        try {
            setLoading(true);
            const {data, status} = await axios.post('/warranty/search', {serial_id: sn, views: 'single'});
            if (data.searchResults.message === 'SUCCESS') {
                console.log(data)
                setDetail(data.searchResults.assets[0])
                setWarrantyAt(data.warrantyAt)
            } else {
                throw 'error'
            }
        } catch (err) {
            setDetail({});
            console.log(err)
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: err.response.data.message,
                onPassed: () => {
                }
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
            text : 'กด บันทึก หรือ บันทึก/แจ้งซ่อม เพื่อบันทึกข้อมูลรับประกัน',
            onPassed : async (confirm, confirmAndRedirect) => {
                if (confirm || confirmAndRedirect) {
                    await handelSubmit(e);
                }
            }
        })

    }


    const handelSubmit = async (e) => {
        e.preventDefault();
        try {
            const {data, status} = await axios.post('/warranty/store', {
                serial_id: detail.serial,
                pid: detail.pid,
                p_name: detail.pname,
                date_warranty: inputDate
            })
            console.log(data, status);
            AlertDialog({
                icon: 'success',
                text: data.message
            })
            setWarrantyAt(inputDate)
        } catch (error) {
            AlertDialog({
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
                        <Grid2 size={12}>
                            <FormLabel>วันที่ซื้อ</FormLabel>
                            <form onSubmit={handelSave}>
                                <Stack direction='row' spacing={2}>
                                    <TextField
                                        type='date'
                                        onChange={(e) => setInputDate(e.target.value)}
                                    />
                                    {/*<Datepicker*/}
                                    {/*    language="th-TH"*/}
                                    {/*    onChange={(date) => setInputDate(date.toLocaleString())}*/}
                                    {/*/>*/}

                                    <Button
                                        disabled={!inputDate}
                                        type='submit' variant='contained'>บันทึก</Button>
                                </Stack>
                            </form>
                        </Grid2>
                    ) : (warrantyAt ? (
                            <Alert security='success' sx={{width: '100%'}}>
                                <Stack direction='row' spacing={1}>
                                    <Typography>หมายเลขซีเรียลนี้เคยลงทะเบียนรับประกันไปแล้ว คือ</Typography>
                                    <Typography fontWeight='bold'>{warrantyAt}</Typography>
                                </Stack>
                            </Alert>
                        ) : <></>
                    )}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}

