import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, Link, usePage } from "@inertiajs/react";
import React from "react";
import { Button, Container, Grid2, Stack, useMediaQuery } from "@mui/material";
import { Article, History } from "@mui/icons-material";

export default function LayoutClaim({ children, headTitle = '' }) {
    const isMobile = useMediaQuery('(max-width:700px)');
    const { auth } = usePage().props;
    const isSale = auth.user?.role === 'sale' || auth.user?.is_sale;
    const isAcc = auth.user?.role === 'acc';
    const isAdmin = auth.user?.role === 'admin';
    return (
        <AuthenticatedLayout>
            <Head title={headTitle} />
            <Container maxWidth='false' sx={{ bgcolor: 'white', p: 2 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={1} mb={2}>
                            {/* ถ้าเป็นเซลล์ไม่ให้แสดงปุ่ม แจ้งเคลมอะไหล่ */}
                            {(!isSale && !isAcc) && (
                                <Button
                                    fullWidth={isMobile} startIcon={<Article />}
                                    component={Link} href={'/spare-claim/index'}
                                    variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}
                                >
                                    แจ้งเคลมอะไหล่
                                </Button>
                            )}
                            {(isAcc || isAdmin) && (
                                <Button
                                    fullWidth={isMobile} startIcon={<Article />}
                                    component={Link} href={'/accounting/spare-return'}
                                    variant={route().current() === 'accounting.return.index' ? 'contained' : 'outlined'}
                                >
                                    บัญชีรับคืนอะไหล่
                                </Button>
                            )}
                            {!isAcc && (
                                <Button
                                    color='warning' fullWidth={isMobile} startIcon={<History />}
                                    component={Link} href={'/spare-claim/history'}
                                    variant={route().current() === 'spareClaim.history' ? 'contained' : 'outlined'}
                                >
                                    ประวัติเคลม
                                </Button>
                            )}
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
