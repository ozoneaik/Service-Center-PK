import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, useForm} from "@inertiajs/react";
import {
    Box, Typography, Paper, Divider, Grid2, FormControl, FormLabel, TextField, InputAdornment
} from "@mui/material";
import {useState} from "react";
import {Home, Map, MarkEmailRead, Password, Phone, Shop, Shop2, Store, VerifiedUser} from "@mui/icons-material";


const formList = [
    {key: 'is_code_cust_id', icon: <Password/>},
    {key: 'shop_name', icon: <Store/>},
    {key: 'phone', icon: <Phone/>},
    {key: 'address', icon: <Map/>},
    {key: 'address_sub', icon: <Map/>},
    {key: 'province', icon: <Map/>},
    {key: 'district', icon: <Map/>},
    {key: 'sub_district', icon: <Map/>},
    {key: 'sale_id', icon: <VerifiedUser/>},

]

export default function EditStore({store, provinces, districts, subDistricts}) {

    const {data, setData, post, processing, errors} = useForm({
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
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="แก้ไขศูนย์ซ่อม"/>
            <Box sx={{p: 3}}>
                <Paper elevation={3} sx={{p: 3}}>
                    <Typography variant="h5" component="h1" sx={{mb: 3}}>
                        แก้ไขข้อมูลศูนย์ซ่อม
                    </Typography>
                    <Divider sx={{mb: 3}}/>

                    <form onSubmit={handleSubmit}>
                        <Grid2 container spacing={2}>
                            {formList.map((item, index) => (
                                <Grid2 size={3} key={index}>
                                    <TextField
                                        value={data[item.key]} fullWidth placeholder='รหัสร้าน'
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
                        </Grid2>
                    </form>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
