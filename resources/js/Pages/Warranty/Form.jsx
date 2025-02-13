import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Button, CircularProgress, Container, Grid2, Stack, TextField} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import {useEffect, useRef, useState} from "react";
import {AlertDialog} from "@/Components/AlertDialog.js";
import ProductDetail from "@/Components/ProductDetail.jsx";
import axios from "axios";
import {useProductTarget} from "@/Context/ProductContext.jsx";

export default function FormWarranty() {
    const search = useRef(null);
    const {productTarget} = useProductTarget();
    const inputDate = useRef(null);
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState();

    useEffect(() => {
        if (productTarget){
            fetchData(productTarget.serial).then()
        }
    }, []);

    const fetchData = async (sn) => {

        try {
            setLoading(true);
            const {data, status} = await axios.post('/search', {sn, views: 'single'});
            if (data.searchResults.message === 'SUCCESS') {
                console.log(data)
                setDetail(data.searchResults.assets[0])
            } else {
                throw 'error'
            }
        } catch (err) {
            setDetail();
            console.log(err)
            AlertDialog({
                title: 'เกิดข้อผิดพลาด', onPassed: () => {
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


    const handelSubmit = async (e) => {
        e.preventDefault();
        try {
            const {data, status} = await axios.post('/warranty/store', {
                serial_id: detail.serial,
                pid: detail.pid,
                p_name: detail.pname,
                date_warranty: inputDate.current.value
            })
            console.log(data, status);
            AlertDialog({
                icon: 'success',
                text: data.message
            })
        } catch (error) {
            AlertDialog({
                text: error.response.data.message,
                onPassed: async () => {
                    if (error.response.data.message === 'เคยบันทึกข้อมูลนี้ไว้แล้ว กดตกลงเพื่อ อัพเดทข้อมูล') {
                        const {data, status} = await axios.put('/warranty/update', {
                            serial_id: detail.serial,
                            date_warranty: inputDate.current.value
                        });
                        AlertDialog({
                            icon: status === 200 ? 'success' : 'error',
                            title: status === 200 ? 'สำเร็จ' : 'error',
                            text: data.message ?? 'no content',
                            onPassed : () => {}
                        })
                    }
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
                                <input style={{
                                    borderRadius: 5,
                                    border: '1px black solid',
                                    width: '100%',
                                    padding: 12,
                                    fontSize: 18
                                }} ref={search} placeholder='ค้นหาหมายเลขซีเรียล'/>
                                <Button type='submit' variant='contained' startIcon={<SearchIcon/>}>
                                    ค้นหา
                                </Button>
                            </Stack>
                        </form>
                    </Grid2>
                    <Grid2 size={12}>
                        {!loading ? (detail && <ProductDetail {...detail} warranty={false}/>) : <CircularProgress/>}
                    </Grid2>
                    {detail && (<Grid2 size={12}>
                        <form onSubmit={handelSubmit}>
                            <Stack direction='row' spacing={2}>
                                <input type='date' style={{
                                    minWidth: 300,
                                    borderRadius: 5, border: '1px black solid',
                                    padding: 12, fontSize: 18
                                }} ref={inputDate} placeholder='ค้นหาหมายเลขซีเรียล'/>
                                <Button type='submit' variant='contained'>บันทึก</Button>
                            </Stack>
                        </form>
                    </Grid2>)}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
