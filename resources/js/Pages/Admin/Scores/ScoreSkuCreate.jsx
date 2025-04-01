import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Grid2, Paper} from "@mui/material";


function ScoreSkuCreate() {
    return (
        <AuthenticatedLayout>
            <Head title='จัดการ master คะแนน'/>
            <Paper sx={{backgroundColor : 'white',p : 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        ScoreSkuCreate
                    </Grid2>
                </Grid2>
            </Paper>
        </AuthenticatedLayout>
    );
}

export default ScoreSkuCreate;
