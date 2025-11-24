import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import {
    Paper, Typography, TextField, Grid2, Button, Box, InputAdornment,
    FormControl, InputLabel, OutlinedInput, FormHelperText, Card, Stack,
} from "@mui/material";
import { Save, Cancel, Inventory, QrCode, Category, MoneyOff, MonetizationOn, PriceCheck, Straighten, AspectRatio } from '@mui/icons-material';

export default function SucEdit({ item }) {

    const { data, setData, put, errors, processing } = useForm({
        sku_code: item.sku_code || "",
        sku_name: item.sku_name || "",
        unit: item.unit || "เครื่อง",
        amount: item.amount || 1,
        price_per_unit: item.price_per_unit || 0,
        discount: item.discount || 0,
        p_cat_name: item.p_cat_name || "",
        startup_cost: item.startup_cost || "",
    });

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("startUpCost.update", item.id));
    };

    const handleCancel = () => {
        router.get(route('startUpCost.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="แก้ไขข้อมูลค่าเปิดเครื่อง" />

            <Paper sx={{ bgcolor: 'white', p: 3 }}>
                <Typography variant="h6" fontWeight={600}>แก้ไขข้อมูลค่าเปิดเครื่อง</Typography>

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
                                                size="small" required fullWidth name="sku_name"
                                                label="ชื่อ SKU" value={data.sku_name}
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
                                            />
                                        </Grid2>

                                        {/* SKU Code */}
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" required fullWidth name="sku_code"
                                                label="รหัส SKU" value={data.sku_code}
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
                                            />
                                        </Grid2>

                                    </Grid2>
                                </Card>
                            </Grid2>

                            {/* รายละเอียดและราคา */}
                            <Grid2 size={12}>
                                <Card sx={{ p: 3 }} variant="outlined">
                                    <Typography mb={3} variant="h6">รายละเอียดและราคา</Typography>

                                    <Grid2 container spacing={3}>

                                        {/* Unit */}
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" fullWidth name="unit" label="หน่วย"
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
                                            />
                                        </Grid2>

                                        {/* Amount */}
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" fullWidth name="amount" type="number"
                                                label="จำนวน" value={data.amount}
                                                onChange={handleChange}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AspectRatio color="primary" />
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
                                        </Grid2>

                                        {/* Category */}
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <TextField
                                                size="small" fullWidth name="p_cat_name"
                                                label="หมวดหมู่สินค้า" value={data.p_cat_name}
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
                                            />
                                        </Grid2>

                                        {/* Price Per Unit */}
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>ราคาต่อหน่วย</InputLabel>
                                                <OutlinedInput
                                                    size="small" name="price_per_unit"
                                                    type="number" value={data.price_per_unit}
                                                    onChange={handleChange}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <PriceCheck color="primary" />
                                                        </InputAdornment>
                                                    }
                                                    label="ราคาต่อหน่วย"
                                                />
                                            </FormControl>
                                        </Grid2>

                                        {/* Discount */}
                                        <Grid2 size={{ xs: 12, md: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>ส่วนลด</InputLabel>
                                                <OutlinedInput
                                                    size="small" name="discount" type="number"
                                                    value={data.discount}
                                                    onChange={handleChange}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <MoneyOff color="primary" />
                                                        </InputAdornment>
                                                    }
                                                    label="ส่วนลด"
                                                />
                                            </FormControl>
                                        </Grid2>

                                    </Grid2>
                                </Card>
                            </Grid2>

                            {/* ข้อมูลค่าเปิดเครื่อง */}
                            <Grid2 size={12}>
                                <Card sx={{ p: 3 }} variant="outlined">
                                    <Typography mb={3} variant="h6">ข้อมูลค่าเปิดเครื่อง</Typography>

                                    <Grid2 container spacing={3}>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth required error={!!errors.startup_cost}>
                                                <InputLabel>ค่าเปิดเครื่อง</InputLabel>
                                                <OutlinedInput
                                                    size="small" name="startup_cost" type="number"
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

                            {/* Buttons */}
                            <Grid2 size={12}>
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Button color="error" variant="outlined" startIcon={<Cancel />} onClick={handleCancel}>
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" variant="contained" startIcon={<Save />} loading={processing}>
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