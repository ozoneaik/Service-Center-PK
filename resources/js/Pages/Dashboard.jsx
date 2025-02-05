import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {Breadcrumbs, Button, Container, Grid2, Stack, TextField, Typography, useStepContext} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProductDetail from '@/Components/ProductDetail';
import {useState} from 'react';
import Progress from "@/Components/Progress.jsx";
import {AlertDialog} from "@/Components/AlertDialog.js";
import EditIcon from '@mui/icons-material/Edit';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import FormRepair from "@/Pages/ReportRepair/FormRepair.jsx";
import {PathDetail} from "@/Components/PathDetail.jsx";
import ListHistoryRepair from "@/Pages/HistoryRepair/ListHistoryRepair.jsx";

export default function Dashboard() {
    const [check, setCheck] = useState('before');
    const [detail, setDetail] = useState();
    const [newData, setNewData] = useState();
    const [processing, setProcessing] = useState(false);
    const [sn, setSn] = useState();
    const [showContent, setShowContent] = useState();
    const searchDetail = async (e) => {
        e.preventDefault();
        setProcessing(true)
        try {

            const {data, status} = await axios.post('/search', {sn, views: 'single'});
            console.log(data,status)
            if (data.searchResults.message === 'SUCCESS') {
                console.log(data.searchResults.assets[0])
                setDetail(data.searchResults.assets[0])
            } else {
                throw 'error'
            }
        } catch (err) {
            setDetail();
            console.log(err)
            AlertDialog({
                title: 'เกิดข้อผิดพลาด', text: err.response.data.message, onPassed: () => {
                }
            })
        } finally {
            setProcessing(false);
            setShowContent();
        }
    }

    const ButtonLink = ({url, data, icon, title, color, menu}) => (
        // <Link href={url} method='post' data={data} id='LinkInertia'>
        <Button disabled={showContent === menu} onClick={() => setShowContent(menu)} component='a' variant='contained'
                color={color} sx={{width: 150}}>
            <Stack direction='column' justifyContent='center' alignItems='center'>
                {icon}
                {title}
            </Stack>
        </Button>
        // </Link>
    )

    const ButtonList = () => (
        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} justifyContent='start' alignItems='center'>
            <ButtonLink menu={1} icon={<EditIcon/>} title={'แจ้งซ่อม'} data={detail}
                        color='primary'/>
            <ButtonLink menu={2} icon={<ManageHistoryIcon/>} title={'ดูประวัติการซ่อม'}
                        data={detail} color='secondary'/>
        </Stack>
    )

    return (
        <AuthenticatedLayout>
            <Head title="หน้าหลัก"/>
            <Container>
                <div className=" mt-4 p-4 ">
                    <Stack direction='column' spacing={1}>
                        <form onSubmit={searchDetail}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={12} mb={10}>
                                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                        <TextField sx={{backgroundColor: 'white'}} placeholder='ค้นหาหมายเลขซีเรียล'
                                                   fullWidth
                                                   onChange={(e) => setSn(e.target.value)}/>
                                        <Button sx={{minWidth: 100}} disabled={processing || !sn} type='submit'
                                                size='small' variant='contained'
                                                startIcon={<SearchIcon/>}>
                                            {processing && 'กำลัง'}ค้นหา
                                        </Button>
                                    </Stack>
                                    <Stack direction='row-reverse' mt={2}>
                                        <Breadcrumbs>
                                            <Typography sx={{ color: 'text.primary' }}>Breadcrumbs2</Typography>
                                            <Typography sx={{ color: 'text.primary' }}>Breadcrumbs3</Typography>
                                            <Typography sx={{ color: 'text.primary' }}>Breadcrumbs4</Typography>
                                        </Breadcrumbs>
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        </form>
                        {!processing ? (
                            <>
                                {detail && <ProductDetail {...detail} />}
                                {detail && !processing && <ButtonList/>}
                                {detail && showContent &&
                                    <PathDetail
                                        name={showContent === 1 ? 'แจ้งซ่อม' : 'ดูประวัติการซ่อม'}
                                        Sn={detail.serial}
                                    />
                                }
                                {detail && showContent === 1 && <FormRepair detail={detail} setDetail={setDetail} check={check} setCheck={setCheck}/>}
                                {detail && showContent === 2 && <ListHistoryRepair detail={detail} setDetail={setDetail} check={check} setCheck={setCheck}/>}
                            </>
                        ) : <Progress/>
                        }
                        {/*{detail && !processing && <ProductDetail {...detail} />}*/}
                        {/*{processing && <Progress/>}*/}

                    </Stack>
                </div>
            </Container>
        </AuthenticatedLayout>
    );
}
