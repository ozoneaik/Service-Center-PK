import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Button, Container, Grid2, Stack, Typography, useMediaQuery } from "@mui/material";
import RpmFilter from "./RpmFilter";
import { Add } from "@mui/icons-material";
import RpmListDesktopView from "./RpmListDesktopView";
import RpmListMobileView from "./RpmListMobileView";
import { AlertDialogQuestion } from "@/Components/AlertDialog";

export default function RpmList({ repair_mans, is_code_cust_id }) {
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleSoftDelete = (repair_man) => {
        AlertDialogQuestion({
            text: `คุณต้องการลบช่างซ่อม ${repair_man.technician_name} หรือไม่?`,
            onPassed: async (confirm) => {
                if (!confirm) return;
                router.delete(route('repairMan.delete', { id: repair_man.id }));
            }
        })
    }

    const handleOnUpdate = (id) => {
        router.get(route('repairMan.edit', { id }))
    }
    return (
        <AuthenticatedLayout>
            <Head title="รายการช่างซ่อม" />
            <Container maxWidth='false' sx={{ p: 3, bgcolor: 'white' }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <RpmFilter />
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography fontSize={20} fontWeight='bold'>
                                รายการช่างซ่อม
                            </Typography>
                            <Button
                                startIcon={<Add />} variant="contained"
                                onClick={() => router.get(route('repairMan.create', { is_code_cust_id }))}
                            >
                                สร้างช่างซ่อม
                            </Button>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        {isMobile ?
                            <RpmListMobileView
                                repair_mans={repair_mans}
                                onSoftDelete={(repair_man) => handleSoftDelete(repair_man)}
                                handleOnUpdate={(id) => handleOnUpdate(id)}
                            />
                            :
                            <RpmListDesktopView
                                repair_mans={repair_mans}
                                onSoftDelete={(repair_man) => handleSoftDelete(repair_man)}
                                handleOnUpdate={(id) => handleOnUpdate(id)}
                            />
                        }
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}