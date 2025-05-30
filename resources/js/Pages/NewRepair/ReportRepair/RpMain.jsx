import {useEffect, useState} from "react";
import {Box, Button, CircularProgress, Grid2, Stack, Typography} from "@mui/material";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {AccountCircle, Build, Camera, Psychology, ViewList, Warning} from '@mui/icons-material';
import RpSummary from "@/Pages/NewRepair/ReportRepair/RpSummary.jsx";
import RpCustomer from "@/Pages/NewRepair/ReportRepair/RpCustomer.jsx";
import RpUploadFile from "@/Pages/NewRepair/ReportRepair/RpUploadFile.jsx";
import RpSymptomsRemark from "@/Pages/NewRepair/ReportRepair/RpSymptomsRemark.jsx";


function ContentForm({detail}) {
    const [action, setAction] = useState(1);
    const [showDetail, setShowDetail] = useState(1);
    const job_id =  detail.job_detail.job_id;

    const handelChangeMenu = (value) => {
        if (value === 1) {
            setAction(1);
            setShowDetail(1);
        } else if (value === 2) {
            setAction(2);
            setShowDetail(2);
        } else if (value === 3) {
            setAction(3);
            setShowDetail(3);
        } else if (value === 4) {
            setAction(4);
            setShowDetail(4);
        } else if (value === 5) {
            setAction(5);
            setShowDetail(5);
        } else if (value === 7) {
            setAction(7);
            setShowDetail(7);
        } else if (value === 8) {
            setAction(8);
            setShowDetail(8);
        }
    }
    const ButtonStyle = ({title, icon, value}) => {
        return (
            <Grid2 size={{md: 12, sm: 4, xs: 6}}>
                <Button
                    onClick={() => handelChangeMenu(value)}
                    sx={{height: {lg: 80}, width: '100%'}} color='primary'
                    variant={action === value ? 'contained' : 'outlined'}
                >
                    <Stack direction='column' spacing={2} alignItems='center'>
                        {icon}
                        {title}
                    </Stack>
                </Button>
            </Grid2>
        )
    }
    return (
        <Grid2 size={12}>
            <Grid2 container spacing={2}>
                <Grid2 size={{xs: 12, md: 2}}>
                    <Grid2 container spacing={2}>
                        {/*<Grid2 size={12}>*/}
                        {/*<Stack direction='row' spacing={2} overflow='auto'>*/}
                        <ButtonStyle {...{action}} value={1} title={'สรุปการทำงาน'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={2} title={'ข้อมูลลูกค้า'} icon={<AccountCircle/>}/>
                        <ButtonStyle {...{action}} value={3} title={'อาการเบื้องต้น'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={4} title={'รูปภาพ/วิดีโอ'} icon={<Camera/>}/>
                        <ButtonStyle {...{action}} value={5} title={'อาการ/สาเหตุ'} icon={<Psychology/>}/>
                        <ButtonStyle {...{action}} value={7} title={'อะไหล่'} icon={<Build/>}/>
                        <ButtonStyle {...{action}} value={8} title={'แจ้งเตือน'} icon={<Warning/>}/>
                        {/*</Stack>*/}
                        {/*</Grid2>*/}
                    </Grid2>
                </Grid2>
                <Grid2 size={{md: 10, xs: 12}} my={2}>
                    <Stack direction='row' spacing={1} alignItems='center' mb={3}>
                        <Typography variant='h6' fontWeight='bold'>
                            {({
                                1: 'สรุปการทำงาน', 2: 'ข้อมูลลูกค้า', 3: 'อาการเบื้องต้น', 4: 'รูปภาพ/วิดีโอ',
                                5: 'อาการ/สาเหตุ', 6: 'อะไหล่', 7: 'แจ้งเตือน'
                            }[action] ?? 'no')}
                        </Typography>
                    </Stack>
                    {({
                        1: <RpSummary job_id={job_id}/>,
                        2: <RpCustomer job_id={job_id}/>,
                        3: <RpSymptomsRemark job_id={job_id}/>,
                        4: <RpUploadFile job_id={job_id}/>,
                        5: 'อาการ/สาเหตุ', 6: 'อะไหล่', 7: 'แจ้งเตือน'
                    }[action] ?? 'no')}
                </Grid2>
            </Grid2>
        </Grid2>
    )
}

export default function RpMain({serial_id}) {
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState();
    useEffect(() => {
        setLoading(true);
        foundJob().finally(() => setLoading(false));
    }, [])

    const foundJob = async () => {
        try {
            const {data, status} = await axios.post(route('repair.found', {serial_id}))
            console.log(data, status);
            setDetail(data.job);
            // alert(`status = ${status} found`)
        } catch (error) {
            console.log(error)
            const errorStatus = error.status
            const errorMessage = error.response.data.message
            AlertDialog({
                icon: errorStatus === 404 ? 'question' : 'error',
                title: errorStatus === 404 ? 'ยืนยันการแจ้งซ่อม' : 'เกิดข้อผิดพลาด',
                text: errorStatus === 404 ? 'กด ตกลง เพื่อยืนยันการแจ้งซ่อม' : errorMessage,
                onPassed: (confirm) => {
                    if (confirm && errorStatus === 404) {
                        alert('จะแจ้งซ่อม')
                    } else {
                        alert('เฉยๆ')
                    }
                }
            })
        }
    }
    return (
        <Grid2 container spacing={2}>
            {loading ? <CircularProgress/> : detail ? <ContentForm {...{detail}}/> : <>เกิดข้อผิดพลาด</>}
        </Grid2>
    )
}
