import { Autocomplete, Breadcrumbs, Grid2, Paper, TextField, Typography, Box } from "@mui/material";
import AlreadyClaim from "@/Pages/SpareClaim/AlreadyClaim.jsx";
import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";
import { router } from "@inertiajs/react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function ClaimMain({spareParts, shops, filters, isAdmin, isSale }) {

    const handleShopChange = (event, newValue) => {
        router.get(route('spareClaim.index'), {
            shop: newValue ? newValue.is_code_cust_id : ''
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <LayoutClaim isSale={isSale}>
            <Grid2 container spacing={3}>
                {/* 2. ส่วนตัวกรอง (แสดงเฉพาะ Admin) */}
                {isAdmin && (
                    <Grid2 size={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}
                        >
                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 'fit-content' }}>
                                🔍 กรองข้อมูลร้านค้า :
                            </Typography>
                            <Box sx={{ minWidth: '250px' }}>
                                <Autocomplete
                                    options={shops || []}
                                    getOptionLabel={(option) => `[${option.is_code_cust_id}] ${option.shop_name}`}
                                    value={shops?.find(s => s.is_code_cust_id === filters?.shop) || null}
                                    onChange={handleShopChange}
                                    size="small"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="ค้นหาชื่อร้าน หรือ รหัสลูกค้า"
                                            variant="outlined"
                                            placeholder="พิมพ์เพื่อค้นหา..."
                                        // fullWidth
                                        />
                                    )}
                                // fullWidth
                                />
                            </Box>
                        </Paper>
                    </Grid2>
                )}

                {/* 1. ส่วนหัวข้อและการนำทาง (Breadcrumbs) */}
                <Grid2 size={12}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                        <Typography color="text.secondary">แจ้งเคลมอะไหล่</Typography>
                        <Typography color="text.primary" fontWeight="bold">รายการอะไหล่รอเคลม</Typography>
                    </Breadcrumbs>
                </Grid2>



                {/* 3. ส่วนเนื้อหาตาราง */}
                <Grid2 size={12}>
                    {/* ส่ง props ไปเท่าที่จำเป็น เพราะตัวกรองย้ายมาข้างบนแล้ว */}
                    <AlreadyClaim
                        spareParts={spareParts}
                        shops={shops}
                        filters={filters}
                        isAdmin={isAdmin}
                    />
                </Grid2>
            </Grid2>
        </LayoutClaim>


    )
}
