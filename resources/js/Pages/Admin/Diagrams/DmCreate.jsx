import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Grid2 } from "@mui/material";
import { Container } from "postcss";

export default function DmCreate({dm_data,create=false}) {
    return (
        <AuthenticatedLayout>
            <Head title="สร้างไดอะแกรม" />
            <Container maxWidth='false' sx={{ bgColor: 'white', p: 3 }}>
                <form onSubmit={(e => e.preventDefault())}>
                    <Grid2 container spacing={2}>
                        
                    </Grid2>
                </form>
            </Container>
        </AuthenticatedLayout>
    )
}