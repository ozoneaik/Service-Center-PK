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

export default function ClaimPending() {
    return (
        <AuthenticatedLayout>
            <Container>
                <Grid2 container spacing={2} mt={3}>
                    <Grid2 size={12}>
                        <Breadcrumbs>
                            <Typography sx={{color: 'text.primary'}}>Home</Typography>
                            <Typography sx={{color: 'text.primary'}}>เคลมอะไหล่</Typography>
                        </Breadcrumbs>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse' spacing={2} mb={2}>
                            <Button
                                component={Link} href={'/spare-claim/index'}
                                variant='contained'>
                                สร้างเอกสารเคลม
                            </Button>
                            <Button
                                component={Link} href={'/spare-claim/history'}
                                variant='contained'>
                                ประวัติเคลม
                            </Button>
                        </Stack>
                        <Card>
                            <AlreadyClaim/>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
