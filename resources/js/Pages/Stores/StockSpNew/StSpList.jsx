import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Grid2, Paper, Typography} from "@mui/material";
import StSpListFilter from "@/Pages/Stores/StockSpNew/StSpListFilter.jsx";

export default function StSpList({stocks, store}) {
    return (
        <AuthenticatedLayout>
            <Head title='จัดการสต็อกอะไหล่'/>
            <Paper variant='outlined' sx={{bgcolor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <StSpListFilter/>
                    </Grid2>
                    <Grid2 size={12}>
                        <Typography fontSize={20} fontWeight='bold'>จัดการสต็อกอะไหล่</Typography>
                    </Grid2>
                </Grid2>
            </Paper>
        </AuthenticatedLayout>
    )
}
