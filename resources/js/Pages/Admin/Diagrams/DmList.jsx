import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Grid2 } from "@mui/material";
import { Container } from "postcss";

export default function DmList({dm_list}){
    console.log('dm_list >> ', dm_list);
    return (
        <AuthenticatedLayout>
            <Head title="รายการไดอะแกรม"/>
            <Container maxWidth='false' sx={{bgColor : 'white' , p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>

                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}