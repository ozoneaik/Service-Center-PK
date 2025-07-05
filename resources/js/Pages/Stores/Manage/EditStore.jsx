import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import {
    Box, Typography, Paper, Divider, Grid2, TextField, InputAdornment, Button, Stack
} from "@mui/material";
import { Map, Password, Phone, Save, Shop, Shop2, Store, VerifiedUser } from "@mui/icons-material";
import { AlertDialogQuestion } from "@/Components/AlertDialog";


const formList = [
    { key: 'is_code_cust_id', icon: <Password /> },
    { key: 'shop_name', icon: <Store /> },
    { key: 'phone', icon: <Phone /> },
    { key: 'address', icon: <Map /> },
    { key: 'address_sub', icon: <Map /> },
    { key: 'province', icon: <Map /> },
    { key: 'district', icon: <Map /> },
    { key: 'sub_district', icon: <Map /> },
    { key: 'sale_id', icon: <VerifiedUser /> },

]

export default function EditStore({ store, provinces, districts, subDistricts }) {

    const { data, setData, post, processing, errors } = useForm({
        id: store.id,
        is_code_cust_id: store.is_code_cust_id,
        shop_name: store.shop_name,
        phone: store.phone,
        address: store.address,
        address_sub: store.address_sub || "",
        province: store.province,
        district: store.district,
        sub_district: store.sub_district,
        sale_id: store.sale_id,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        AlertDialogQuestion({
            text: 'กด ตกลง เพื่อยืนยันการอัพเดทข้อมูล',
            onPassed: async (confirm) => {
                if (confirm) {
                    alert('ขณะนี้ไม่สามารถอัพเดทข้อมูลได้');
                }
            }
        })
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="แก้ไขศูนย์ซ่อม" />
            <Box sx={{ p: 3 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
                        แก้ไขข้อมูลศูนย์ซ่อม
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={handleSubmit}>
                        <Grid2 container spacing={2}>
                            {formList.map((item, index) => (
                                <Grid2 size={{ xs: 12, md: 3 }} key={index}>
                                    <TextField
                                        value={data[item.key]}
                                        required label={item.key}
                                        fullWidth placeholder='รหัสร้าน'
                                        name={item.key} size='small' slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position='start'>
                                                        {item.icon}
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                </Grid2>
                            ))}
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <TextField
                                    size="small" required
                                    value={data.is_code_cust_id}
                                    slotProps={{
                                        
                                    }}
                                />
                            </Grid2>
                            <Box
                                position="fixed" bottom={0} left={0} width="100%"
                                zIndex={1000} bgcolor="white" boxShadow={3}
                                p={1} component={Stack} direction="row" justifyContent="end"
                            >
                                <Button
                                    loading={processing} variant='contained'
                                    type="submit" startIcon={<Save />}
                                >
                                    บันทึก
                                </Button>
                            </Box>
                        </Grid2>
                    </form>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
