import { Button, Grid2, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { SummaryForm } from "./SummaryForm";
import { UploadFile } from "./UploadFile";
import { AddBehavior } from "./AddBehavior";
import ChecklistIcon from '@mui/icons-material/Checklist';
import ViewListIcon from '@mui/icons-material/ViewList';
import WarningIcon from '@mui/icons-material/Warning';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BuildIcon from '@mui/icons-material/Build';
import { Customer } from "@/Pages/ReportRepair/Customer.jsx";
import { useProductTarget } from "@/Context/ProductContext.jsx";
import { WarningApprove } from "@/Pages/ReportRepair/WarningApprove.jsx";
import Symptoms from "@/Pages/ReportRepair/Symptoms.jsx";
import SpMain from "@/Pages/ReportRepair/SpNew/SpMain.jsx";

export default function FormRepair({ detail, setDetail }) {
    const [showDetail, setShowDetail] = useState(1);
    const [headTitle, setHeadTitle] = useState('สรุปการทำงาน');
    const [approve, setApprove] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { setProductTarget } = useProductTarget()


    useEffect(() => {
        // เช็คว่า detail นี้ อยู่ใน ประกัน แล้วมีราคาอะไหร่เป็น 0 ด้วย
        const findPriceMultipleGpZero = detail.selected.sp.filter(item => parseFloat(item.price_multiple_gp) === 0);
        // const trueOrFalsePriceZero = !!(detail.job.warranty && (findPriceMultipleGpZero.length > 0))
        const trueOrFalsePriceZero = !!((findPriceMultipleGpZero.length > 0))
        // เช็คว่า detail นี้ อยู่ในประกันหรือไม่ แล้วมีการเลือกอะไหล่ที่อยู่ในประกัน แต่ไม่ได้อัปโหลดภาพอะไหล่ที่เสียส่งเคลม
        const findSpWarranty = detail.selected.sp.filter(item => item.warranty === true);
        const findUploadImage = detail.selected.fileUpload.find(item => item.id === 3);
        const findListUploadImage = findUploadImage.list;
        console.log(findUploadImage, findUploadImage.list, findListUploadImage)
        // const trueOrFalseUploadFile = !!(detail.job.warranty && (findSpWarranty.length > 0) && (findListUploadImage.length === 0))
        const trueOrFalseUploadFile = !!((findSpWarranty.length > 0) && (findListUploadImage.length === 0))
        console.log(`trueOrFalseUploadFile >> ${trueOrFalseUploadFile} ` + `trueOrFalsePriceZero >> ${trueOrFalsePriceZero}`)
        setApprove(trueOrFalseUploadFile || trueOrFalsePriceZero);
        setProductTarget(trueOrFalseUploadFile || trueOrFalsePriceZero)
    }, [detail])


    const handelChangeMenu = ({ action }) => {
        setShowDetail(action);
        if (action === 1) setHeadTitle('สรุปการทำงาน');
        else if (action === 2) setHeadTitle('รูปภาพ');
        else if (action === 3) setHeadTitle('อาการ/สาเหตุ');
        else if (action === 4) setHeadTitle('อะไหล่');
        else if (action === 5) setHeadTitle('ข้อมูลลูกค้า')
        else if (action === 7) setHeadTitle('แจ้งเตือน')
        else if (action === 8) setHeadTitle('อาการเบื้องต้น')
        else setHeadTitle('หมายเหตุ');
    }

    const ButtonStyle = ({ title, action, icon }) => (
        // <Grid2 size={{md : 12}} sx={{width : '100%'}}>
        <Grid2 size={{lg: 12, md: 6, sm: 4, xs: 3}} sx={{width : '100%'}}>
            <Button
            sx={{ height: { lg: 80 },width : '100%' }} // width: { xs: 80, md: '100%' }
            onClick={() => handelChangeMenu({ action })}
            variant={action === showDetail ? 'contained' : 'outlined'}
            color={action === 7 ? 'warning' : 'primary'}
        >
            <Stack direction='column' spacing={2} alignItems='center'>
                {icon}{title}
            </Stack>
        </Button>
        </Grid2>

    )

    const HeadTitle = ({ title }) => (
        <Stack direction='row' spacing={2} alignItems='center' mb={2}>
            <Typography variant='h5' fontWeight='bold' sx={{ textDecoration: 'underline' }}>
                <ChecklistIcon />&nbsp;{title}
            </Typography>
        </Stack>
    )

    return (
        <Grid2 container spacing={2}>
            {/* <Grid2 size={{ xs: 12, lg: 2 }}> */}
            <Grid2 size={{ xs : 12, lg: 2 }}>
                {/* <Stack direction={{ xs: 'row', lg: 'column' }} spacing={2}> */}
                    <Grid2 container spacing={2}>
                        <ButtonStyle action={1} title={'สรุปการทำงาน'} icon={<ViewListIcon />} />
                        <ButtonStyle action={5} title={'ข้อมูลลูกค้า'} icon={<AccountCircleIcon />} />
                        <ButtonStyle action={8} title={'อาการเบื้องต้น'} icon={<ViewListIcon />} />
                        <ButtonStyle action={2} title={'รูปภาพ'} icon={<CameraAltIcon />} />
                        <ButtonStyle action={3} title={'อาการ/สาเหตุ'} icon={<PsychologyIcon />} />
                        <ButtonStyle action={4} title={'อะไหล่'} icon={<BuildIcon />} />
                        {/*<ButtonStyle action={6} title={'หมายเหตุ'} icon={<MoreHorizIcon/>}/>*/}
                        {approve && <ButtonStyle action={7} title={'แจ้งเตือน'} icon={<WarningIcon />} />}
                    </Grid2>
                {/* </Stack> */}
            </Grid2>
            <Grid2 size={{ xs: 12, lg: 10 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <HeadTitle title={headTitle} />
                    </Grid2>
                    <Grid2 size={12}>
                        {showDetail === 1 && <SummaryForm setShowDetail={setShowDetail} detail={detail} setDetail={setDetail} />}
                        {showDetail === 2 && <UploadFile setShowDetail={setShowDetail} detail={detail} setDetail={setDetail} />}
                        {showDetail === 3 && <AddBehavior setShowDetail={setShowDetail} detail={detail} setDetail={setDetail} />}
                        {/*{showDetail === 4 && <AddSp setShowDetail={setShowDetail} detail={detail} setDetail={setDetail}/>}*/}
                        {showDetail === 4 && <SpMain setShowDetail={setShowDetail} detail={detail} setDetail={setDetail} />}
                        {showDetail === 5 && <Customer setShowDetail={setShowDetail} detail={detail} setDetail={setDetail} />}
                        {/*{showDetail === 6 && <AddMore setShowDetail={setShowDetail} detail={detail} setDetail={setDetail}/>}*/}
                        {showDetail === 7 && <WarningApprove setShowDetail={setShowDetail} detail={detail} setDetail={setDetail} />}
                        {showDetail === 8 && <Symptoms setShowDetail={setShowDetail} detail={detail} setDetail={setDetail} />}
                    </Grid2>
                </Grid2>
            </Grid2>
        </Grid2>
    )
}
