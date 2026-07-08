import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, Link, useForm} from "@inertiajs/react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid2,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {AccountCircle, AlternateEmail, Key, Store, Visibility, VisibilityOff} from "@mui/icons-material";
import {useState} from "react";

export default function DealerShopCreate() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {data, setData, post, processing, errors} = useForm({
        // ข้อมูลร้านค้า
        is_code_cust_id: '',
        shop_name: '',
        phone: '',
        address: '',
        // ข้อมูลผู้ใช้แรก
        user_code: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.dealer-shops.store'));
    };

    const field = (key, label, props = {}) => (
        <TextField
            size="small"
            fullWidth
            label={label}
            value={data[key]}
            onChange={(e) => setData(key, e.target.value)}
            error={!!errors[key]}
            helperText={errors[key]}
            required
            {...props}
        />
    );

    return (
        <AuthenticatedLayout>
            <Head title="เพิ่มร้านค้าตัวแทน"/>
            <Container maxWidth="md" sx={{py: 3}}>
                <Paper elevation={3} sx={{p: 3}}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{mb: 1}}>
                        <Store color="primary"/>
                        <Typography variant="h5" fontWeight="bold">
                            เพิ่มร้านค้าตัวแทน (ไม่ใช่ศูนย์ซ่อม)
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        ระบบจะสร้างข้อมูลร้านค้าและบัญชีผู้ใช้พร้อมกำหนดสิทธิ์เมนูแจ้งซ่อมให้อัตโนมัติ
                    </Typography>
                    <Divider sx={{mb: 3}}/>

                    {errors.error && (
                        <Alert severity="error" sx={{mb: 2}}>{errors.error}</Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {/* ข้อมูลร้านค้า */}
                            <Card variant="outlined">
                                <Box sx={{bgcolor: 'primary.main', color: 'white', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Store fontSize="small"/>
                                    <Typography fontWeight="medium">ข้อมูลร้านค้า</Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            {field('is_code_cust_id', 'รหัสร้านค้า (IS Code)', {
                                                helperText: errors.is_code_cust_id || 'รหัสเฉพาะสำหรับร้านค้านี้ ห้ามซ้ำ',
                                                inputProps: {maxLength: 50},
                                            })}
                                        </Grid2>
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            {field('shop_name', 'ชื่อร้านค้า')}
                                        </Grid2>
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            {field('phone', 'เบอร์โทรศัพท์', {inputProps: {maxLength: 20}})}
                                        </Grid2>
                                        <Grid2 size={12}>
                                            {field('address', 'ที่อยู่', {multiline: true, rows: 3})}
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* ข้อมูลผู้ใช้ */}
                            <Card variant="outlined">
                                <Box sx={{bgcolor: 'primary.main', color: 'white', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1}}>
                                    <AccountCircle fontSize="small"/>
                                    <Typography fontWeight="medium">บัญชีผู้ใช้ (ร้านค้า)</Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            <TextField
                                                size="small" fullWidth required
                                                label="ชื่อผู้ใช้ (สำหรับเข้าระบบ)"
                                                value={data.user_code}
                                                onChange={(e) => setData('user_code', e.target.value)}
                                                error={!!errors.user_code}
                                                helperText={errors.user_code}
                                                slotProps={{input: {startAdornment: <InputAdornment position="start"><AccountCircle color="primary" fontSize="small"/></InputAdornment>}}}
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            <TextField
                                                size="small" fullWidth required
                                                label="ชื่อ-สกุล"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                error={!!errors.name}
                                                helperText={errors.name}
                                            />
                                        </Grid2>
                                        <Grid2 size={12}>
                                            <TextField
                                                size="small" fullWidth required
                                                label="อีเมล"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                slotProps={{input: {startAdornment: <InputAdornment position="start"><AlternateEmail color="primary" fontSize="small"/></InputAdornment>}}}
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            <TextField
                                                size="small" fullWidth required
                                                label="รหัสผ่าน"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                error={!!errors.password}
                                                helperText={errors.password}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: <InputAdornment position="start"><Key color="primary" fontSize="small"/></InputAdornment>,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                    {showPassword ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            <TextField
                                                size="small" fullWidth required
                                                label="ยืนยันรหัสผ่าน"
                                                type={showConfirm ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                error={!!errors.password_confirmation || (data.password !== data.password_confirmation && !!data.password_confirmation)}
                                                helperText={errors.password_confirmation || (data.password !== data.password_confirmation && data.password_confirmation ? 'รหัสผ่านไม่ตรงกัน' : '')}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: <InputAdornment position="start"><Key color={data.password_confirmation ? (data.password === data.password_confirmation ? 'success' : 'error') : 'primary'} fontSize="small"/></InputAdornment>,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} edge="end">
                                                                    {showConfirm ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            <Alert severity="info" sx={{borderRadius: 2}}>
                                ระบบจะกำหนดสิทธิ์เมนู <strong>แจ้งซ่อม (ร้านค้า)</strong> ให้ผู้ใช้นี้โดยอัตโนมัติ
                            </Alert>

                            <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                <Button variant="outlined" component={Link} href={route('admin.dealer-shops.index')}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={processing}
                                    startIcon={processing && <CircularProgress size={18} color="inherit"/>}
                                >
                                    บันทึก
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}
