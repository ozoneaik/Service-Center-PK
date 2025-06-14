import {Checkbox, FormControlLabel, Stack, Typography} from "@mui/material";

export default function RpsRemarkCustomer({customer}) {
    return (
        <Stack direction='column' spacing={1}>
            <FormControlLabel disabled control={<Checkbox checked={customer?.subremark1}/>} label={'เสนอราคาก่อนซ่อม'}/>
            <FormControlLabel disabled control={<Checkbox checked={customer?.subremark2}/>} label={'ซ่อมเสร็จส่งกลับทางไปรษณีย์'}/>
            <FormControlLabel disabled control={<Checkbox checked={customer?.subremark3}/>} label={'อื่นๆ'}/>
            {customer?.subremark3 && <Typography>{'-'}&nbsp;{customer?.remark}</Typography>}
        </Stack>
    )
}
