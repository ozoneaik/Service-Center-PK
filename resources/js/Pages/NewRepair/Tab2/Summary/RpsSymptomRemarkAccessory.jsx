import {Stack, Typography} from "@mui/material";

export default function RpsSymptomRemarkAccessory({symptom,remark,accessory}) {
    return (
        <Stack direction='column' spacing={2}>
            <Typography>{remark || 'ไม่ได้กรอก'}</Typography>
        </Stack>
    )
}
