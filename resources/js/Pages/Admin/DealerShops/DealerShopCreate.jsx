import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, Link, useForm} from "@inertiajs/react";
import {
    Alert,
    Autocomplete,
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
    Tooltip,
    Typography,
} from "@mui/material";
import { CheckCircle, HelpOutline, ErrorOutline } from "@mui/icons-material";
import {AccountCircle, AlternateEmail, Key, Store, Visibility, VisibilityOff} from "@mui/icons-material";
import {useState, useRef} from "react";
import axios from "axios";

export default function DealerShopCreate({ sale_list = [] }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupStatus, setLookupStatus] = useState(null); // 'found' | 'not_found' | 'error'
    const lookupTimer = useRef(null);
    const [emailPrefix, setEmailPrefix] = useState('');

    const {data, setData, post, processing, errors} = useForm({
        // ข้อมูลร้านค้า
        is_code_cust_id: '',
        shop_name: '',
        phone: '',
        address: '',
        sale_id: '',
        // ข้อมูลผู้ใช้แรก
        user_code: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleIsCodeChange = (e) => {
        const value = e.target.value;
        setData('is_code_cust_id', value);
        setLookupStatus(null);

        clearTimeout(lookupTimer.current);
        if (!value.trim()) return;

        lookupTimer.current = setTimeout(async () => {
            setLookupLoading(true);
            try {
                const { data: res } = await axios.get(route('admin.dealer-shops.lookup-cust', value.trim()));
                if (res.found) {
                    setData(prev => ({
                        ...prev,
                        shop_name: res.shop_name || prev.shop_name,
                        phone:     res.phone     || prev.phone,
                        address:   res.address   || prev.address,
                    }));
                    setLookupStatus('found');
                } else {
                    setLookupStatus('not_found');
                }
            } catch {
                setLookupStatus('error');
            } finally {
                setLookupLoading(false);
            }
        }, 600);
    };

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
                                            <TextField
                                                size="small" fullWidth required
                                                label="รหัสร้านค้า (IS Code)"
                                                value={data.is_code_cust_id}
                                                onChange={handleIsCodeChange}
                                                error={!!errors.is_code_cust_id}
                                                helperText={errors.is_code_cust_id || 'ระบบจะดึงข้อมูลจากฐานข้อมูลให้อัตโนมัติ'}
                                                slotProps={{
                                                    htmlInput: {maxLength: 50},
                                                    input: {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                {lookupLoading && <CircularProgress size={18} />}
                                                                {!lookupLoading && lookupStatus === 'found' && (
                                                                    <Tooltip title="พบข้อมูลและดึงมาแล้ว">
                                                                        <CheckCircle color="success" fontSize="small" />
                                                                    </Tooltip>
                                                                )}
                                                                {!lookupLoading && lookupStatus === 'not_found' && (
                                                                    <Tooltip title="ไม่พบรหัสนี้ในระบบ DBCTL">
                                                                        <HelpOutline color="warning" fontSize="small" />
                                                                    </Tooltip>
                                                                )}
                                                                {!lookupLoading && lookupStatus === 'error' && (
                                                                    <Tooltip title="ไม่สามารถเชื่อมต่อฐานข้อมูลได้">
                                                                        <ErrorOutline color="error" fontSize="small" />
                                                                    </Tooltip>
                                                                )}
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
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
                                        <Grid2 size={{xs: 12, sm: 6}}>
                                            <Autocomplete
                                                options={sale_list}
                                                getOptionLabel={(o) => `${o.name} (${o.sale_code})`}
                                                value={sale_list.find(s => s.sale_code === data.sale_id) || null}
                                                onChange={(_, v) => setData('sale_id', v?.sale_code || '')}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        label="เซลล์ประจำร้าน"
                                                        error={!!errors.sale_id}
                                                        helperText={errors.sale_id || 'ไม่บังคับ'}
                                                    />
                                                )}
                                            />
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
                                                value={emailPrefix}
                                                onChange={(e) => {
                                                    const prefix = e.target.value.replace('@', '');
                                                    setEmailPrefix(prefix);
                                                    setData('email', prefix ? `${prefix}@dealers` : '');
                                                }}
                                                error={!!errors.email}
                                                helperText={errors.email || `อีเมลที่ได้: ${emailPrefix ? `${emailPrefix}@dealers` : '-'}`}
                                                slotProps={{input: {
                                                    startAdornment: <InputAdornment position="start"><AlternateEmail color="primary" fontSize="small"/></InputAdornment>,
                                                    endAdornment: <InputAdornment position="end"><Typography variant="body2" color="text.secondary">@dealers</Typography></InputAdornment>,
                                                }}}
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
