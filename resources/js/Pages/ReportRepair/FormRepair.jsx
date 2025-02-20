import {Button, Grid2, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {SummaryForm} from "./SummaryForm";
import {UploadFile} from "./UploadFile";
import {AddBehavior} from "./AddBehavior";
import {AddSp} from "./Sp/AddSp.jsx";
import {AddMore} from "./AddMore";
import ChecklistIcon from '@mui/icons-material/Checklist';
import ViewListIcon from '@mui/icons-material/ViewList';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BuildIcon from '@mui/icons-material/Build';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {Customer} from "@/Pages/ReportRepair/Customer.jsx";

export default function FormRepair({detail, setDetail, check, setCheck}) {
    const [showDetail, setShowDetail] = useState(1);
    const [headTitle , setHeadTitle] = useState('สรุปการทำงาน');
    const [approve, setApprove] = useState(false);
    const [first, setFirst] = useState(true);


    useEffect(()=> {
        if (!first){
            // เช็คว่า detail นี้ อยู่ใน ประกันแล้วมีการเลือกอะไหล่ที่อยู่ในประกัน แล้วมีราคาอะไหร่เป็น 0 ด้วย
            setApprove(true)
        }
        setFirst(false)
    },[detail])



    const handelChangeMenu = ({action}) => {
        setShowDetail(action);
        if (action === 1) setHeadTitle('สรุปการทำงาน');
        else if(action === 2) setHeadTitle('รูปภาพ');
        else if(action === 3) setHeadTitle('อาการ/สาเหตุ');
        else if(action === 4) setHeadTitle('อะไหล่');
        else if(action === 5) setHeadTitle('ข้อมูลลูกค้า')
        else setHeadTitle('เพิ่มเติม');
    }

    const ButtonStyle = ({title, action, icon}) => (
        <Button sx={{height: {lg: 80},width : {sm : 80,md : '100%'}}} onClick={()=>handelChangeMenu({action})}
                variant={action === showDetail ? 'contained' : 'outlined'}>
            <Stack direction='column' spacing={2} alignItems='center'>
                {icon}
                {title}
            </Stack>
        </Button>
    )

    const HeadTitle = ({title}) => (
        <>
            <Stack direction='row' spacing={2} alignItems='center' mb={2}>
                <Typography variant='h5' fontWeight='bold' sx={{textDecoration: 'underline'}}>
                    <ChecklistIcon/>&nbsp;{title}
                </Typography>
            </Stack>
        </>
    )

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={{xs: 12, lg: 2}}>
                <Stack direction={{xs: 'row', lg: 'column'}} spacing={2}>
                    <ButtonStyle action={1} title={'สรุปการทำงาน'} icon={<ViewListIcon/>}/>
                    <ButtonStyle action={5} title={'ข้อมูลลูกค้า'} icon={<AccountCircleIcon/>}/>
                    <ButtonStyle action={2} title={'รูปภาพ'} icon={<CameraAltIcon/>}/>
                    <ButtonStyle action={3} title={'อาการ/สาเหตุ'} icon={<PsychologyIcon/>}/>
                    <ButtonStyle action={4} title={'อะไหล่'} icon={<BuildIcon/>}/>
                    <ButtonStyle action={6} title={'เพิ่มเติม'} icon={<MoreHorizIcon/>}/>
                    {approve && <ButtonStyle action={7} title={'พิเคษ'} icon={<MoreHorizIcon/>}/>}
                </Stack>
            </Grid2>
            <Grid2 size={{xs: 12, lg: 10}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <HeadTitle title={headTitle}/>
                    </Grid2>
                    <Grid2 size={12}>
                        {showDetail === 1 && <SummaryForm detail={detail} setDetail={setDetail}/>}
                        {showDetail === 2 && <UploadFile detail={detail} setDetail={setDetail}/>}
                        {showDetail === 3 && <AddBehavior detail={detail} setDetail={setDetail}/>}
                        {showDetail === 4 && <AddSp detail={detail} setDetail={setDetail}/>}
                        {showDetail === 5 && <Customer detail={detail} setDetail={setDetail}/>}
                        {showDetail === 6 && <AddMore detail={detail} setDetail={setDetail}/>}
                    </Grid2>
                </Grid2>
            </Grid2>
        </Grid2>
    )
}
