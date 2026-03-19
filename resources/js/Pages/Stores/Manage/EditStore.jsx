import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import {
    Box, Typography, Paper, Divider, Grid2, TextField, InputAdornment,
    Button, Stack, FormControl, InputLabel, MenuItem, Select, FormHelperText,
    Checkbox, FormControlLabel, Card, CardContent, Chip, alpha
} from "@mui/material";
import {
    Map, Password, Phone, Save, Store, LocationOn,
    Person, Badge, Settings, ArrowBack
} from "@mui/icons-material";
import { AlertDialogQuestion } from "@/Components/AlertDialog";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";

function SectionHeader({ icon, title, subtitle }) {
    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main"
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}

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
        use_disc_40p: store.use_disc_40p ?? false,
        use_disc_20p: store.use_disc_20p ?? false,
        use_std_price: store.use_std_price ?? false,
    });

    const handleDiscountChange = (field) => {
        const discountFields = ['use_disc_40p', 'use_disc_20p', 'use_std_price'];
        const newValues = {};
        discountFields.forEach(f => {
            newValues[f] = f === field ? !data[field] : false;
        });
        setData(prev => ({ ...prev, ...newValues }));
    };

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
                        onSuccess: () => console.log("✅ อัพเดทสำเร็จ"),
                        onError: (errors) => console.error("❌ อัพเดทผิดพลาด:", errors),
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
            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto", pb: 10 }}>

                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Button
                            component={Link}
                            href={route("stockSp.shopList")}
                            startIcon={<ArrowBack />}
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 2 }}
                        >
                            กลับ
                        </Button>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                แก้ไขศูนย์ซ่อม
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {store.shop_name}
                            </Typography>
                        </Box>
                    </Stack>
                    <Chip
                        icon={<Badge />}
                        label={data.is_code_cust_id}
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    />
                </Stack>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>

                        {/* ข้อมูลร้าน */}
                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionHeader icon={<Store />} title="ข้อมูลร้าน" subtitle="ชื่อร้าน เบอร์โทร และข้อมูลพื้นฐาน" />
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            name="shop_name" value={data.shop_name || ""} required
                                            label="ชื่อร้าน" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.shop_name} helperText={errors.shop_name}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start"><Store /></InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            name="phone" value={data.phone || ""} required
                                            label="เบอร์โทรศัพท์" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.phone} helperText={errors.phone}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start"><Phone /></InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>

                        {/* ข้อมูลที่อยู่ */}
                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionHeader icon={<LocationOn />} title="ข้อมูลที่อยู่" subtitle="ที่อยู่ เขต จังหวัด รหัสไปรษณีย์" />
                                <Grid2 container spacing={2}>
                                    <Grid2 size={12}>
                                        <TextField
                                            name="address" value={data.address || ""} required
                                            label="ที่อยู่" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.address} helperText={errors.address}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start"><Map /></InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <TextField
                                            name="address_sub" value={data.address_sub || ""}
                                            label="ที่อยู่เพิ่มเติม" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.address_sub} helperText={errors.address_sub}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start"><Map /></InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            name="province" value={data.province || ""} required
                                            label="จังหวัด" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.province} helperText={errors.province}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            name="district" value={data.district || ""} required
                                            label="อำเภอ/เขต" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.district} helperText={errors.district}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            name="subdistrict" value={data.subdistrict || ""} required
                                            label="ตำบล/แขวง" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.subdistrict} helperText={errors.subdistrict}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            name="zipcode" value={data.zipcode || ""} required
                                            label="รหัสไปรษณีย์" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.zipcode} helperText={errors.zipcode}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 8 }}>
                                        <TextField
                                            name="full_address" value={data.full_address || ""} required
                                            label="ที่อยู่แบบเต็ม (สร้างอัตโนมัติ)" fullWidth size="small"
                                            onChange={handleChange}
                                            error={!!errors.full_address} helperText={errors.full_address}
                                            sx={{ '& .MuiInputBase-root': { bgcolor: '#f9f9f9' } }}
                                        />
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>

                        {/* เซลล์ & ตั้งค่า */}
                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <SectionHeader icon={<Settings />} title="เซลล์ & ตั้งค่า" subtitle="เซลล์ประจำร้านและตัวเลือกส่วนลด" />
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" required error={!!errors.sale_id}>
                                            <InputLabel id="sale-label">เซลล์ประจำร้าน</InputLabel>
                                            <Select
                                                labelId="sale-label"
                                                name="sale_id"
                                                value={String(data.sale_id || "")}
                                                onChange={(e) => setData('sale_id', e.target.value)}
                                                label="เซลล์ประจำร้าน"
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
                                    <Grid2 size={12}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            ตัวเลือกราคาสำหรับการสั่งซื้อ (เลือกได้ 1 อย่าง หรือไม่เลือก)
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!data.use_disc_40p}
                                                        onChange={() => handleDiscountChange('use_disc_40p')}
                                                        color="success"
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2">
                                                        ส่วนลด <strong>disc40p</strong> (40%)
                                                    </Typography>
                                                }
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!data.use_disc_20p}
                                                        onChange={() => handleDiscountChange('use_disc_20p')}
                                                        color="warning"
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2">
                                                        ส่วนลด <strong>disc20p</strong> (20%)
                                                    </Typography>
                                                }
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!data.use_std_price}
                                                        onChange={() => handleDiscountChange('use_std_price')}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2">
                                                        ราคามาตรฐาน <strong>(Std Price)</strong>
                                                    </Typography>
                                                }
                                            />
                                        </Box>
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>

                    </Stack>

                    {/* Fixed Save Bar */}
                    <Paper
                        elevation={4}
                        sx={{
                            position: "fixed", bottom: 0, left: 0, width: "100%",
                            zIndex: 1000, p: 1.5,
                            display: "flex", justifyContent: "flex-end",
                            borderTop: "1px solid", borderColor: "divider",
                        }}
                    >
                        <Button
                            disabled={processing}
                            variant="contained"
                            type="submit"
                            startIcon={<Save />}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {processing ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                        </Button>
                    </Paper>
                </form>
            </Box>
        </AuthenticatedLayout>
    );
}
