import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import {
    Box, Typography, Paper, Divider, Grid2, TextField, InputAdornment,
    Button, Stack, FormControl, InputLabel, MenuItem, Select, FormHelperText
} from "@mui/material";
import { Map, Password, Phone, Save, Store, VerifiedUser } from "@mui/icons-material";
import { AlertDialogQuestion } from "@/Components/AlertDialog";
import { useState, useEffect } from "react";

const formList = [
    { key: 'shop_name', label: "ชื่อร้าน", icon: <Store /> },
    { key: 'phone', label: "เบอร์โทรศัพท์", icon: <Phone /> },
    { key: 'address', label: "ที่อยู่", icon: <Map /> },
    { key: 'address_sub', label: "ที่อยู่เพิ่มเติม", icon: <Map /> },
    { key: 'province', label: "จังหวัด", icon: <Map /> },
    { key: 'district', label: "อำเภอ/เขต", icon: <Map /> },
    { key: 'subdistrict', label: "ตำบล/แขวง", icon: <Map /> },
];

export default function EditStore({ store, sales }) {
    const { data, setData, put, processing, errors } = useForm({
        id: store.id,
        is_code_cust_id: store.is_code_cust_id,
        shop_name: store.shop_name,
        phone: store.phone,
        address: store.address,
        address_sub: store.address_sub || "",
        province: store.province,
        district: store.district,
        subdistrict: store.subdistrict,
        zipcode: store.zipcode || "",
        full_address: store.full_address || "",
        sale_id: store.sale_id,
    });

    useEffect(() => {
        console.log("📥 store props from backend:", store);
        console.log("📥 initial form data:", data);
    }, [store]);

    useEffect(() => {
        const autoFull = `${data.address} ${data.subdistrict} ${data.district} ${data.province} ${data.zipcode}`;
        setData("full_address", autoFull.trim());
    }, [data.address, data.subdistrict, data.district, data.province, data.zipcode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        AlertDialogQuestion({
            text: 'กด ตกลง เพื่อยืนยันการอัพเดทข้อมูล',
            onPassed: async (confirm) => {
                if (confirm) {
                    const { is_code_cust_id, ...payload } = data;
                    put(route("shop.update", data.id), {
                        data: payload,
                        preserveScroll: true,
                        onSuccess: () => {
                            console.log("✅ อัพเดทสำเร็จ");
                        },
                        onError: (errors) => {
                            console.error("❌ อัพเดทผิดพลาด:", errors);
                        },
                    });
                }
            }
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
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
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="รหัสร้าน"
                                    value={data.is_code_cust_id}
                                    fullWidth
                                    size="small"
                                    disabled
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Password />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>

                            {formList.map((item, index) => (
                                <Grid2 size={{ xs: 12, md: 3 }} key={index}>
                                    <TextField
                                        name={item.key}
                                        value={data[item.key] || ""}
                                        required
                                        label={item.label}
                                        fullWidth
                                        size="small"
                                        onChange={handleChange}
                                        error={!!errors[item.key]}
                                        helperText={errors[item.key]}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    {item.icon}
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid2>
                            ))}

                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <TextField
                                    name="zipcode"
                                    value={data.zipcode || ""}
                                    required
                                    label="รหัสไปรษณีย์"
                                    fullWidth
                                    size="small"
                                    onChange={handleChange}
                                    error={!!errors.zipcode}
                                    helperText={errors.zipcode}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Map />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormControl fullWidth size="small" required error={!!errors.sale_id}>
                                    <InputLabel id="sale-label">เซลล์ประจำร้าน</InputLabel>
                                    <Select
                                        labelId="sale-label"
                                        name="sale_id"
                                        value={String(data.sale_id || "")}
                                        onChange={(e) => setData('sale_id', e.target.value)}
                                    >
                                        <MenuItem value="">
                                            <em>กรุณาเลือกเซลล์</em>
                                        </MenuItem>
                                        {sales?.map((sale) => (
                                            <MenuItem key={sale.id} value={sale.sale_code}>
                                                {sale.sale_code} - {sale.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.sale_id && (
                                        <FormHelperText>{errors.sale_id}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <TextField
                                    name="full_address"
                                    value={data.full_address || ""}
                                    required
                                    label="ที่อยู่แบบเต็ม"
                                    fullWidth
                                    size="small"
                                    onChange={handleChange}
                                    error={!!errors.full_address}
                                    helperText={errors.full_address}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Map />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid2>
                            <Box
                                position="fixed" bottom={0} left={0} width="100%"
                                zIndex={1000} bgcolor="white" boxShadow={3}
                                p={1} component={Stack} direction="row" justifyContent="end"
                            >
                                <Button
                                    disabled={processing}
                                    variant='contained'
                                    type="submit"
                                    startIcon={<Save />}
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
