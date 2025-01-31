import {Box, Button, Card, Grid2, Stack} from "@mui/material";
import { useState } from "react";
import { SummaryForm } from "./SummaryForm";
import { UploadFile } from "./UploadFile";
import { AddBehavior } from "./AddBehavior";
import { AddSp } from "./AddSp";
import { AddMore } from "./AddMore";

export default function FormRepair({detail}) {
    const [showDetail, setShowDetail] = useState();
    const ButtonStyle = ({title,action}) => (
        <Button sx={{height : 80}} onClick={()=>setShowDetail(action)} variant={action === showDetail ? 'contained' : 'outlined'}>
            {title}
        </Button>
    )

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={2}>
                <Stack direction='column' spacing={2}>
                    <ButtonStyle action={1} title={'สรุปการทำงาน'}/>
                    <ButtonStyle action={2} title={'รูปภาพ'}/>
                    <ButtonStyle action={3} title={'อาการ/สาเหตุ'}/>
                    <ButtonStyle action={4} title={'อะไหล่'}/>
                    <ButtonStyle action={5} title={'เพิ่มเติม'}/>
                </Stack>
            </Grid2>
            <Grid2 size={10}>
                {showDetail === 1 && <SummaryForm/>}
                {showDetail === 2 && <UploadFile/>}
                {showDetail === 3 && <AddBehavior/>}
                {showDetail === 4 && <AddSp/>}
                {showDetail === 5 && <AddMore/>}
            </Grid2>
        </Grid2>
    )
}
