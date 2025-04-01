import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, useForm, usePage} from "@inertiajs/react";
import {
    Box, Container, Grid2, Stack, Paper, Card, CardContent,
    Button, Divider, Switch, Tooltip, Typography, Alert, CircularProgress, Snackbar,
    FormControl, FormControlLabel, FormHelperText, TextField, Select,
    IconButton, InputAdornment, InputLabel, MenuItem,
} from "@mui/material";
import {
    AccountCircle, AdminPanelSettings, AlternateEmail,
    Badge, HelpOutline, Key, Store as StoreIcon, Visibility,
    VisibilityOff
} from "@mui/icons-material";
import {useState} from "react";
import LoginIcon from '@mui/icons-material/Login';

export default function UserStore() {
    const {flash} = usePage().props;
    const {data, setData, post, processing, errors, reset, clearErrors} = useForm({
        user_code: "",
        name: "",
        email: "",
        role: "service",
        password: "",
        password_confirmation: "",
        admin_that_branch: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    };

    const [showAlert, setShowAlert] = useState(false);

    // ตรวจสอบความซับซ้อนของรหัสผ่าน
    const checkPasswordStrength = (password) => {
        if (!password) return { color: 'danger', message: 'กรุณากรอกรหัสผ่าน' };
        let messages = [];
        if (password.length < 8) {
            messages.push("รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร");
        }
        if (!/[0-9]/.test(password)) {
            messages.push("ควรมีตัวเลขอย่างน้อย 1 ตัว");
        }
        if (messages.length > 0) {
            return { color: 'warning', message: messages.join(' ') };
        }
        return { color: 'success', message: 'รหัสผ่านปลอดภัย' };
    };

    const passwordStrength = checkPasswordStrength(data.password);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('storeUsers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // รีเซ็ตฟอร์มหลังจากบันทึกสำเร็จ
                reset();
            },
            onError: (errors) => {
                console.error("เกิดข้อผิดพลาดจาก Backend:", errors);
            },
            onFinish: () => {
                setShowAlert(true);
            }
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="สร้างผู้ใช้"/>
            <Container maxWidth="lg" sx={{py: 4}}>
                <Paper
                    elevation={0}
                    sx={{p: 3, borderRadius: 2, bgcolor: "background.paper", boxShadow: "0 0 20px rgba(0,0,0,0.05)"}}
                >
                    <Typography
                        variant="h5" component="h1" color="primary.main" fontWeight="500"
                        sx={{mb: 3, display: 'flex', gap: 1, alignItems: 'center',}}
                    >
                        <Badge sx={{fontSize: 28}}/>
                        สร้างผู้ใช้งานใหม่
                    </Typography>
                    <Divider sx={{mb: 4}}/>
                    <form onSubmit={handleSubmit}>
                        {showAlert && flash.success && (
                            <Grid2 container>
                                <Grid2 size={12} mb={2}>
                                    <Alert security="success" onClose={() => setShowAlert(false)}>
                                        {flash.success}
                                    </Alert>
                                </Grid2>
                            </Grid2>
                        )}

                        {showAlert && flash.error && (
                            <Grid2 container>
                                <Grid2 size={12} mb={2}>
                                    <Alert security="error" onClose={() => setShowAlert(false)}>
                                        {flash.error}
                                    </Alert>
                                </Grid2>
                            </Grid2>
                        )}

                        <Stack spacing={3}>
                            {/* ส่วนข้อมูลผู้ใช้ */}
                            <Card
                                variant="outlined"
                                sx={{borderRadius: 2, overflow: 'hidden', borderColor: 'primary.light'}}
                            >
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'primary.contrastText',
                                    py: 1, px: 2, gap: 1, display: 'flex', alignItems: 'center',
                                }}>
                                    <AccountCircle/>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        ข้อมูลผู้ใช้
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="ชื่อ-สกุล" name="name" value={data.name}
                                                onChange={handleChange} error={!!errors.name}
                                                helperText={errors.name}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AccountCircle color="primary"/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="อีเมล" name="email" type="email" value={data.email}
                                                onChange={handleChange} error={!!errors.email}
                                                helperText={errors.email}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AlternateEmail color="primary"/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ)" name="user_code" type="text"
                                                value={data.user_code}
                                                onChange={handleChange} error={!!errors.user_code}
                                                helperText={errors.user_code}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LoginIcon color="primary"/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>

                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <FormControl fullWidth size="small" error={!!errors.role}>
                                                <InputLabel>บทบาท</InputLabel>
                                                <Select
                                                    required label="บทบาท" name="role"
                                                    value={data.role} onChange={handleChange}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <AdminPanelSettings color="primary"/>
                                                        </InputAdornment>
                                                    }
                                                    variant='outlined'>
                                                    <MenuItem value="service">เซอร์วิส (Service)</MenuItem>
                                                </Select>
                                                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                                            </FormControl>
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* ส่วนตั้งค่ารหัสผ่าน */}
                            <Card variant="outlined"
                                  sx={{borderRadius: 2, overflow: 'hidden', borderColor: 'primary.light'}}>
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'primary.contrastText',
                                    py: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1
                                }}>
                                    <Key/>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        ตั้งค่ารหัสผ่าน
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="รหัสผ่าน" name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password} onChange={handleChange} error={!!errors.password}
                                                helperText={errors.password || (data.password && passwordStrength.message)}
                                                color={data.password ? passwordStrength.color : undefined}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Key
                                                                    color={data.password ? passwordStrength.color : "primary"}/>
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility" edge="end"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                >
                                                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, md: 6}}>
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
                                                                }/>
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    edge="end"
                                                                >
                                                                    {showConfirmPassword ? <VisibilityOff/> :
                                                                        <Visibility/>}
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
                                sx={{borderRadius: 2, overflow: 'hidden', borderColor: 'primary.light'}}
                            >
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'primary.contrastText',
                                    py: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1
                                }}>
                                    <StoreIcon/>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        ข้อมูลร้านค้า
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={3}>

                                        <Grid2 size={12}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
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
                                                    <HelpOutline color="primary" fontSize="medium"/>
                                                </Tooltip>
                                            </Box>
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* ปุ่มดำเนินการ */}
                            <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2}}>
                                <Button color="inherit" variant="outlined" onClick={() => reset()}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit" variant="contained"
                                    startIcon={processing && <CircularProgress size={20} color="inherit"/>}
                                >
                                    บันทึก
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}
