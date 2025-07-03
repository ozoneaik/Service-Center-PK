import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Breadcrumbs,
    Button, Card,
    Container,
    Grid2, Paper,
    Stack,
    Typography, useMediaQuery
} from "@mui/material";
import AlreadyClaim from "@/Pages/SpareClaim/AlreadyClaim.jsx";
import {Link} from "@inertiajs/react";

export default function ClaimMain({spareParts}) {
    const isMobile = useMediaQuery('(max-width:700px)');
    return (
        <AuthenticatedLayout>
            <Container maxWidth='false'>
                    <Grid2 container spacing={2} mt={3} sx={{bgcolor : 'white', p : isMobile ? 0 : 2}}>
                        <Grid2 size={12}>
                            <Breadcrumbs>
                                <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                                <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                            </Breadcrumbs>
                        </Grid2>
                        <Grid2 size={12} >
                            <Stack direction='row' spacing={1} mb={2}>
                                <Button fullWidth={isMobile}
                                    component={Link} href={'/spare-claim/index'}
                                    variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}
                                >
                                    แจ้งเคลมอะไหล่
                                </Button>
                                <Button
                                    color='warning' fullWidth={isMobile}
                                    component={Link} href={'/spare-claim/history'}
                                    variant={route().current() === 'spareClaim.historyShow' ? 'contained' : 'outlined'}
                                >
                                    ประวัติเคลม
                                </Button>
                                <Button
                                    color='secondary' fullWidth={isMobile}
                                    component={Link} href={'/spare-claim/pending'}
                                    variant={route().current() === 'spareClaim.pending' ? 'contained' : 'outlined'}
                                >
                                    ค้างเคลมอะไหล่
                                </Button>
                            </Stack>
                            <Card>
                                <AlreadyClaim spareParts={spareParts}/>
                            </Card>
                        </Grid2>
                    </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
