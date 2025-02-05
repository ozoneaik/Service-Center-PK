import {Box, Button, Card, Divider, Grid2, Stack, Typography} from "@mui/material";
import {useState} from "react";
import {SummaryForm} from "./SummaryForm";
import {UploadFile} from "./UploadFile";
import {AddBehavior} from "./AddBehavior";
import {AddSp} from "./AddSp";
import {AddMore} from "./AddMore";
import ChecklistIcon from '@mui/icons-material/Checklist';
import ViewListIcon from '@mui/icons-material/ViewList';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export default function FormRepair({detail, setDetail,check, setCheck}) {
    const [showDetail, setShowDetail] = useState();
    const ButtonStyle = ({title, action,icon}) => (
        <Button sx={{height : {lg: 80}}} onClick={() => setShowDetail(action)}
                variant={action === showDetail ? 'contained' : 'outlined'}>
            <Stack direction='column' spacing={2} alignItems='center'>
                {icon}
                {title}
            </Stack>
        </Button>
    )

    const HeadTitle = ({title, icon}) => (
        <>
            <Stack direction='row' spacing={2} alignItems='center' mb={2} >
                <Typography variant='h5' fontWeight='bold' sx={{textDecoration : 'underline'}}>
                    <ChecklistIcon/>&nbsp;{title}
                </Typography>
            </Stack>
        </>
    )

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={{xs : 12, lg : 2}}>
                <Stack direction={{xs : 'row' , lg : 'column'}} spacing={2}>
                    <ButtonStyle action={1} title={'สรุปการทำงาน'} icon={<ViewListIcon/>}/>
                    <ButtonStyle action={2} title={'รูปภาพ'} icon={<CameraAltIcon/>}/>
                    <ButtonStyle action={3} title={'อาการ/สาเหตุ'} icon={<PsychologyIcon/>}/>
                    <ButtonStyle action={4} title={'อะไหล่'} icon={<BuildIcon/>}/>
                    <ButtonStyle action={5} title={'เพิ่มเติม'} icon={<MoreHorizIcon/>}/>
                </Stack>
            </Grid2>
            <Grid2 size={10}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        {showDetail === 1 && <HeadTitle title={'สรุปการทำงาน'} />}
                        {showDetail === 2 && <HeadTitle title={'รูปภาพ'}/>}
                        {showDetail === 3 && <HeadTitle title={'อาการ/สาเหตุ'}/>}
                        {showDetail === 4 && <HeadTitle title={'อะไหล่'}/>}
                        {showDetail === 5 && <HeadTitle title={'เพิ่มเติม'}/>}
                    </Grid2>
                    <Grid2 size={12}>
                        {showDetail === 1 && <SummaryForm check={check} setCheck={setCheck}/>}
                        {showDetail === 2 && <UploadFile detail={detail} setDetail={setDetail}/>}
                        {showDetail === 3 && <AddBehavior detail={detail} setDetail={setDetail}/>}
                        {showDetail === 4 && <AddSp detail={detail}/>}
                        {showDetail === 5 && <AddMore detail={detail} setDetail={setDetail}/>}
                    </Grid2>
                </Grid2>

            </Grid2>
        </Grid2>
    )
}
