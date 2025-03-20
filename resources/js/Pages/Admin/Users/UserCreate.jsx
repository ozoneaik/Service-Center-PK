import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import {
    Box, Container, Grid2, Stack, Paper, Card, CardContent,
    Button, Divider, Switch, Tooltip, Typography, Alert, CircularProgress, Snackbar,
    FormControl, FormControlLabel, FormHelperText, TextField, Select,
    IconButton, InputAdornment, InputLabel, MenuItem,
} from "@mui/material";
import {
    AccountCircle, AdminPanelSettings, AlternateEmail,
    Badge, HelpOutline, Key, Search, Store as StoreIcon, Visibility,
    VisibilityOff, Warning
} from "@mui/icons-material";
import axios from "axios";
import { useState } from "react";
import LoginIcon from '@mui/icons-material/Login';

export default function UserCreate() {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user_code: "",
        name: "",
        email: "",
        role: "service",
        password: "",
        password_confirmation: "",
        is_code_cust_id: "",
        admin_that_branch: false,
    });

    const [storeInfo, setStoreInfo] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSearch = async () => {
        if (!data.is_code_cust_id) {
            setNotification({
                open: true,
                message: "กรุณากรอกรหัสร้านค้า",
                severity: "error"
            });
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get(route('shop.search', { is_code_cust_id: data.is_code_cust_id }));
            if (response.status === 200) {
                if (response.data.store) {
                    setStoreInfo(response.data.store);
                    setNotification({
                        open: true,
                        message: "พบข้อมูลร้านค้า",
                        severity: "success"
                    });
                } else {
                    setStoreInfo(null);
                    setNotification({
                        open: true,
                        message: "ไม่พบข้อมูลร้านค้า",
                        severity: "warning"
                    });
                }
            }
        } catch (error) {
            console.error("Error searching for store:", error);
            setStoreInfo(null);
            setNotification({
                open: true,
                message: "เกิดข้อผิดพลาดในการค้นหาร้านค้า",
                severity: "error"
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // ตรวจสอบว่าได้ค้นหาร้านค้าแล้วหรือยัง
        if (!storeInfo) {
            setNotification({
                open: true,
                message: "กรุณาค้นหาร้านค้าก่อนบันทึกข้อมูล",
                severity: "warning"
            });
            return;
        }

        post(route('userManage.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setNotification({
                    open: true,
                    message: "บันทึกข้อมูลผู้ใช้สำเร็จ",
                    severity: "success"
                });
                // รีเซ็ตฟอร์มหลังจากบันทึกสำเร็จ
                reset();
                setStoreInfo(null);
            },
            onError: (errors) => {
                console.error("เกิดข้อผิดพลาดจาก Backend:", errors);
                setNotification({
                    open: true,
                    message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                    severity: "error"
                });
            }
        });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // ตรวจสอบความซับซ้อนของรหัสผ่าน
    const checkPasswordStrength = (password) => {
        if (!password) return '';
        let strength = 0;
        const messages = [];
        // มีความยาวมากกว่า 8 ตัวอักษร
        if (password.length >= 8) strength += 1;
        else messages.push("รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร");
        // มีตัวอักษรพิมพ์ใหญ่
        if (/[A-Z]/.test(password)) strength += 1;
        else messages.push("ควรมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว");
        // มีตัวอักษรพิมพ์เล็ก
        if (/[a-z]/.test(password)) strength += 1;
        else messages.push("ควรมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว");
        // มีตัวเลข
        if (/[0-9]/.test(password)) strength += 1;
        else messages.push("ควรมีตัวเลขอย่างน้อย 1 ตัว");
        // มีอักขระพิเศษ
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else messages.push("ควรมีอักขระพิเศษอย่างน้อย 1 ตัว");
        if (strength < 3) return { color: 'error', message: messages[0] || 'รหัสผ่านไม่ปลอดภัย' };
        if (strength < 4) return { color: 'warning', message: 'รหัสผ่านปลอดภัยปานกลาง' };
        return { color: 'success', message: 'รหัสผ่านปลอดภัย' };
    };
    const passwordStrength = checkPasswordStrength(data.password);
    return (
        <AuthenticatedLayout>
            <Head title="สร้างผู้ใช้" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3, borderRadius: 2,
                        bgcolor: "background.paper",
                        boxShadow: "0 0 20px rgba(0,0,0,0.05)"
                    }}
                >
                    <Typography
                        variant="h5" component="h1"
                        color="primary.main" fontWeight="500"
                        sx={{
                            mb: 3,
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                        }}
                    >
                        <Badge sx={{ fontSize: 28 }} />
                        สร้างผู้ใช้งานใหม่
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {/* ส่วนข้อมูลผู้ใช้ */}
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 2, overflow: 'hidden',
                                    borderColor: 'primary.light'
                                }}
                            >
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'primary.contrastText',
                                    py: 1, px: 2, gap: 1,
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    <AccountCircle />
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        ข้อมูลผู้ใช้
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="ชื่อ-สกุล" name="name" value={data.name}
                                                onChange={handleChange} error={!!errors.name}
                                                helperText={errors.name}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AccountCircle color="primary" />
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="อีเมล" name="email" type="email" value={data.email}
                                                onChange={handleChange} error={!!errors.email}
                                                helperText={errors.email}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AlternateEmail color="primary" />
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ)" name="user_code" type="text" value={data.user_code}
                                                onChange={handleChange} error={!!errors.user_code}
                                                helperText={errors.user_code}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LoginIcon color="primary" />
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth size="small" error={!!errors.role}>
                                                <InputLabel>บทบาท</InputLabel>
                                                <Select
                                                    required label="บทบาท" name="role"
                                                    value={data.role} onChange={handleChange}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <AdminPanelSettings color="primary" />
                                                        </InputAdornment>
                                                    }
                                                >
                                                    <MenuItem value="admin">แอดมิน (Admin)</MenuItem>
                                                    <MenuItem value="service">เซอร์วิส (Service)</MenuItem>
                                                    <MenuItem value="dealer">ตัวแทนจำหน่าย (Dealer)</MenuItem>
                                                </Select>
                                                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                                            </FormControl>
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* ส่วนตั้งค่ารหัสผ่าน */}
                            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: 'primary.light' }} >
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'primary.contrastText',
                                    py: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1
                                }}>
                                    <Key />
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        ตั้งค่ารหัสผ่าน
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="รหัสผ่าน" name="password" type={showPassword ? "text" : "password"}
                                                value={data.password} onChange={handleChange} error={!!errors.password}
                                                helperText={errors.password || (data.password && passwordStrength.message)}
                                                color={data.password ? passwordStrength.color : undefined}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Key color={data.password ? passwordStrength.color : "primary"} />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility" edge="end"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                >
                                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="ยืนยันรหัสผ่าน" name="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={handleChange}
                                                error={!!errors.password_confirmation || (data.password !== data.password_confirmation && data.password_confirmation !== "")}
                                                helperText={
                                                    errors.password_confirmation ||
                                                    (data.password !== data.password_confirmation && data.password_confirmation !== "" ?
                                                        "รหัสผ่านไม่ตรงกัน" : "")
                                                }
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Key color={
                                                                    data.password_confirmation
                                                                        ? (data.password === data.password_confirmation ? "success" : "error")
                                                                        : "primary"
                                                                } />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    edge="end"
                                                                >
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

                            {/* ส่วนข้อมูลร้านค้า */}
                            <Card
                                variant="outlined"
                                sx={{ borderRadius: 2, overflow: 'hidden', borderColor: 'primary.light' }}
                            >
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'primary.contrastText',
                                    py: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1
                                }}>
                                    <StoreIcon />
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        ข้อมูลร้านค้า
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={12}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <TextField
                                                    size="small" required fullWidth label="รหัสร้านค้า" name="is_code_cust_id"
                                                    value={data.is_code_cust_id} onChange={handleChange}
                                                    error={!!errors.is_code_cust_id}
                                                    helperText={errors.is_code_cust_id}
                                                    slotProps={{
                                                        input: {
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <StoreIcon color="primary" />
                                                                </InputAdornment>
                                                            )
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained" onClick={handleSearch}
                                                    startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <Search />}
                                                    disabled={isSearching || !data.is_code_cust_id}
                                                >
                                                    ค้นหา
                                                </Button>
                                            </Box>
                                        </Grid2>

                                        <Grid2 size={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={data.admin_that_branch} color="primary"
                                                            onChange={(e) => setData('admin_that_branch', e.target.checked)}
                                                        />
                                                    }
                                                    label="ผู้ดูแลระบบในร้าน"
                                                />
                                                <Tooltip title="ผู้ใช้จะมีสิทธิ์เป็นแอดมินสำหรับร้านค้านี้เท่านั้น">
                                                    <HelpOutline color="primary" fontSize="medium" />
                                                </Tooltip>
                                            </Box>
                                        </Grid2>

                                        <Grid2 size={12}>
                                            {storeInfo ? (
                                                <Box sx={{
                                                    border: '1px solid', borderColor: 'success.light', borderRadius: 2,
                                                    p: 2, bgcolor: 'success.light', opacity: 0.8
                                                }}>
                                                    <Typography variant="subtitle2" color="success.dark" sx={{ mb: 1 }}>
                                                        ข้อมูลร้านค้า
                                                    </Typography>
                                                    <Grid2 container spacing={2}>
                                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                                            <Typography variant="body2">
                                                                <strong>ชื่อร้าน:</strong> {storeInfo.shop_name}
                                                            </Typography>
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                                            <Typography variant="body2">
                                                                <strong>เบอร์โทรศัพท์:</strong> {storeInfo.phone || '-'}
                                                            </Typography>
                                                        </Grid2>
                                                        <Grid2 size={12}>
                                                            <Typography variant="body2">
                                                                <strong>ที่อยู่:</strong> {storeInfo.address || '-'}
                                                            </Typography>
                                                        </Grid2>
                                                    </Grid2>
                                                </Box>
                                            ) : data.is_code_cust_id ? (
                                                <Alert severity="warning" icon={<Warning />} sx={{ borderRadius: 2 }}>
                                                    กรุณาค้นหาร้านค้าก่อนทำการบันทึก
                                                </Alert>
                                            ) : null}
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* ปุ่มดำเนินการ */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button
                                    color="inherit" variant="outlined"
                                    onClick={() => {
                                        reset();
                                        setStoreInfo(null);
                                        clearErrors();
                                    }}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit" variant="contained" disabled={processing || isSearching}
                                    startIcon={processing && <CircularProgress size={20} color="inherit" />}
                                >
                                    บันทึก
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Container>

            {/* แจ้งเตือน */}
            <Snackbar
                open={notification.open} autoHideDuration={6000}
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
        </AuthenticatedLayout>
    );
}