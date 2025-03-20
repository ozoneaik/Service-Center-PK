import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Breadcrumbs,
    Button, Card,
    Container,
    Grid2,
    Stack,
    Typography
} from "@mui/material";
import AlreadyClaim from "@/Pages/SpareClaim/AlreadyClaim.jsx";
import {Link} from "@inertiajs/react";

export default function ClaimMain({spareParts}) {
    console.log(spareParts);
    
    return (
        <AuthenticatedLayout>
            <Container maxWidth='false'>
                <Grid2 container spacing={2} mt={3}>
                    <Grid2 size={12}>
                        <Breadcrumbs>
                            <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                            <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                        </Breadcrumbs>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse' spacing={1} mb={2}>
                            <Button
                                component={Link} href={'/spare-claim/index'}
                                variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}>
                                แจ้งเคลมอะไหล่
                            </Button>
                            <Button
                                color='warning'
                                component={Link} href={'/spare-claim/history'}
                                variant={route().current() === 'spareClaim.historyShow' ? 'contained' : 'outlined'}>
                                ประวัติเคลม
                            </Button>
                            <Button
                                color='secondary'
                                component={Link} href={'/spare-claim/pending'}
                                variant={route().current() === 'spareClaim.pending' ? 'contained' : 'outlined'}>
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
