import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, Link, useForm} from '@inertiajs/react';
import {Button, Grid2, Stack, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProductDetail from '@/Components/ProductDetail';
import {useState} from 'react';
import Progress from "@/Components/Progress.jsx";
import {AlertDialog, AlertWithFormDialog} from "@/Components/AlertDialog.js";

export default function Dashboard() {
    const [detail, setDetail] = useState();
    const {data, setData, post, processing, errors, reset} = useForm({
        sn: '',
        views: 'single'
    })

    const searchDetail = async (e) => {
        e.preventDefault();
        post(route('search'), {
            onSuccess: ({props}) => {
                if (props.searchResults.message === 'SUCCESS') {
                    const result = props.searchResults.assets[0];
                    console.log(result)
                    setDetail(result);
                } else {
                    setDetail();
                    AlertWithFormDialog({
                        text: 'ไม่พบซีเรียลนี้ในระบบ กรุณากรอกรหัสสินค้าแทน',
                        title: 'เกิดข้อผิดพลาด',
                        res: (confirm, value) => {
                            console.log(confirm, value)
                        }
                    })
                }
            }
        });
    }

    const ButtonList = () => (
        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} justifyContent='center' alignItems='center'>
            <Link href='reportRepair/show' data={detail}>
                <Button variant='contained' color='primary'>แจ้งซ่อม</Button>
            </Link>
            <Button variant='contained' color='primary'>กำลังดำเนินการ</Button>
            <Button variant='contained' color='primary'>ดูประวัติการซ่อม</Button>
        </Stack>
    )

    return (
        <AuthenticatedLayout>
            <Head title="หน้าหลัก updated"/>
            <div className="bg-white mt-4 p-4 ">
                <Stack direction='column' spacing={2}>
                    <form onSubmit={searchDetail}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                    <TextField placeholder='ค้นหาหมายเลขซีเรียล' fullWidth size='small'
                                               onChange={(e) => setData('sn', e.target.value)}/>
                                    <Button disabled={processing} type='submit' size='small' variant='contained'
                                            startIcon={<SearchIcon/>}>
                                        {processing && 'กำลัง'}ค้นหา
                                    </Button>
                                </Stack>
                            </Grid2>
                        </Grid2>
                    </form>
                    {detail && !processing && <ProductDetail {...detail} />}
                    {processing && <Progress/>}
                    {detail && !processing && <ButtonList/>}

                </Stack>
            </div>
        </AuthenticatedLayout>
    );
}
