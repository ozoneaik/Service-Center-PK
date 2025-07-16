import {Head} from "@inertiajs/react";
import {Box, Breadcrumbs, Container, Grid2, Typography} from "@mui/material";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import React from "react";

export default function LayoutSpsDms({children, title = '🗃️', ...props}) {
    return (
        <AuthenticatedLayout>
            <Head title={title}/>
            <Container maxWidth='false' sx={{bgcolor: 'white', p: 2}}>
                {children}
            </Container>
        </AuthenticatedLayout>
)
}
