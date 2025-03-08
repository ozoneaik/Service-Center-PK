import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {Breadcrumbs, Button, Container, Grid2, Stack, TextField, Typography, useStepContext} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProductDetail from '@/Components/ProductDetail';
import {useEffect, useState} from 'react';
import Progress from "@/Components/Progress.jsx";
import {AlertDialog, AlertDialogQuestion, AlertDialogQuestionForSearch} from "@/Components/AlertDialog.js";
import EditIcon from '@mui/icons-material/Edit';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import FormRepair from "@/Pages/ReportRepair/FormRepair.jsx";
import {PathDetail} from "@/Components/PathDetail.jsx";
import ListHistoryRepair from "@/Pages/HistoryRepair/ListHistoryRepair.jsx";
import {useProductTarget} from "@/Context/ProductContext.jsx";

export default function Dashboard() {
    const [check, setCheck] = useState('before');
    const [detail, setDetail] = useState();
    const [newData, setNewData] = useState();
    const [processing, setProcessing] = useState(false);
    const [sn, setSn] = useState();
    const [showContent, setShowContent] = useState();

    const fetchData = async (ser,createJob) => {
        setProcessing(true)
        try {
            const {data} = await axios.post('/search', {
                sn : ser,
                views: 'single',
                createJob : createJob
            });
            if (data.status === 'SUCCESS') {
                const responseData = data.searchResults;
                console.log(data.searchResults)
                setDetail(responseData)
                setSn(null);
                document.getElementById('search').value = null;
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

    const checkSn = async () => {
        try {
            const {data, status} = await axios.get(`/jobs/check/${sn}`);
            console.log(data,status)
            return {
                message : data.message,
                status : status
            }
        }catch (error){
            console.error(error.response.data.message)
            return {
                message : error.response.data.message,
                status : error.response.status  ??  500
            }
        }


    }


    const searchDetail = async (e) => {
        e.preventDefault();
        const {message, status} = await checkSn();
        console.log(message, status);
        if (status === 200){
            await fetchData(sn,false);
        }else if (status === 400){
            AlertDialogQuestionForSearch ({
                title : message,
                cancelButtonText : message === 'ไม่พบประวัติการซ่อมจากระบบ' ? 'ปิด' : 'ดูแค่ประวัติการซ่อม',
                text : 'เลือกเมนูดังต่อไปนี้',
                onPassed : async (confirm) => {
                    if (confirm){
                        await fetchData(sn , true);
                    }else{
                        if (message === 'ไม่พบประวัติการซ่อมจากระบบ') return;
                        await fetchData(sn , false)
                    }
                }
            })
        }else{
            AlertDialog({
                title : 'เกิดข้อผิดพลาด',
                text : message,
            })
        }

    }

    const ButtonLink = ({icon, title, color, menu}) => (
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
                                        <TextField id={'search'} sx={{backgroundColor: 'white'}} placeholder='ค้นหาหมายเลขซีเรียล'
                                                   fullWidth autoComplete='off'
                                                   defaultValue={sn || ''}
                                                   onChange={(e) => setSn(e.target.value)}/>
                                        <Button sx={{minWidth: 100}} disabled={processing || !sn} type='submit'
                                                size='small' variant='contained'
                                                startIcon={<SearchIcon/>}>
                                            {processing && 'กำลัง'}ค้นหา
                                        </Button>
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
                                {detail && showContent === 1 &&
                                    <FormRepair
                                        detail={detail} setDetail={setDetail}
                                        check={check} setCheck={setCheck}
                                    />
                                }
                                {detail && showContent === 2 &&
                                    <ListHistoryRepair
                                        detail={detail} setDetail={setDetail}
                                        check={check} setCheck={setCheck}
                                    />
                                }
                            </>
                        ) : <Progress/>
                        }
                    </Stack>
                </div>
            </Container>
        </AuthenticatedLayout>
    );
}
