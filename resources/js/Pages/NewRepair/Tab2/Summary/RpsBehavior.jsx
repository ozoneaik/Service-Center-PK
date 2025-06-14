import {Stack, Typography} from "@mui/material";

export default function RpsBehavior({behaviours}) {
    return (
        <Stack direction='row' spacing={1}>
            {behaviours?.map((behaviour, index) => (
                <Typography key={index}>
                    {behaviour.cause_name}&nbsp;{'/'}
                </Typography>
            ))}
        </Stack>
    )
}
