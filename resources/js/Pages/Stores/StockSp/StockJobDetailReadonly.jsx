import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Add, Remove } from "@mui/icons-material";
import { Button, Chip, Container, Grid2, Stack, Typography } from "@mui/material";

export default function StockJobDetailReadonly({ job_detail, job }) {
    console.log(job_detail, job);

    return (
        <AuthenticatedLayout>
            <Head title="รายละเอียดจ็อบ" />
            <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography fontSize={20} fontWeight='bold'>
                                รายละเอียดจ็อบ #{job.stock_job_id}
                            </Typography>
                            <Chip
                                label={`ประเภท ขา${job.type}`} color={job.type === 'เพิ่ม' ? 'primary' : 'error'}
                                icon={job.type === 'เพิ่ม' ? <Add /> : <Remove />}
                            />
                        </Stack>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}