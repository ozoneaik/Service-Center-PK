import {Card, CardContent, Divider, Stack, Typography} from "@mui/material";

export const CardComponent = (props) => {
    const {children, headTitle = '',sx} = props;
    return (
        <Card variant='outlined' sx={sx}>
            <CardContent>
                <Stack direction='column' spacing={1}>
                    <Typography variant='h6' fontWeight='bold'>{headTitle}</Typography>
                    <Divider/>
                    {children}
                </Stack>
            </CardContent>
        </Card>

    )
}
