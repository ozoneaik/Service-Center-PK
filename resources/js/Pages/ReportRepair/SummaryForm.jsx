import {Button, Stack} from "@mui/material"
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {useState} from "react";

export const SummaryForm = ({check, setCheck}) => {

    return (
        <Stack direction='column'>
            {check}
            <FormGroup>
                <FormControlLabel control={<Checkbox checked  />} label="รูปภาพ" />
                <FormControlLabel control={<Checkbox checked  />} label="อาการ / สาเหตุ" />
                <FormControlLabel control={<Checkbox checked  />} label="บันทึกอะไหล่" />
            </FormGroup>
            <Stack direction='row' spacing={2} justifyContent='end'>
                <Button variant='contained' color='error' onClick={()=>setCheck('after')}>ยกเลิกงานซ่อม</Button>
                <Button variant='contained' color='success'>ปิดงานซ่อม</Button>
            </Stack>
        </Stack>
    )
}
