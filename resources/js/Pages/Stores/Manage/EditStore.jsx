import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import {
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    Paper,
    Divider,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Snackbar,
    Alert
} from "@mui/material";
import { useState } from "react";

export default function EditStore({ store, provinces, districts, subDistricts }) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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
        sale_lark_id: store.sale_lark_id,
        sale_name: store.sale_name,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        return ;
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
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="รหัสลูกค้า"
                                    name="is_code_cust_id"
                                    value={data.is_code_cust_id}
                                    onChange={handleChange}
                                    fullWidth
                                    disabled
                                    error={!!errors.is_code_cust_id}
                                    helperText={errors.is_code_cust_id}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="ชื่อร้าน"
                                    name="shop_name"
                                    value={data.shop_name}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    error={!!errors.shop_name}
                                    helperText={errors.shop_name}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="เบอร์โทรศัพท์"
                                    name="phone"
                                    value={data.phone}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="ที่อยู่"
                                    name="address"
                                    value={data.address}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    required
                                    error={!!errors.address}
                                    helperText={errors.address}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="ที่อยู่เพิ่มเติม"
                                    name="address_sub"
                                    value={data.address_sub}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    error={!!errors.address_sub}
                                    helperText={errors.address_sub}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth required error={!!errors.province}>
                                    <InputLabel>จังหวัด</InputLabel>
                                    <Select
                                        name="province"
                                        value={data.province}
                                        label="จังหวัด"
                                        onChange={handleChange}
                                    >
                                        {provinces?.map((province) => (
                                            <MenuItem key={province.id} value={province.name_th}>
                                                {province.name_th}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.province && <FormHelperText>{errors.province}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth required error={!!errors.district}>
                                    <InputLabel>อำเภอ/เขต</InputLabel>
                                    <Select
                                        name="district"
                                        value={data.district}
                                        label="อำเภอ/เขต"
                                        onChange={handleChange}
                                    >
                                        {districts?.map((district) => (
                                            <MenuItem key={district.id} value={district.name_th}>
                                                {district.name_th}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.district && <FormHelperText>{errors.district}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth required error={!!errors.sub_district}>
                                    <InputLabel>ตำบล/แขวง</InputLabel>
                                    <Select
                                        name="sub_district"
                                        value={data.sub_district}
                                        label="ตำบล/แขวง"
                                        onChange={handleChange}
                                    >
                                        {subDistricts?.map((subDistrict) => (
                                            <MenuItem key={subDistrict.id} value={subDistrict.name_th}>
                                                {subDistrict.name_th}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.sub_district && <FormHelperText>{errors.sub_district}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="รหัสพนักงานขาย"
                                    name="sale_lark_id"
                                    value={data.sale_lark_id}
                                    onChange={handleChange}
                                    fullWidth
                                    disabled
                                    error={!!errors.sale_lark_id}
                                    helperText={errors.sale_lark_id}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="ชื่อพนักงานขาย"
                                    name="sale_name"
                                    value={data.sale_name}
                                    onChange={handleChange}
                                    fullWidth
                                    disabled
                                    error={!!errors.sale_name}
                                    helperText={errors.sale_name}
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        // href={route("stores.index")}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={processing}
                                    >
                                        บันทึกข้อมูล
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </AuthenticatedLayout>
    );
}
