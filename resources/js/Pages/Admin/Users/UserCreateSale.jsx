import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import {
    Box, Container, Grid2, Stack, Paper, Card, CardContent,
    Button, Divider, Switch, Tooltip, Typography, Alert, CircularProgress, Snackbar,
    FormControl, FormControlLabel, FormHelperText, TextField, Select,
    IconButton, InputAdornment, InputLabel, MenuItem, Checkbox,
} from "@mui/material";
import {
    AccountCircle, AddModerator, AdminPanelSettings, AlternateEmail,
    Badge, HelpOutline, Key, Search, Visibility,
    VisibilityOff
} from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState } from "react";

export default function UserCreateSale({ menu_list }) {

    // Helper function: ตรวจสอบความซับซ้อนของรหัสผ่าน (คัดลอกมาจาก UserEditSale)
    const checkPasswordStrength = (password) => {
        if (!password) return '';
        let strength = 0;
        const messages = [];
        if (password.length >= 8) strength += 1;
        else messages.push("รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร");
        if (/[A-Z]/.test(password)) strength += 1;
        else messages.push("ควรมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว");
        if (/[a-z]/.test(password)) strength += 1;
        else messages.push("ควรมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว");
        if (/[0-9]/.test(password)) strength += 1;
        else messages.push("ควรมีตัวเลขอย่างน้อย 1 ตัว");
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else messages.push("ควรมีอักขระพิเศษอย่างน้อย 1 ตัว");
        if (strength < 3) return { color: 'error', message: messages[0] || 'รหัสผ่านไม่ปลอดภัย' };
        if (strength < 4) return { color: 'warning', message: 'รหัสผ่านปลอดภัยปานกลาง' };
        return { color: 'success', message: 'รหัสผ่านปลอดภัย' };
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        user_code: "",
        name: "",
        email: "",
        role: "sale",
        password: "",
        password_confirmation: "",
        sale_code: "",
        is_code_cust_id: null,
        admin_that_branch: false,
        menu_access: []
    });

    const [saleInfo, setSaleInfo] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordStrength = checkPasswordStrength(data.password); // ใช้สำหรับแสดงความแข็งแกร่งของรหัสผ่าน

    useEffect(() => {
        if (menu_list && menu_list.length > 0) {
            const initializedMenuAccess = menu_list.map(item => ({
                menu_id: item.id,
                is_checked: true
            }));
            setData("menu_access", initializedMenuAccess);
        }
    }, [menu_list]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    // 🔍 ค้นหา SALE
    const handleSearchSale = async () => {
        // Clear previous user data when searching again
        setData({
            ...data,
            name: "",
            user_code: "",
            email: "",
            password: "",
            password_confirmation: "",
            // is_code_cust_id: null, // is_code_cust_id, admin_that_branch ถูกกำหนดเป็นค่าเริ่มต้นแล้ว
        });
        setSaleInfo(null);

        if (!data.sale_code) {
            setNotification({
                open: true,
                message: "กรุณากรอกรหัส Sale",
                severity: "error"
            });
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get(
                route("sale.search", { sale_code: data.sale_code })
            );

            if (response.data.sale) {
                const sale = response.data.sale;

                setSaleInfo(sale);

                // auto fill
                setData(prevData => ({
                    ...prevData,
                    name: sale.name,
                    user_code: sale.sale_code,
                    // email: sale.email || "", // ถ้าต้องการ autofill email จาก sale info
                    email: `${sale.sale_code}@sale`,
                }));

                setNotification({
                    open: true,
                    message: "พบข้อมูลพนักงานขาย",
                    severity: "success"
                });
            } else {
                setSaleInfo(null);
                setNotification({
                    open: true,
                    message: "ไม่พบข้อมูล Sale",
                    severity: "warning"
                });
            }
        } catch (e) {
            console.error(e);
            setNotification({
                open: true,
                message: "เกิดข้อผิดพลาดในการค้นหา",
                severity: "error"
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!saleInfo) {
            setNotification({
                open: true,
                message: "กรุณาค้นหา Sale ก่อนบันทึก",
                severity: "warning"
            });
            return;
        }

        post(route("saleManage.storeSale"), {
            preserveScroll: true,
            onSuccess: () => {
                setNotification({
                    open: true,
                    message: "สร้างผู้ใช้ Sale สำเร็จ",
                    severity: "success"
                });

                reset();
                setSaleInfo(null);
            },
            onError: (errors) => {
                console.log("Backend error:", errors);

                // ถ้ามี error.general (จาก backend)
                if (errors.general) {
                    setNotification({
                        open: true,
                        message: errors.general,
                        severity: "error"
                    });
                    return;
                }

                const firstError = Object.values(errors)[0];
                setNotification({
                    open: true,
                    message: firstError,
                    severity: "error"
                });
            },
        });
    };

    const handleSelectMenu = (e) => {
        const { name, checked } = e.target;
        const id = parseInt(name);

        const updated = data.menu_access.map(it =>
            it.menu_id === id ? { ...it, is_checked: checked } : it
        );

        setData("menu_access", updated);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };


    return (
        <AuthenticatedLayout>
            <Head title="สร้างผู้ใช้สำหรับ Sale" />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>

                    <Typography variant="h5" sx={{ mb: 1, display: "flex", gap: 1 }}>
                        <Badge />
                        สร้างผู้ใช้สำหรับพนักงานขาย (Sale)
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>

                            {/* SEARCH SALE SECTION (บล็อกที่แสดงเสมอ) */}
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <Box sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    py: 1,
                                    px: 2,
                                    display: "flex",
                                    gap: 1
                                }}>
                                    <Search />
                                    ค้นหาพนักงานขาย (Sale)
                                </Box>

                                <CardContent>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={12}>
                                            <Box sx={{ display: "flex", gap: 2 }}>
                                                <TextField
                                                    fullWidth size="small"
                                                    label="รหัสพนักงานขาย (sale_code)"
                                                    name="sale_code"
                                                    value={data.sale_code}
                                                    onChange={handleChange}
                                                    error={!!errors.sale_code}
                                                    helperText={errors.sale_code}
                                                />

                                                <Button
                                                    variant="contained"
                                                    startIcon={
                                                        isSearching ?
                                                            <CircularProgress size={20} color="inherit" /> :
                                                            <Search />
                                                    }
                                                    onClick={handleSearchSale}
                                                    disabled={isSearching}
                                                >
                                                    ค้นหา
                                                </Button>
                                            </Box>
                                        </Grid2>

                                        {saleInfo ? (
                                            <Grid2 size={12}>
                                                <Alert severity="success">
                                                    พบข้อมูล • {saleInfo.name} ({saleInfo.sale_code})
                                                </Alert>
                                            </Grid2>
                                        ) : data.sale_code && !isSearching ? (
                                            <Grid2 size={12}>
                                                <Alert severity="info">
                                                    กรุณาป้อนรหัสพนักงานขายและกดค้นหา
                                                </Alert>
                                            </Grid2>
                                        ) : null}
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* 🚨 USER INFO, PASSWORD, MENU ACCESS และปุ่มบันทึก (แสดงเมื่อค้นหาเจอ) */}
                            {saleInfo && (
                                <>
                                    {/* USER INFO */}
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Box sx={{
                                            bgcolor: "primary.main", color: "white", py: 1, px: 2,
                                            display: "flex", gap: 1
                                        }}>
                                            <AccountCircle /> ข้อมูลผู้ใช้
                                        </Box>
                                        <CardContent>
                                            <Grid2 container spacing={3}>
                                                <Grid2 size={12}>
                                                    <TextField
                                                        fullWidth size="small"
                                                        label="ชื่อ-สกุล" name="name"
                                                        value={data.name} onChange={handleChange} required
                                                        error={!!errors.name} helperText={errors.name}
                                                    />
                                                </Grid2>

                                                <Grid2 size={12}>
                                                    <TextField
                                                        fullWidth size="small"
                                                        label="อีเมล" name="email"
                                                        value={data.email} onChange={handleChange}
                                                        type="email" required
                                                        disabled
                                                        error={!!errors.email} helperText={errors.email}
                                                    />
                                                </Grid2>

                                                <Grid2 size={12}>
                                                    <TextField
                                                        fullWidth size="small"
                                                        label="ชื่อผู้ใช้ (user_code) ใช้สำหรับเข้าสู่ระบบ" name="user_code"
                                                        value={data.user_code} onChange={handleChange} required
                                                        disabled // ไม่ควรแก้ไขหลังจากค้นหาเจอ
                                                        error={!!errors.user_code} helperText={errors.user_code}
                                                    />
                                                </Grid2>

                                                <Grid2 size={12}>
                                                    <TextField
                                                        fullWidth size="small" label="บทบาท" value="Sale" disabled
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </CardContent>
                                    </Card>

                                    {/* PASSWORD */}
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Box sx={{
                                            bgcolor: "primary.main", color: "white", py: 1, px: 2,
                                            display: "flex", gap: 1
                                        }}>
                                            <Key /> ตั้งค่ารหัสผ่าน
                                        </Box>

                                        <CardContent>
                                            <Grid2 container spacing={3}>
                                                <Grid2 size={12}>
                                                    <TextField
                                                        fullWidth size="small" label="รหัสผ่าน" name="password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={data.password} onChange={handleChange} required
                                                        error={!!errors.password}
                                                        helperText={errors.password || (data.password && passwordStrength.message)}
                                                        color={data.password ? passwordStrength.color : undefined}
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }
                                                        }}
                                                    />
                                                </Grid2>

                                                <Grid2 size={12}>
                                                    <TextField
                                                        fullWidth size="small" label="ยืนยันรหัสผ่าน" name="password_confirmation"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={data.password_confirmation} onChange={handleChange} required
                                                        error={!!errors.password_confirmation || (data.password_confirmation && data.password !== data.password_confirmation)}
                                                        helperText={errors.password_confirmation || (data.password_confirmation && data.password !== data.password_confirmation ? "รหัสผ่านไม่ตรงกัน" : "")}
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </CardContent>
                                    </Card>

                                    {/* MENU ACCESS */}
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Box sx={{
                                            bgcolor: "primary.main", color: "white", py: 1, px: 2,
                                            display: "flex", gap: 1
                                        }}>
                                            <AddModerator /> การเข้าถึงเมนู
                                        </Box>

                                        <CardContent>
                                            {/* 🚨 แก้ไข: ใช้ Grid2 container และกำหนดขนาดให้แต่ละ item เป็น 6 (ครึ่งหนึ่งของ 12) */}
                                            <Grid2 container spacing={1}>
                                                {menu_list.map((item) => {
                                                    const current = data.menu_access.find(i => i.menu_id === item.id);
                                                    return (
                                                        <Grid2 key={item.id} size={6}> {/* 👈 ทำให้เป็น 2 คอลัมน์ (6/12) */}
                                                            <FormControlLabel
                                                                label={item.menu_name}
                                                                control={
                                                                    <Checkbox
                                                                        name={item.id.toString()}
                                                                        checked={current?.is_checked || false}
                                                                        onChange={handleSelectMenu}
                                                                    />
                                                                }
                                                            />
                                                        </Grid2>
                                                    );
                                                })}
                                            </Grid2>

                                        </CardContent>
                                    </Card>

                                    <Box sx={{ textAlign: "right" }}>
                                        <Button variant="contained" type="submit" disabled={processing}>
                                            บันทึกข้อมูล
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    </form>
                </Paper>

                <Snackbar
                    open={notification.open} autoHideDuration={3000}
                    onClose={handleCloseNotification}
                    message={notification.message}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                />
            </Container>
        </AuthenticatedLayout>
    );
}