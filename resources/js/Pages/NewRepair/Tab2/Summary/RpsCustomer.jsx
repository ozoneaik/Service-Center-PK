import {Avatar, Stack, Typography} from "@mui/material";

const LabelComponent = ({label, value}) => (
    <Stack direction='row' spacing={1}>
        <Typography fontWeight='bold'>{label}</Typography>
        <Typography fontWeight='bold'>{':'}</Typography>
        <Typography>{value}</Typography>
    </Stack>
)

export default function RpsCustomer({customer}) {
    return (
        <Stack direction='row' spacing={3} alignItems='center'>
            <Avatar/>
            <Stack direction='column' spacing={2}>
                <LabelComponent label='ชื่อ' value={customer?.name}/>
                <LabelComponent label='เบอร์โทรศัพท์' value={customer?.phone}/>
            </Stack>
        </Stack>
    )
}
