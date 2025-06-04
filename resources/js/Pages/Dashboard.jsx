import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {Button, Container, Grid2, Stack, TextField} from '@mui/material';
import {Search,Edit,ManageHistory, YouTube,MenuBook} from '@mui/icons-material';
import ProductDetail from '@/Components/ProductDetail';
import {useEffect, useState} from 'react';
import Progress from "@/Components/Progress.jsx";
import {AlertDialog, AlertDialogQuestionForSearch, AlertWithFormDialog} from "@/Components/AlertDialog.js";
import FormRepair from "@/Pages/ReportRepair/FormRepair.jsx";
import {PathDetail} from "@/Components/PathDetail.jsx";
import ListHistoryRepair from "@/Pages/HistoryRepair/ListHistoryRepair.jsx";

export default function Dashboard({SN,JOB_ID}) {
    useEffect(() => {
        if (SN && JOB_ID){
            fetchData(SN, false).then();
        }
    }, [])
    const [check, setCheck] = useState('before');
    const [detail, setDetail] = useState();
    const [processing, setProcessing] = useState(false);
    const [sn, setSn] = useState(SN || '');
    const [showContent, setShowContent] = useState();

    const fetchData = async (ser, createJob) => {
        setProcessing(true);
        try {

            const {data} = await axios.post('/search', {
                sn: ser,
                views: 'single',
                createJob: createJob
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

    const checkSn = async (SN = sn) => {
        try {
            const {data, status} = await axios.get(`/jobs/check/${SN}`);
            console.log(data, status)
            return {
                message: data.message,
                status: status
            }
        } catch (error) {
            console.error(error.response.data.message)
            return {
                message: error.response.data.message,
                status: error.response.status ?? 500
            }
        }
    }

    const fetchDataBySku = async () => {
        await AlertWithFormDialog({
            icon: 'question',
            title: 'คุณได้กรอกซีเรียลเลข 9999',
            text: 'โปรดระบุรหัสสินค้าที่ต้องการแจ้งซ่อม',
            res: async (confirm, value) => {
                confirm && await searchDetailSku(value)
            }
        });
    };

    const searchDetailSku = async (sku) => {
        try {
            setProcessing(true)
            const {data, status} = await axios.post(route('search.sku'), {sku});
            console.log('search Detail Sku ==> ',data, status);
            setSn(data.serial_id);
            const response = await checkSn(data.serial_id);
            if (response.status === 200) {
                if (data.message === 'ไม่พบประวัติการซ่อมจากระบบ') {
                    alert(data.message)
                    await fetchData(data.serial_id, true);
                } else {
                    await fetchData(data.serial_id, false);
                }
            } else if (response.status === 400) {
                console.log('error >> ', response)
                const showConfirmButton = !(response.message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' || response.message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin');
                AlertDialogQuestionForSearch({
                    title: response.message,
                    cancelButtonText: response.message === 'ไม่พบประวัติการซ่อมจากระบบ' || response.message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' ? 'ปิด' : response.message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin' ? 'ปิด' : 'ดูแค่ประวัติการซ่อม',
                    text: 'เลือกเมนูดังต่อไปนี้',
                    showConfirmButton,
                    message: response.message,
                    onPassed: async (confirm) => {
                        if (confirm) {
                            const result = str.slice(0, 4);
                            console.log(result);
                            if (result === '9999') {
                            } else {
                                await fetchData(sn, true);
                            }
                        } else {
                            if (response.message === 'ไม่พบประวัติการซ่อมจากระบบ') return;
                            if (response.message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น') return;
                            if (response.message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin') return;
                            await fetchData(sn, false)
                        }
                    }
                })
            } else {
                AlertDialog({
                    title: 'เกิดข้อผิดพลาด',
                    text: message,
                })
            }
            setProcessing(false);
        } catch (error) {
            console.log(error.response.data, error.response.status);
        }
    }


    const searchDetail = async (e) => {
        e.preventDefault();

        console.log('ค้นหารหัส 🔍 sn === 9999', sn)
        if (sn === '9999') {
            await fetchDataBySku()
        } else {
            await searchDetailAfter();
        }
    }

    const searchDetailAfter = async () => {
        const {message, status} = await checkSn();
        console.log(message, status);
        if (status === 200) {
            if (message === 'ไม่พบประวัติการซ่อมจากระบบ') {
                await fetchData(sn, true);
            } else {
                await fetchData(sn, false);
            }
            // await fetchData(sn, false);
        } else if (status === 400) {
            const showConfirmButton = !(message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' || message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin');
            AlertDialogQuestionForSearch({
                title: message,
                cancelButtonText: message === 'ไม่พบประวัติการซ่อมจากระบบ' || message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น' ? 'ปิด' : message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin' ? 'ปิด' : 'ดูแค่ประวัติการซ่อม',
                text: 'เลือกเมนูดังต่อไปนี้',
                showConfirmButton,
                message,
                onPassed: async (confirm) => {
                    if (confirm) {
                        await fetchData(sn, true);
                    } else {
                        if (message === 'ไม่พบประวัติการซ่อมจากระบบ') return;
                        if (message === 'serial_id กำลังถูกซ่อมจากศูนย์บริการอื่น') return;
                        if (message === 'serial_id กำลังส่งซ่อมไปยัง ศูนย์ซ่อม Pumpkin') return;
                        await fetchData(sn, false)
                    }
                }
            })
        } else {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: message,
            })
        }
        setProcessing(false);
    }

    const ButtonLink = ({icon, title, color, menu}) => (
        <Button disabled={showContent === menu} onClick={() => setShowContent(menu)} component='a' variant='contained'
                color={color} sx={{width: {xs: '100%', md: 150}}}>
            <Stack direction='column' justifyContent='center' alignItems='center'>
                {icon}
                {title}
            </Stack>
        </Button>
    )

    const ButtonList = () => {
        return (
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} justifyContent='start' alignItems='center'>
                <ButtonLink menu={1} icon={<Edit/>} title={'แจ้งซ่อม'} data={detail}
                            color='primary'/>
                <ButtonLink menu={2} icon={<ManageHistory/>} title={'ดูประวัติการซ่อม'}
                            data={detail} color='secondary'/>
                <ButtonLink menu={3} icon={<MenuBook/>} title={'คู่มือ'}
                            data={detail} color='pumpkinColor'/>
                <ButtonLink menu={4} icon={<YouTube/>} title={'วิดีโอที่เกี่ยวข้อง'}
                            data={detail} color='error'/>
            </Stack>
        )
    }


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
                                        <TextField id={'search'} sx={{backgroundColor: 'white'}}
                                                   placeholder='ค้นหาหมายเลขซีเรียล'
                                                   fullWidth autoComplete='off'
                                                   defaultValue={sn || ''}
                                                   onChange={(e) => setSn(e.target.value)}/>
                                        <Button sx={{minWidth: 100}} disabled={processing || !sn} type='submit'
                                                size='small' variant='contained'
                                                startIcon={<Search/>}>
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

                                {detail && showContent === 3 &&
                                    (
                                        <div>
                                            กำลังพัฒนา
                                        </div>
                                    )
                                }

                                {detail && showContent === 4 &&
                                    (
                                        <Stack direction={{sm: 'row', xs: 'column'}} spacing={2}>
                                            <iframe width='100%' height="315"
                                                    src="https://www.youtube.com/embed/uZVqdkxYu9k?si=4rtZDIPeF8vznlhS"
                                                    title="YouTube video player"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    allowFullScreen>
                                            </iframe>
                                        </Stack>
                                    )
                                }
                            </>
                        ) : <Progress/>}
                    </Stack>
                </div>
            </Container>
        </AuthenticatedLayout>
    );
}
