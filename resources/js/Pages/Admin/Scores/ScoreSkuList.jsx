import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Box, Grid2, Paper, Stack, Typography} from "@mui/material";


function ScoreSkuList() {
    return (
        <AuthenticatedLayout>
            <Head title='จัดการ master คะแนน'/>
            <Paper sx={{backgroundColor : 'white',p : 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography variant='h6'>จัดการ master คะแนน</Typography>
                            <Typography variant='body1'>รายการทั้งหมด </Typography>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Box sx={{overflow : 'auto'}}>

                        </Box>
                    </Grid2>
                </Grid2>
            </Paper>
        </AuthenticatedLayout>
);
}

export default ScoreSkuList;
