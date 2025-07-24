import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Container, Grid2} from "@mui/material";
import {BarChart} from "@mui/x-charts";

export default function SoiMain(){
    return (
        <AuthenticatedLayout>
            <Head title='รายสรุปยอดรายรับ ศูนย์ซ่อม'/>
            <Container maxWidth='false' sx={{bgcolor: 'white', p: 2}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <BarChart
                            xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
                            series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                            height={300}
                        />
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
