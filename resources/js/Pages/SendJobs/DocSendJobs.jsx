import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import { Grid2 } from "@mui/material";

export default function DocSendJobs({ groups }) {
    return (
        <AuthenticatedLayout>
            <Head title={'ทำใบ'} />
            <Paper sx={{ bgcolor: 'white', p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant='h6'>ส่งซ่อมไปยัง PK</Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        
                    </Grid2>
                </Grid2>
            </Paper>

        </AuthenticatedLayout>
    )
}
