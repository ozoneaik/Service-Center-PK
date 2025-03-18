import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function StockSpByShop({ shops }) {
    return (
        <AuthenticatedLayout>
            <Head title="รายการร้านทั้งหมด" />
            <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={{ md: 4, xs: 12 }}>
                        <TextField
                            fullWidth size="small" label='ค้นหา Serial ID'
                            type="text" name="serial_id" value={filters.serial_id}
                            // onChange={handleFilterChange}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">Sn</InputAdornment>
                                }
                            }}
                        />
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}