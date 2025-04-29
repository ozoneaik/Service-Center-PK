import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage, } from "@inertiajs/react";
import {
    Paper, Typography, TextField, Grid2, Button, Box, InputAdornment,
    FormControl, InputLabel, OutlinedInput, FormHelperText, Card, Stack,
} from "@mui/material";
import { useState } from "react";
import { Save, Cancel, Inventory, QrCode, Category, MoneyOff, MonetizationOn, PriceCheck, Straighten, AspectRatio } from '@mui/icons-material';
export default function SucCreate() {
    const { data, setData, post, errors, error, setError, processing } = useForm({
        sku_name: '',
        sku_code: '',
        image: '',
        unit: 'เครื่อง',
        amount: 1,
        price_per_unit: 0,
        discount: 0,
        p_cat_name: '',
        startup_cost: ''
    })
    const { flash } = usePage().props;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
        // Clear error when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Submitting form data:", data);
        post(route('startUpCost.store', { data }), {
            onFinish: () => {
                console.log("Cancelled form");
            }
        })

    };

    const handleCancel = () => {
        if (confirm('คุณต้องการยกเลิกการกรอกข้อมูลหรือไม่?')) {
            console.log("Cancelled form");
            router.get(route('startUpCost.index'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="สร้างข้อมูลค่าเปิดเครื่อง" />
            <Paper sx={{ bgcolor: 'white', p: 3, }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" component="h1" fontWeight="600">
                        สร้างข้อมูลค่าเปิดเครื่อง
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                <Box sx={{ mt: 2 }}>
                    <Grid2 container spacing={3}>
                        <Grid2 size={12}>
                            <Card sx={{ p: 3 }} variant="outlined">
                                <Typography mb={3} variant="h6">ข้อมูลสินค้า</Typography>
                                <Grid2 container spacing={3}>
                                    {/* SKU Name */}
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            size="small" required fullWidth id="sku_name"
                                            name="sku_name" label="ชื่อ SKU"
                                            value={data.sku_name}
                                            onChange={handleChange}
                                            error={!!errors.sku_name}
                                            helperText={errors.sku_name}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Inventory color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                }

                                            }}
                                            variant="outlined"
                                        />
                                    </Grid2>

                                    {/* SKU Code */}
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            size="small" required fullWidth
                                            id="sku_code" name="sku_code" label="รหัส SKU"
                                            value={data.sku_code}
                                            onChange={handleChange}
                                            error={!!errors.sku_code}
                                            helperText={errors.sku_code}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <QrCode color="primary" />
                                                        </InputAdornment>
                                                    )
                                                }
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid2>
                                </Grid2>
                            </Card>
                        </Grid2>

                        <Grid2 size={12}>
                            <Card sx={{ p: 3 }} variant="outlined">
                                <Typography mb={3} variant="h6">รายละเอียดและราคา</Typography>

                                <Grid2 container spacing={3}>
                                    {/* Unit */}
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            size="small" fullWidth id="unit"
                                            name="unit" label="หน่วย"
                                            value={data.unit}
                                            onChange={handleChange}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Straighten color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                }

                                            }}
                                            variant="outlined"
                                        />
                                    </Grid2>

                                    {/* Amount */}
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            size="small" fullWidth id="amount"
                                            name="amount" label="จำนวน" type="number"
                                            value={data.amount}
                                            onChange={handleChange}
                                            error={!!errors.amount}
                                            helperText={errors.amount}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <AspectRatio color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                }

                                            }}
                                            variant="outlined"
                                        />
                                    </Grid2>

                                    {/* Category */}
                                    <Grid2 size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            size="small" fullWidth label="หมวดหมู่สินค้า"
                                            id="p_cat_name" name="p_cat_name"
                                            value={data.p_cat_name}
                                            onChange={handleChange}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Category color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                }
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid2>

                                    {/* Price Per Unit */}
                                    <Grid2 size={{ xs: 12, md: 4 }}>
                                        <FormControl fullWidth error={!!errors.price_per_unit} variant="outlined">
                                            <InputLabel htmlFor="price_per_unit">ราคาต่อหน่วย</InputLabel>
                                            <OutlinedInput
                                                size="small" id="price_per_unit"
                                                name="price_per_unit" type="number"
                                                value={data.price_per_unit}
                                                onChange={handleChange}
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <PriceCheck color="primary" />
                                                    </InputAdornment>
                                                }
                                                label="ราคาต่อหน่วย"
                                            />
                                            {errors.price_per_unit && <FormHelperText>{errors.price_per_unit}</FormHelperText>}
                                        </FormControl>
                                    </Grid2>

                                    {/* Discount */}
                                    <Grid2 size={{ xs: 12, md: 4 }}>
                                        <FormControl fullWidth error={!!errors.discount} variant="outlined">
                                            <InputLabel htmlFor="discount">ส่วนลด</InputLabel>
                                            <OutlinedInput
                                                size="small" id="discount"
                                                name="discount" type="number"
                                                value={data.discount}
                                                onChange={handleChange}
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <MoneyOff color="primary" />
                                                    </InputAdornment>
                                                }
                                                label="ส่วนลด"
                                            />
                                            {errors.discount && <FormHelperText>{errors.discount}</FormHelperText>}
                                        </FormControl>
                                    </Grid2>
                                </Grid2>
                            </Card>
                        </Grid2>

                        <Grid2 size={12}>
                            <Card sx={{ p: 3 }} variant="outlined">
                                <Typography mb={3} variant="h6">ข้อมูลค่าเปิดเครื่อง</Typography>
                                <Grid2 container spacing={3}>
                                    {/* Startup Cost */}
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth required error={!!errors.startup_cost} variant="outlined">
                                            <InputLabel htmlFor="startup_cost">ค่าเปิดเครื่อง</InputLabel>
                                            <OutlinedInput
                                                size="small" id="startup_cost"
                                                name="startup_cost" type="number"
                                                value={data.startup_cost}
                                                onChange={handleChange}
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <MonetizationOn color="primary" />
                                                    </InputAdornment>
                                                }
                                                label="ค่าเปิดเครื่อง"
                                            />
                                            {errors.startup_cost && <FormHelperText>{errors.startup_cost}</FormHelperText>}
                                        </FormControl>
                                    </Grid2>
                                </Grid2>
                            </Card>
                        </Grid2>

                        {/* Action Buttons */}
                        <Grid2 size={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined" color="error" startIcon={<Cancel />}
                                    onClick={handleCancel} size="small"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    loading={processing}
                                    type="submit" variant="contained" color="primary"
                                    startIcon={<Save />} size="small"
                                >
                                    บันทึกข้อมูล
                                </Button>
                            </Stack>
                        </Grid2>
                    </Grid2>
                </Box>
                </form>
                
            </Paper>
        </AuthenticatedLayout>
    );
}