import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link} from "@inertiajs/react";
import React from "react";
import {Button, Container, Grid2, Stack, useMediaQuery} from "@mui/material";
import {Article, History} from "@mui/icons-material";

export default function LayoutClaim({children, headTitle = ''}) {
    const isMobile = useMediaQuery('(max-width:700px)');
    return (
        <AuthenticatedLayout>
            <Head title={headTitle}/>
            <Container maxWidth='false' sx={{bgcolor: 'white', p: 2}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={1} mb={2}>
                            <Button
                                fullWidth={isMobile} startIcon={<Article/>}
                                component={Link} href={'/spare-claim/index'}
                                variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}
                            >
                                แจ้งเคลมอะไหล่
                            </Button>
                            <Button
                                color='warning' fullWidth={isMobile} startIcon={<History/>}
                                component={Link} href={'/spare-claim/history'}
                                variant={route().current() === 'spareClaim.history' ? 'contained' : 'outlined'}
                            >
                                ประวัติเคลม
                            </Button>
                            {/*<Button*/}
                            {/*    color='secondary' fullWidth={isMobile}*/}
                            {/*    component={Link} href={'/spare-claim/pending'}*/}
                            {/*    variant={route().current() === 'spareClaim.pending' ? 'contained' : 'outlined'}*/}
                            {/*>*/}
                            {/*    ค้างเคลมอะไหล่*/}
                            {/*</Button>*/}
                        </Stack>
                    </Grid2>
                </Grid2>
                {children}
            </Container>
        </AuthenticatedLayout>
    )
}
