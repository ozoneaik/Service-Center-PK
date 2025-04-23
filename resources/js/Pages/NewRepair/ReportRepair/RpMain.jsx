import {useEffect, useState} from "react";
import {Button, CircularProgress, Grid2, Stack} from "@mui/material";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {ViewList} from '@mui/icons-material';


function ContentForm({detail}) {
    const [action, setAction] = useState(1);
    const [showDetail, setShowDetail] = useState(1);

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
            <Grid2 size={{lg: 12, md: 3}} sx={{width: '100%'}}>
                <Button
                    onClick={() => handelChangeMenu(value)}
                    sx={{height: {lg: 80}, width: '100%'}} color='primary'
                    variant={action === 1 ? 'contained' : 'outlined'}
                >
                    <Stack direction='column' spacing={2} alignItems='center'>
                        {icon}
                        {title}
                        {action} {showDetail}
                    </Stack>
                </Button>
            </Grid2>
        )
    }
    console.log(detail)
    return (
        <Grid2 size={12}>
            <Grid2 container spacing={2}>
                <Grid2 size={{xs: 12, lg: 2}}>
                    <Grid2 container spacing={2}>
                        <ButtonStyle {...{action}} value={1} title={'สรุปการทำงาน'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={2} title={'ข้อมูลลูกค้า'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={3} title={'อาการเบื้องต้น'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={4} title={'รูปภาพ'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={5} title={'อาการ/สาเหตุ'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={7} title={'อะไหล่'} icon={<ViewList/>}/>
                        <ButtonStyle {...{action}} value={8} title={'แจ้งเตือน'} icon={<ViewList/>}/>
                    </Grid2>
                </Grid2>
                <Grid2 size={9}>
                    Content
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
        foundJob().then();
    }, [])

    const foundJob = async () => {
        try {
            const {data, status} = await axios.post(route('repair.found', {serial_id}))
            console.log(data, status);
            setDetail(data.data);
            alert(`status = ${status} found`)
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
        } finally {
            setLoading(false)
        }
    }
    return (
        <Grid2 container spacing={2}>
            {loading ? <CircularProgress/> : detail ? <ContentForm {...{detail}}/> : <>เกิดข้อผิดพลาด</>}
        </Grid2>
    )
}
