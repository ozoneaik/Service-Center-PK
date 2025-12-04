import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    Box, Container, Grid2, Stack, Paper, Card, CardContent,
    Button, Divider, Switch, Tooltip, Typography, Alert, CircularProgress, Snackbar,
    FormControl, FormControlLabel, FormHelperText, TextField, Select,
    IconButton, InputAdornment, InputLabel, MenuItem, Checkbox,
} from "@mui/material";
import {
    AccountCircle, AddModerator, AdminPanelSettings, AlternateEmail,
    Badge, HelpOutline, Key, Visibility, VisibilityOff
} from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState } from "react";

// Helper function: ตรวจสอบความซับซ้อนของรหัสผ่าน (คัดลอกมาจาก UserCreate)
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

export default function UserEditSale({ user, menu_access, list_all_menu }) {

    // เตรียม menu_access ให้เป็นรูปแบบที่ใช้ในฟอร์ม (map checked status)
    const mapMenuAccess = list_all_menu.map(menuItem => {
        const access = menu_access.find(a => a.menu_code === menuItem.id);
        return {
            menu_id: menuItem.id,
            is_checked: !!access // true ถ้ามีสิทธิ์อยู่แล้ว
        };
    });

    const { data, setData, put, processing, errors } = useForm({
        _method: 'put',
        id: user.id,
        user_code: user.user_code || "",
        name: user.name || "",
        email: user.email || "",
        role: user.role || "sale",

        // ฟิลด์ที่ไม่จำเป็นสำหรับ Sale แต่ควรส่งค่า Null/False เพื่อความเข้ากันได้
        is_code_cust_id: null,
        admin_that_branch: false,

        // รหัสผ่านเป็น Optional สำหรับการ Update
        password: "",
        password_confirmation: "",

        menu_access: mapMenuAccess
    });

    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ตรวจสอบความซับซ้อนของรหัสผ่านแบบ Real-time
    const passwordStrength = checkPasswordStrength(data.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // PUT method เพื่ออัปเดตข้อมูล
        put(route("saleManage.updateSale", { user_code: user.user_code }), {
            onSuccess: () => {
                setNotification({
                    open: true,
                    message: "อัพเดตผู้ใช้ Sale สำเร็จ",
                    severity: "success"
                });
            },
            onError: (err) => {
                console.error(err);
                setNotification({
                    open: true,
                    message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                    severity: "error"
                });
            }
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
            <Head title={`แก้ไขผู้ใช้ Sale: ${user.user_code}`} />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>

                    <Typography variant="h5" sx={{ mb: 3, display: "flex", gap: 1 }}>
                        <Badge />
                        แก้ไขผู้ใช้พนักงานขาย (Sale): <span style={{ fontWeight: "bold" }}>{user.name}</span>
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>

                            {/* USER INFO */}
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <Box sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    py: 1,
                                    px: 2,
                                    display: "flex",
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <AccountCircle /> ข้อมูลผู้ใช้
                                </Box>

                                <CardContent>
                                    <Grid2 container spacing={3}>

                                        <Grid2 size={12}>
                                            <TextField
                                                fullWidth size="small"
                                                label="ชื่อ-สกุล"
                                                name="name"
                                                value={data.name}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.name}
                                                helperText={errors.name}
                                            />
                                        </Grid2>

                                        <Grid2 size={12}>
                                            <TextField
                                                fullWidth size="small"
                                                label="อีเมล"
                                                name="email"
                                                value={data.email}
                                                onChange={handleChange}
                                                type="email"
                                                required
                                                error={!!errors.email}
                                                helperText={errors.email}
                                            />
                                        </Grid2>

                                        <Grid2 size={12}>
                                            <TextField
                                                fullWidth size="small"
                                                label="ชื่อผู้ใช้ (user_code)"
                                                name="user_code"
                                                value={data.user_code}
                                                disabled
                                            />
                                        </Grid2>

                                        <Grid2 size={12}>
                                            <TextField
                                                fullWidth size="small"
                                                label="บทบาท"
                                                value="Sale"
                                                disabled
                                            />
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* PASSWORD */}
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <Box sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    py: 1, px: 2,
                                    display: "flex", alignItems: 'center', gap: 1
                                }}>
                                    <Key /> ตั้งค่ารหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)
                                </Box>

                                <CardContent>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={12}>
                                            <TextField
                                                fullWidth size="small"
                                                label="รหัสผ่านใหม่"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={handleChange}
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
                                                fullWidth size="small"
                                                label="ยืนยันรหัสผ่านใหม่"
                                                name="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={handleChange}
                                                error={
                                                    !!errors.password_confirmation || (data.password_confirmation &&
                                                        data.password !== data.password_confirmation)
                                                }
                                                helperText={
                                                    errors.password_confirmation || (data.password_confirmation &&
                                                        data.password !== data.password_confirmation
                                                        ? "รหัสผ่านไม่ตรงกัน"
                                                        : "")
                                                }
                                                slotProps={{
                                                    input: {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                    {showConfirmPassword ? <VisibilityOff /> :
                                                                        <Visibility />}
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
                                    bgcolor: "primary.main",
                                    color: "white",
                                    py: 1, px: 2,
                                    display: "flex", alignItems: 'center', gap: 1
                                }}>
                                    <AddModerator /> การเข้าถึงเมนู
                                </Box>

                                <CardContent>
                                    <Box display='flex' flexWrap='wrap'>
                                        {list_all_menu.map((item) => {
                                            const current = data.menu_access.find(i => i.menu_id === item.id);
                                            return (
                                                <FormControlLabel
                                                    key={item.id}
                                                    label={item.menu_name}
                                                    control={
                                                        <Checkbox
                                                            name={item.id.toString()}
                                                            checked={current?.is_checked || false}
                                                            onChange={handleSelectMenu}
                                                        />
                                                    }
                                                />
                                            );
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* ปุ่มดำเนินการ */}
                            <Box sx={{ textAlign: "right" }}>
                                <Button component={Link} href={route('userManage.list')} variant='outlined' color='inherit' sx={{ mr: 2 }}>
                                    ยกเลิก
                                </Button>
                                <Button variant="contained" type="submit" disabled={processing} startIcon={processing && <CircularProgress size={20} color="inherit" />}>
                                    บันทึกการแก้ไข
                                </Button>
                            </Box>

                        </Stack>
                    </form>
                </Paper>

                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        sx={{ width: '100%' }} variant="filled"
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Container>
        </AuthenticatedLayout>
    );
}